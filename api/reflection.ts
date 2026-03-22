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
    const decision = body.decision;
    const answers = body.answers;

    if (!decision || typeof decision !== "string") {
      return res.status(400).json({
        success: false,
        error: "decision is required",
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        error: "answers is required",
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
你是一个理性、温和、克制的思考陪伴者。

你的任务不是替用户做决定，而是帮助用户更清楚地看见：
- 自己真正的顾虑
- 自己已经显露出的偏好
- 当前犹豫背后的冲突
- 下一步可以怎么继续想清楚

你必须严格返回 JSON，格式如下：
{
  "summary": "用2到3句话总结用户当前的真实状态，重点写人，而不是重复问题本身",
  "insights": [
    "用户可能没有完全说出口、但从回答中可以看出的心理冲突或真实偏好",
    "洞察2",
    "洞察3"
  ],
  "suggestions": [
    "可以在短时间内执行的小行动，用来帮助用户进一步澄清自己的想法",
    "建议2",
    "建议3"
  ],
  "closing": "一句克制、具体、不鸡汤的收尾"
}

要求：
- 只返回合法 JSON
- 不要返回解释文字
- 不要返回 markdown
- 不要返回代码块
- insights 和 suggestions 都至少 3 条
- 每条 insight 必须具体，不能空泛
- 每条 suggestion 必须小而可执行，尽量能在1天内完成
- 不要替用户做决定
- 不要说教
- 不要重复用户原话
- 避免使用空泛表达，如：人生、成长、意义、重要的是、你应该、其实你早就知道
            `.trim(),
          },
          {
            role: "user",
            content: `
用户正在思考这个问题：
${decision}

这是他对澄清问题的回答：
${JSON.stringify(answers, null, 2)}

请基于这些回答，输出 summary、insights、suggestions 和 closing。

重点：
- 优先识别用户真实在意的东西，而不是表面选项
- 优先识别犹豫背后的冲突、代价或顾虑
- 建议要小而具体，不要宏大
`.trim()
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

    const parsed = extractJsonFromText(content);

    if (!parsed) {
      return res.status(200).json({
        success: false,
        error: "模型返回内容无法解析为 JSON",
        raw: content,
      });
    }

    const normalized = {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      insights: Array.isArray(parsed.insights)
        ? parsed.insights.filter((v: any) => typeof v === "string")
        : [],
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((v: any) => typeof v === "string")
        : [],
      closing: typeof parsed.closing === "string" ? parsed.closing : "",
    };

    if (
      !normalized.summary ||
      normalized.insights.length === 0 ||
      normalized.suggestions.length === 0
    ) {
      return res.status(200).json({
        success: false,
        error: "模型返回内容缺少必要字段",
        raw: content,
      });
    }

    return res.status(200).json({
      success: true,
      data: normalized,
    });
  } catch (error: any) {
    console.error("reflection api crashed:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || String(error) || "Internal Server Error",
    });
  }
}
