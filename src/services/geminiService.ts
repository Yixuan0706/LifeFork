export interface Question {
  id: string;
  title: string;
  type: "multi" | "single" | "text";
  options?: string[];
}

export interface ClarificationResponse {
  options: string[];
  questions: Question[];
}

export interface ReflectionResponse {
  summary: string;
  insights: string[];
  suggestions: string[];
  closing: string;
}

export async function generateClarificationAndQuestions(
  decision: string
): Promise<ClarificationResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: decision,
    }),
  });

  const result = await res.json();
  console.log("[generateClarificationAndQuestions] /api/chat result:", result);

  if (!result.success) {
    throw new Error(result.error || "生成澄清问题失败");
  }

  return result.data;
}

export async function generateReflection(
  decision: string,
  answers: Record<string, any>
): Promise<ReflectionResponse> {
  console.log("=== NEW generateReflection 已执行 ===");

  const res = await fetch("/api/reflection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      decision,
      answers,
    }),
  });

  const result = await res.json();
  console.log("[generateReflection] /api/reflection result:", result);

  if (!result.success) {
    throw new Error(result.error || "生成洞察失败");
  }

  return result.data;
}
