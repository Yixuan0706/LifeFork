export interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "single_choice" | "text";
  choices?: string[];
}

export interface ClarificationResponse {
  options: string[];
  questions: Question[];
}

export interface DecisionProfile {
  exploration: string;
  anchoring: string;
  uncertainty: string;
  timeHorizon: string;
}

export interface FuturePath {
  name: string;
  milestones: { year: string; event: string }[];
  emotionalTrajectory: string;
  possibleRegret: string;
}

export interface ReflectionResponse {
  profile: DecisionProfile;
  coreConflict: string;
  paths: FuturePath[];
  keyInsight: string;
  philosophicalClosing: string;
  futureSelf: string;
}

async function callChatApi(prompt: string) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${res.status} ${text}`);
  }

  return await res.json();
}

function extractTextFromResponse(data: any): string {
  return (
    data.reply ||
    data.content ||
    data.text ||
    data.output ||
    data.choices?.[0]?.message?.content ||
    ""
  );
}

export async function generateClarificationAndQuestions(
  decision: string
): Promise<ClarificationResponse> {
  const prompt = `用户正在思考一个人生决定：“${decision}”。

请返回 JSON，不要返回 markdown，不要加代码块。

JSON 结构必须是：
{
  "options": ["选项1", "选项2"],
  "questions": [
    {
      "id": "q1",
      "text": "问题内容",
      "type": "text"
    }
  ]
}

要求：
1. 提取这个决定的 2-3 个可能选项
2. 生成 5-6 个问题
3. 全部使用简体中文
4. 输出必须是合法 JSON`;

  const fullPrompt = `你是一个擅长结构化输出的中文人生决策助手。

${prompt}`;

  const data = await callChatApi(fullPrompt);
  const text = extractTextFromResponse(data);

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Clarification parse failed:", text);
    throw new Error("返回不是合法 JSON");
  }
}

export async function generateReflection(
  decision: string,
  answers: Record<string, any>
): Promise<ReflectionResponse> {
  const prompt = `用户正在反思这个决定：“${decision}”。

回答如下：
${JSON.stringify(answers, null, 2)}

请返回 JSON，结构同前。`;

  const fullPrompt = `你是一个深思熟虑的中文决策助手。

${prompt}`;

  const data = await callChatApi(fullPrompt);
  const text = extractTextFromResponse(data);

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Reflection parse failed:", text);
    throw new Error("返回不是合法 JSON");
  }
}
