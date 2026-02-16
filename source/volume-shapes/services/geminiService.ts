
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const getClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Image Editing with gemini-2.5-flash-image
export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<GenerateContentResponse> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
  return response;
};

// Image Generation with imagen-4.0-generate-001
export const generateImage = async (prompt: string) => {
  const ai = getClient();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: '1:1',
    },
  });
  return response;
};

// Video Generation with veo-3.1-fast-generate-preview
export const generateVideo = async (base64Image: string, mimeType: string, prompt: string, aspectRatio: '16:9' | '9:16') => {
  const ai = getClient();
  const operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: base64Image,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    },
  });
  return operation;
};

export const pollVideoStatus = async (operation: any) => {
    const ai = getClient();
    return await ai.operations.getVideosOperation({ operation: operation });
};


// Web Search with gemini-2.5-flash
export const groundedSearch = async (query: string): Promise<GenerateContentResponse> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return response;
};
