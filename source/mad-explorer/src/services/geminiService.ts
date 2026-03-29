import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Initialize with the environment variable
const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateTutorResponse = async (userQuestion: string, context: string) => {
  const ai = getAI();
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite-latest",
    contents: [
      {
        role: "user",
        parts: [{ text: `You are a helpful math tutor specializing in Mean Absolute Deviation (M.A.D). 
        Context: ${context}
        Student Question: ${userQuestion}
        Provide a clear, encouraging, and simple explanation.` }]
      }
    ],
    config: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    }
  });
  return response.text;
};

export const generateMathImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  const ai = getAI();
  const isPro = size !== "1K";
  
  const config: any = {
    imageConfig: {
      aspectRatio: "16:9",
    },
  };

  if (isPro) {
    config.imageConfig.imageSize = size;
  }

  const response = await ai.models.generateContent({
    model: isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A educational illustration for a math lesson about Mean Absolute Deviation: ${prompt}. Clean, modern, professional educational style.`,
        },
      ],
    },
    config
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
