import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
    }

    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const message = body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
    });

    return res.status(200).json({
      text: result?.text ?? "",
    });
  } catch (error: any) {
    console.error("API error:", error);
    return res.status(500).json({
      error: error?.message || String(error) || "Internal Server Error",
    });
  }
}
