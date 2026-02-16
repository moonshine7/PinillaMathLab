
import { GoogleGenAI, Type } from "@google/genai";
import { LessonType, Question, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      text: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      correctAnswer: { type: Type.INTEGER },
      explanation: { type: Type.STRING },
      data: { 
        type: Type.OBJECT, 
        properties: {
          x1: { type: Type.NUMBER },
          y1: { type: Type.NUMBER },
          x2: { type: Type.NUMBER },
          y2: { type: Type.NUMBER },
          a: { type: Type.NUMBER },
          b: { type: Type.NUMBER },
          c: { type: Type.NUMBER },
          visualType: { type: Type.STRING, description: "'plane' or 'triangle'" }
        }
      }
    },
    required: ["id", "text", "options", "correctAnswer", "explanation"]
  }
};

export const generateQuestions = async (type: LessonType, difficulty: Difficulty, count: number = 5): Promise<Question[]> => {
  const difficultyPrompt = {
    [Difficulty.EASY]: "Use small integers (1-10), common Pythagorean triples (3-4-5), and straightforward side-finding tasks.",
    [Difficulty.MEDIUM]: "Use larger integers (11-50), non-integer results (round to 1 decimal), and word problems like finding the diagonal of a rectangle or a box.",
    [Difficulty.HARD]: "Use challenging multi-step problems, negative coordinates in all 4 quadrants, 3D Pythagorean applications (finding the space diagonal of a prism), and converse questions with complex square root comparisons."
  };

  const prompt = `Generate ${count} math questions for the topic: ${type} at a ${difficulty.toUpperCase()} difficulty level.
    ${difficultyPrompt[difficulty]}
    
    Topic focus:
    - THEOREM: Find missing legs or hypotenuse in standard triangles.
    - CONVERSE: Determine if a triangle is a right triangle.
    - COORDINATE_GEOMETRY: EXCLUSIVELY grid-based problems. E.g., 'A fire station is at (x1, y1) and a house is at (x2, y2). How long is the straight-line distance?'. You MUST provide x1, y1, x2, y2.
    - DISTANCE: Pure algebraic distance formula application.
    - FINAL_EXAM: A comprehensive mix.
    
    Important:
    - For COORDINATE_GEOMETRY, always set visualType to 'plane'.
    - Ensure explanations show step-by-step $a^2 + b^2 = c^2$ math.
    - For coordinates, use values between -9 and 9 to ensure they fit the visualizer grid.
    - Format response as valid JSON matching the provided schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
      },
    });

    const jsonStr = response.text || '[]';
    const parsedQuestions = JSON.parse(jsonStr);
    
    return parsedQuestions.map((q: any) => ({
      ...q,
      type
    }));
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
};
