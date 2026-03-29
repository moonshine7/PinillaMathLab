import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getFastResponse = async (prompt: string, context: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `Context: ${context}\n\nUser Question: ${prompt}`,
    config: {
      systemInstruction: "You are a helpful math tutor specializing in surface area. Keep responses concise and encouraging.",
    },
  });
  return response.text;
};

export const getSearchResponse = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are a math expert. Use Google Search to find real-world applications or historical context for surface area calculations.",
    },
  });
  return response.text;
};

export const generateShapeImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [{ text: `A clean, educational 3D diagram of ${prompt}. White background, professional math textbook style.` }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
