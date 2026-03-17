import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

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

    const response = await client.chat.completions.create({
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
      temperature: 0.7,
    });

    const text = response.choices?.[0]?.message?.content ?? "";

    return res.status(200).json({ text });
  } catch (error: any) {
    const msg = error?.message || "Internal Server Error";
    return res.status(500).json({ error: msg });
  }
}
