import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export async function generateClarificationAndQuestions(decision: string): Promise<ClarificationResponse> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `用户正在思考一个人生决定："${decision}"。
    
    1. 提取出这个决定的2-3个可能的选项。
    2. 生成5-6个问题，以了解用户的动机、犹豫和偏好。
       - 包含他们为什么考虑这个决定，为什么犹豫。
       - 包含偏好问题，如工作风格、风险承受能力等。
       - 适当时使用 multiple_choice（多选）或 single_choice（单选）。
    
    重要：请全部使用简体中文回答。保持语气平静、深思熟虑且富有内省感。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Possible options extracted from the decision"
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["multiple_choice", "single_choice", "text"] },
                choices: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["id", "text", "type"]
            }
          }
        },
        required: ["options", "questions"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateReflection(decision: string, answers: Record<string, any>): Promise<ReflectionResponse> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `用户正在反思这个决定："${decision}"。
    以下是他们对动机问题的回答：
    ${JSON.stringify(answers, null, 2)}
    
    分析他们的内心侧写并生成一份沉思报告。
    1. 总结他们的内心侧写（探索的渴望、安稳的锚定、对未知的容纳、时间的刻度）。请用一两句富有诗意和哲理的中文句子来描述每一项，而不是简单的“高/中/低”。例如：“你的目光越过了当下的喧嚣，投向了更远的岁月。”
    2. 识别他们内心的核心张力或冲突。
    3. 生成2-3条可能的未来路径（包含时间线、情绪轨迹、潜在的遗憾）。注意：不需要契合度分数。
    4. 提供一个关键洞察。如果你认为当前的选项都不太理想，或者有更好的方式来满足用户的深层需求，请在这里给出一个**更好的替代建议**。语气要引人深思。
    5. 以一段富有哲理的寄语结束。
    6. 写一封来自未来的信。开头必须是“亲爱的现在的我：”，用第一人称（未来的你）对第二人称（现在的你）说话。根据前面的分析，给出一段真诚、温暖、透彻的寄语，字数在150-300字左右。
    
    重要：请全部使用简体中文回答。语气应像一位平静、深思熟虑的人生导师，富有诗意和哲理，而不是充满激情的励志教练。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          profile: {
            type: Type.OBJECT,
            properties: {
              exploration: { type: Type.STRING },
              anchoring: { type: Type.STRING },
              uncertainty: { type: Type.STRING },
              timeHorizon: { type: Type.STRING }
            },
            required: ["exploration", "anchoring", "uncertainty", "timeHorizon"]
          },
          coreConflict: { type: Type.STRING },
          paths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                milestones: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      year: { type: Type.STRING },
                      event: { type: Type.STRING }
                    },
                    required: ["year", "event"]
                  }
                },
                emotionalTrajectory: { type: Type.STRING },
                possibleRegret: { type: Type.STRING }
              },
              required: ["name", "milestones", "emotionalTrajectory", "possibleRegret"]
            }
          },
          keyInsight: { type: Type.STRING },
          philosophicalClosing: { type: Type.STRING },
          futureSelf: { type: Type.STRING }
        },
        required: ["profile", "coreConflict", "paths", "keyInsight", "philosophicalClosing", "futureSelf"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
