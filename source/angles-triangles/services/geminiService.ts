import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, GroundingChunk, AspectRatio, ImageSize } from "../types";

// Helper to get the correct API key instance
// We use process.env.API_KEY by default.
// For specific high-end models that require user-selected keys, the component will handle the check.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateTutorResponse = async (
  history: ChatMessage[],
  newMessage: string,
  context: string,
  useSearch: boolean = false
): Promise<{ text: string; sources?: string[] }> => {
  const ai = getAIClient();
  
  const systemInstruction = `You are GeoBot, an enthusiastic and expert geometry tutor. 
  You are helping a student understand Parallel Lines, Transversals, and Triangle Theorems.
  Current Context: ${context}.
  
  Rules:
  1. Be encouraging and clear.
  2. Use simple language but correct terminology (e.g., "Alternate Interior Angles").
  3. If math is involved, show step-by-step logic.
  4. If the user asks for real-world examples, provide them.
  `;

  try {
    const modelId = useSearch ? 'gemini-2.5-flash' : 'gemini-2.5-flash';
    
    const config: any = {
        systemInstruction,
    };

    if (useSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    const chat = ai.chats.create({
      model: modelId,
      config
    });

    // Replay history slightly simplified for context window if needed, 
    // but for this demo we'll just send the new message with the assumption 
    // the chat object maintains session if we were persisting it properly. 
    // Since we create a new chat each time here for statelessness in this service function:
    
    // Construct history for the stateless call:
    const historyMessages = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
    }));

    const result = await chat.sendMessage({
        message: newMessage,
    });

    let sources: string[] = [];
    if (useSearch && result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        const chunks = result.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
        sources = chunks
            .filter(c => c.web?.uri)
            .map(c => c.web!.uri);
    }

    return {
      text: result.text || "I'm having trouble thinking of an answer right now.",
      sources
    };

  } catch (error) {
    console.error("Gemini Tutor Error:", error);
    throw error;
  }
};

export const analyzeMathProblem = async (file: File): Promise<string> => {
  const ai = getAIClient();
  
  // Convert File to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
  // Strip the data:image/png;base64, part
  const base64Content = base64Data.split(',')[1];
  const mimeType = file.type;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Vision capable
      contents: {
        parts: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Content
                }
            },
            {
                text: "Analyze this geometry problem. Identify the geometric figures, known values, and the unknown variable. Then, solve it step-by-step explaining the theorems used (e.g. Triangle Sum Theorem, Alternate Interior Angles)."
            }
        ]
      }
    });
    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const generateGeometryImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize
): Promise<string> => {
  // Check for paid key capability if strictly required, but using standard env key for demo flow.
  // In a production app with 'gemini-3-pro-image-preview', we might need window.aistudio.
  
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: imageSize
            }
        }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};
