import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ReviewResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "Video Editing Learning Coach" (视频剪辑学习教练). Your goal is to help beginners learn video editing by deconstructing specific video examples.
You must be strict, structured, and action-oriented.
Avoid vague advice. Provide specific timestamps, metrics, and actionable steps.
Your output must be structured JSON.
IMPORTANT: All textual content within the JSON (descriptions, lists, feedback, plans) MUST be in Simplified Chinese (简体中文).
`;

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:video/mp4;base64,")
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
  },
};

export const analyzeVideo = async (file: File, context: string): Promise<AnalysisResult> => {
  const base64Data = await fileToGenerativePart(file);

  // Updated to 'gemini-3-pro-preview' which is robust for complex multimodal tasks like video analysis.
  const modelName = "gemini-3-pro-preview";

  const prompt = `
  Analyze this video. The user provided this context: "${context}".
  
  Perform a deep "Learning Coach" analysis.
  1. Create a Case Card.
  2. Determine if it's worth learning (Verdict).
  3. Breakdown the Structure (Timeline).
  4. Analyze the Editing DNA (Pacing, Sound).
  5. Create a detailed Shot List (first 10-15 key shots or full video if short).
  6. Extract the 'SOP' (Standard Operating Procedure) - the rules to replicate this style.
  7. Create a fill-in-the-blank Script Template based on the video's narrative arc.
  8. Define a Homework Brief for the student to replicate this.
  
  Return ONLY JSON matching the schema. Ensure all values are in Simplified Chinese.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
        { text: prompt },
      ],
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
    // Updated to 'gemini-3-pro-preview' for consistency and capability.
    const modelName = "gemini-3-pro-preview";

    const prompt = `
    The student has submitted a homework video based on a case study.
    Here is the context/style they were supposed to copy: ${originalContext}.
    
    Review the video in the attachment (the student's work).
    Compare it to the high standards of the original style described.
    
    Output a review with a score (1-100), general feedback, and a prioritized revision plan (max 10 items).
    Ensure all values are in Simplified Chinese.
    `;

    const response = await ai.models.generateContent({
        model: modelName,
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: homeworkFile.type,
                        data: base64Data
                    }
                },
                { text: prompt }
            ]
        },
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: reviewSchema
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as ReviewResult;
}