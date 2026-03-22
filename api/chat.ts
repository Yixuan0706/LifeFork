export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Method Not Allowed",
      });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Server missing DEEPSEEK_API_KEY",
      });
    }

    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const decision = body.decision || body.message;

    if (!decision || typeof decision !== "string") {
      return res.status(400).json({
        success: false,
        error: "decison is required",
      });
    }

    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `
你是一个帮助用户梳理复杂人生选择的决策澄清助手。

你的任务不是直接给建议，而是先帮用户更清楚地看见：
- 自己已经偏向哪一边
- 自己真正顾虑的是什么
- 自己更想成为什么样的人

请根据用户提出的决策问题，生成：
1. 候选选项 options
2. 6 个有层次的澄清问题 questions

你必须严格返回 JSON，格式如下：
{
  "options": ["选项A", "选项B"],
  "questions": [
    {
      "id": "q1",
      "title": "问题内容",
      "type": "single",
      "options": ["选项1", "选项2"]
    },
    {
      "id": "q2",
      "title": "问题内容",
      "type": "single",
      "options": ["选项1", "选项2"]
    },
    {
      "id": "q3",
      "title": "问题内容",
      "type": "multi",
      "options": ["选项1", "选项2", "选项3", "选项4"]
    },
    {
      "id": "q4",
      "title": "问题内容",
      "type": "text"
    },
    {
      "id": "q5",
      "title": "问题内容",
      "type": "single",
      "options": ["选项1", "选项2", "选项3", "选项4"]
    },
    {
      "id": "q6",
      "title": "问题内容",
      "type": "text"
    }
  ]
}

问题设计要求：
- 一共固定 6 个问题
- 文本题最多 2 个，不能超过 2 个
- 题型结构固定为：single、single、multi、text、single、text
- 问题必须分成三层：
  1. 偏好层：帮助识别用户已经偏向哪个方向
  2. 顾虑层：帮助识别用户害怕什么、在犹豫什么
  3. 身份层：帮助识别用户想成为怎样的人、想过怎样的生活
- 6 个问题要有节奏：前 2 题轻一点、直觉一点；中间 2 题进入顾虑；最后 2 题再进入更深的自我认同和未来想象
- 每个问题都要让用户第一遍都能读懂，不要过于抽象
- 不要像心理测试题
- 一个问题里只问一件事，不要把两个判断塞进同一句话
- 不要使用过于宏大或说教的表述，不要故意写的很深奥
- 问题要围绕用户的真实决策，而不是泛泛谈价值观

options 生成要求：
- 如果用户的问题天然包含两个明显方向，请给出两个最主要的候选选项
- 如果不止两个方向，也请优先提炼出最核心的两个方向
- options 要简洁、自然、能直接用于后续判断

额外要求：
- 只返回合法 JSON
- 不要返回解释文字
- 不要返回 markdown
- 不要返回代码块
- type 只能是 "text"、"single"、"multi"
`.trim(),
          },
          {
            role: "user",
            content: `用户正在思考这个决定：${decision}`,
          },
        ],
        stream: false,
        temperature: 0.6,
      }),
    });

    const raw = await dsRes.text();

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        success: false,
        error: `DeepSeek 没有返回 JSON: ${raw}`,
      });
    }

    if (!dsRes.ok) {
      return res.status(dsRes.status).json({
        success: false,
        error: data?.error?.message || "DeepSeek request failed",
        details: data,
      });
    }

    const content = data?.choices?.[0]?.message?.content ?? "";

    function safeParseJSON(text: string) {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    }

    function extractJsonFromText(text: string) {
      if (!text || typeof text !== "string") return null;

      const cleaned = text
        .replace(/```json\s*/gi, "")
        .replace(/```/g, "")
        .trim();

      const direct = safeParseJSON(cleaned);
      if (direct) return direct;

      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        return safeParseJSON(match[0]);
      }

      return null;
    }

    function normalizeQuestions(rawQuestions: any) {
  if (!Array.isArray(rawQuestions)) return [];

  return rawQuestions.map((item: any, index: number) => {
    const type =
      item?.type === "single" ||
      item?.type === "multi" ||
      item?.type === "text"
        ? item.type
        : "text";

    const normalizedOptions = Array.isArray(item?.options)
      ? item.options.filter((v: any) => typeof v === "string")
      : [];

    return {
      id: typeof item?.id === "string" ? item.id : `q${index + 1}`,
      title:
        typeof item?.title === "string"
          ? item.title
          : typeof item?.question === "string"
          ? item.question
          : `问题 ${index + 1}`,
      type,
      options: type === "text" ? undefined : normalizedOptions,
    };
  });
}
    const parsed = extractJsonFromText(content);

    if (!parsed) {
      return res.status(200).json({
        success: false,
        error: "模型返回内容无法解析为 JSON",
        raw: content,
      });
    }

    const options = Array.isArray(parsed?.options)
      ? parsed.options.filter((v: any) => typeof v === "string")
      : [];

    const questions = normalizeQuestions(parsed?.questions);

    if (!questions.length) {
      return res.status(200).json({
        success: false,
        error: "模型返回内容缺少 questions 数组",
        raw: content,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        options,
        questions,
      },
    });
  } catch (error: any) {
    console.error("chat api crashed:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || String(error) || "Internal Server Error",
    });
  }
}
