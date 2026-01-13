import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ReviewResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "Video Editing Learning Coach" (视频剪辑学习教练). Your goal is to help beginners learn video editing by deconstructing specific video examples.
You must be strict, structured, and action-oriented.
Avoid vague advice. Provide specific timestamps, metrics, and actionable steps.
Your output must be structured JSON.
IMPORTANT: All textual content within the JSON (descriptions, lists, feedback, plans, visual suggestions) MUST be in Simplified Chinese (简体中文).
`;

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    caseCard: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        platform: { type: Type.STRING },
        duration: { type: Type.STRING },
        targetAudience: { type: Type.STRING },
        learningPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        risks: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    verdict: {
      type: Type.OBJECT,
      properties: {
        worthLearning: { type: Type.BOOLEAN },
        reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
        alternative: { type: Type.STRING },
      },
    },
    structure: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          segment: { type: Type.STRING },
          timestamp: { type: Type.STRING },
          purpose: { type: Type.STRING },
          psychology: { type: Type.STRING },
          visualStrategy: { type: Type.STRING },
        },
      },
    },
    dna: {
      type: Type.OBJECT,
      properties: {
        avgShotLength: { type: Type.STRING },
        pacing: { type: Type.STRING },
        soundStrategy: { type: Type.STRING },
      },
    },
    shotList: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.NUMBER },
          timeRange: { type: Type.STRING },
          duration: { type: Type.STRING },
          visual: { type: Type.STRING },
          audio: { type: Type.STRING },
          action: { type: Type.STRING },
        },
      },
    },
    sop: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rule: { type: Type.STRING },
          howTo: { type: Type.STRING },
          example: { type: Type.STRING },
        },
      },
    },
    scriptTemplate: {
      type: Type.OBJECT,
      properties: {
        hook: { type: Type.STRING },
        setup: { type: Type.STRING },
        core1: { type: Type.STRING },
        core2: { type: Type.STRING },
        twist: { type: Type.STRING },
        cta: { type: Type.STRING },
      },
    },
    homework: {
      type: Type.OBJECT,
      properties: {
        goal: { type: Type.STRING },
        constraints: { type: Type.STRING },
        rubric: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              criteria: { type: Type.STRING },
              description: { type: Type.STRING },
              maxScore: { type: Type.NUMBER },
            },
          },
        },
      },
    },
  },
};

const reviewSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
    revisionPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          problem: { type: Type.STRING },
          solution: { type: Type.STRING },
          example: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
        },
      },
    },
    suggestedShotList: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scriptSegment: { type: Type.STRING },
          visualSuggestion: { type: Type.STRING },
          shotType: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        }
      }
    }
  },
};

export const analyzeVideo = async (file: File, context: string): Promise<AnalysisResult> => {
  const base64Data = await fileToGenerativePart(file);
  const modelName = "gemini-3-pro-preview";

  const prompt = `
  Analyze this video. The user provided this context: "${context}".
  Deep "Learning Coach" analysis for video creation. Return ONLY JSON. Simplified Chinese.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [{ inlineData: { mimeType: file.type, data: base64Data } }, { text: prompt }],
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as AnalysisResult;
};

export const reviewHomework = async (originalContext: string, homeworkFile: File): Promise<ReviewResult> => {
    const base64Data = await fileToGenerativePart(homeworkFile);
    const modelName = "gemini-3-pro-preview";
    const prompt = `Review the video in attachment against this style: ${originalContext}. Return JSON. Simplified Chinese.`;
    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [{ inlineData: { mimeType: homeworkFile.type, data: base64Data } }, { text: prompt }] },
        config: { systemInstruction: SYSTEM_INSTRUCTION, responseMimeType: "application/json", responseSchema: reviewSchema },
    });
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as ReviewResult;
};

export const reviewScript = async (originalContext: string, userScript: string): Promise<ReviewResult> => {
    const modelName = "gemini-3-pro-preview";
    const prompt = `
    The student has submitted a SCRIPT instead of a video.
    Context/Target Style: ${originalContext}.
    User Script: "${userScript}".
    
    1. Review if this script captures the hook, pacing, and structure of the original style.
    2. Provide a score and a prioritized revision plan.
    3. IMPORTANT: Generate a suggested visual shot list (suggestedShotList) that maps the user's script to the visual style of the original reference video.
    
    Return ONLY JSON. Simplified Chinese.
    `;
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { systemInstruction: SYSTEM_INSTRUCTION, responseMimeType: "application/json", responseSchema: reviewSchema },
    });
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as ReviewResult;
}