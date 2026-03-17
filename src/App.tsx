import { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const raw = await response.text();
      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`后端没有返回 JSON：${raw}`);
      }

      if (!response.ok) {
        throw new Error(data?.error || "请求失败");
      }

      setResult(data.text || "");
    } catch (err: any) {
      setError(err?.message || "发生未知错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>小径分岔</h1>
      <p style={{ marginBottom: 16 }}>输入一句话，测试后端 Gemini 调用是否正常。</p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          border: "1px solid #ccc",
          borderRadius: 8,
          marginBottom: 12,
        }}
        placeholder="比如：我在两个 offer 之间犹豫，请帮我分析。"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !message.trim()}
        style={{
          padding: "10px 16px",
          fontSize: 16,
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {loading ? "思考中..." : "发送"}
      </button>

      {error && (
        <div style={{ marginTop: 16, color: "crimson" }}>
          错误：{error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#f6f6f6",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
