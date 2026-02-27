
import { GoogleGenAI, Type } from "@google/genai";
import { GroundingSource, Problem, TestAssessment } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTutorExplanation = async (userPrompt: string, context?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful 8th-grade math tutor. Explain scientific notation clearly.
      User question: ${userPrompt}
      Current lesson context: ${context || 'General scientific notation'}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my brain right now! Let's try again in a second.";
  }
};

export const generateFullAssessment = async (): Promise<TestAssessment | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a full 10-question math test for 8th graders on Scientific Notation. 
      Include a mix of:
      - 5 questions on large numbers (positive powers)
      - 5 questions on small numbers (negative powers)
      - Mix of standard to scientific and scientific to standard conversions.
      - 2 questions must be real-world word problem scenarios.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            problems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "'toScientific' or 'toStandard'" },
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  scenario: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  difficulty: { type: Type.STRING }
                },
                required: ["type", "question", "answer", "hint", "difficulty"]
              }
            }
          },
          required: ["title", "problems"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: result.title,
      problems: result.problems.map((p: any) => ({ ...p, id: Math.random().toString(36).substr(2, 5) })),
      createdAt: Date.now()
    };
  } catch (error) {
    console.error("Assessment Gen Error:", error);
    return null;
  }
};

export const generateDynamicWordProblem = async (excludedScenarios: string[]): Promise<Problem | null> => {
  const themes = ['Astronomy', 'Microbiology', 'Quantum Physics', 'Global Economics', 'Oceanography', 'Entomology'];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a unique 8th-grade level math word problem about ${theme} that requires converting between standard and scientific notation. 
      Avoid these previous scenarios: ${excludedScenarios.join(', ')}.
      The problem should be realistic and scientifically accurate.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: "Either 'toScientific' or 'toStandard'" },
            question: { type: Type.STRING, description: "The numerical value to convert (e.g., '0.000045' or '4.5 x 10^-5')" },
            answer: { type: Type.STRING, description: "The correct converted value in the format '4.5x10^-5' or '0.000045'" },
            scenario: { type: Type.STRING, description: "A 1-2 sentence real-world scenario description." },
            context: { type: Type.STRING, description: "A single word category like 'Astronomy'" },
            hint: { type: Type.STRING, description: "A helpful tip about moving the decimal point." },
            difficulty: { type: Type.STRING, description: "easy, medium, or hard" },
            imagePrompt: { type: Type.STRING, description: "A detailed prompt for an image generator to visualize this scenario." }
          },
          required: ["type", "question", "answer", "scenario", "context", "hint", "difficulty", "imagePrompt"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...result
    };
  } catch (error) {
    console.error("Problem Generation Error:", error);
    return null;
  }
};

export const generateScenarioImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

export const getRealWorldFact = async (query: string): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find a real-world example of a very large or very small number related to: ${query}. 
      Return the fact and its value in both standard and scientific notation.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || '#'
    })) || [];

    return {
      text: response.text || "Couldn't find a specific fact.",
      sources: sources
    };
  } catch (error) {
    console.error("Search Error:", error);
    return { text: "Search is unavailable right now.", sources: [] };
  }
};
