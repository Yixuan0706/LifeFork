export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server missing DEEPSEEK_API_KEY" });
    }

    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const message = body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个温和、清晰、有洞察力的决策陪伴助手。",
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
        error: `DeepSeek 没有返回 JSON: ${raw}`,
      });
    }

    if (!dsRes.ok) {
      return res.status(dsRes.status).json({
        error: data?.error?.message || "DeepSeek request failed",
        details: data,
      });
    }

    const text = data?.choices?.[0]?.message?.content ?? "";

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("chat api crashed:", error);
    return res.status(500).json({
      error: error?.message || String(error) || "Internal Server Error",
    });
  }
}
