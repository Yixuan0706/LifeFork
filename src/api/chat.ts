import { GoogleGenAI } from "@google/genai";

type VercelRequest = {
  method?: string;
  body?: any;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: any) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body ?? {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
    });

    const text =
      result?.text ??
      "模型没有返回文本内容。";

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return res.status(500).json({
      error: error?.message || "Internal Server Error",
    });
  }
}
