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
你是一个温和、清晰、有洞察力的人生决策陪伴助手。

请根据用户的决策问题和回答内容，生成一份结构化洞察。

你必须严格返回 JSON，格式如下：
{
  "summary": "对当前处境的简洁总结",
  "insights": [
    "洞察1",
    "洞察2",
    "洞察3"
  ],
  "suggestions": [
    "建议1",
    "建议2",
    "建议3"
  ],
  "closing": "一句温和、有力量的收束"
}

要求：
- 只返回合法 JSON
- 不要返回解释文字
- 不要返回 markdown
- 不要返回代码块
- insights 和 suggestions 都至少 3 条
            `.trim(),
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                decision,
                answers,
              },
              null,
              2
            ),
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
