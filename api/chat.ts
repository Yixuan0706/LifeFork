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
    const message = body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "message is required",
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
你是一个人生决策辅助工具。

你的任务是：根据用户提出的人生决定问题，生成：
1. 候选选项 options
2. 澄清问题 questions

你必须严格返回 JSON，格式如下：
{
  "options": ["选项A", "选项B"],
  "questions": [
    {
      "id": "q1",
      "title": "你最在意的是什么？",
      "type": "text"
    },
    {
      "id": "q2",
      "title": "你现在更倾向哪个方向？",
      "type": "single",
      "options": ["方向A", "方向B"]
    },
    {
      "id": "q3",
      "title": "有哪些现实条件会影响你的决定？",
      "type": "text"
    }
  ]
}

要求：
- 只返回合法 JSON
- 不要返回解释文字
- 不要返回 markdown
- 不要返回代码块
- questions 至少 3 个
- type 只能是 "text"、"single"、"multi"
- 如果问题本身只有两个明显选项，也请在 options 中列出来
            `.trim(),
          },
          {
            role: "user",
            content: message,
          },
        ],
        stream: false,
        temperature: 0.7,
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

        return {
          id: typeof item?.id === "string" ? item.id : `q${index + 1}`,
          title:
            typeof item?.title === "string"
              ? item.title
              : typeof item?.question === "string"
              ? item.question
              : `问题 ${index + 1}`,
          type,
          options: Array.isArray(item?.options)
            ? item.options.filter((v: any) => typeof v === "string")
            : undefined,
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
