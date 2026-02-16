import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MathScenario, QuizData } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

const scenarioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy title for the math problem." },
    description: { type: Type.STRING, description: "The full text description of the real-world scenario involving two competing options." },
    equation1: {
      type: Type.OBJECT,
      properties: {
        slope: { type: Type.NUMBER, description: "The slope (m) of the first equation." },
        intercept: { type: Type.NUMBER, description: "The y-intercept (b) of the first equation." },
        name: { type: Type.STRING, description: "Label for the first line (e.g., 'Plan A')." },
        isProportional: { type: Type.BOOLEAN, description: "True if b=0." },
        inequality: { type: Type.STRING, enum: ['=', '>', '<', '>=', '<='], description: "The operator." }
      },
      required: ["slope", "intercept", "name", "isProportional", "inequality"]
    },
    equation2: {
      type: Type.OBJECT,
      properties: {
        slope: { type: Type.NUMBER, description: "The slope (m) of the second equation. Must be different from equation 1." },
        intercept: { type: Type.NUMBER, description: "The y-intercept (b) of the second equation." },
        name: { type: Type.STRING, description: "Label for the second line (e.g., 'Plan B')." },
        isProportional: { type: Type.BOOLEAN, description: "True if b=0." },
        inequality: { type: Type.STRING, enum: ['=', '>', '<', '>=', '<='], description: "The operator." }
      },
      required: ["slope", "intercept", "name", "isProportional", "inequality"]
    },
    intersectionPoint: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.NUMBER, description: "The X coordinate where lines intersect." },
        y: { type: Type.NUMBER, description: "The Y coordinate where lines intersect." }
      },
      required: ["x", "y"]
    },
    realWorldImplication: { type: Type.STRING, description: "A sentence explaining what the intersection point or region represents." },
    comparisonOperator: { type: Type.STRING, enum: ['>', '<', '>=', '<='], description: "The specific inequality symbol used in the problem statement comparing Eq1 and Eq2." }
  },
  required: ["title", "description", "equation1", "equation2", "intersectionPoint", "realWorldImplication"]
};

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
          explanation: { type: Type.STRING },
          topic: { type: Type.STRING, enum: ['Equation', 'Inequality'] }
        },
        required: ["id", "question", "options", "correctAnswerIndex", "explanation", "topic"]
      }
    }
  },
  required: ["title", "questions"]
};

export const generateMathScenario = async (): Promise<MathScenario> => {
  try {
    // Randomize the scenario structure
    const interceptConstraints = [
      "Constraint: One equation must be proportional (y-intercept = 0) and the other non-proportional.",
      "Constraint: Both equations must be non-proportional.",
      "Constraint: Both equations must be proportional."
    ];

    const slopeConstraints = [
      "Constraint: One positive slope, one negative slope.",
      "Constraint: Both positive slopes.",
      "Constraint: Both negative slopes."
    ];

    const selectedIntercept = interceptConstraints[Math.floor(Math.random() * interceptConstraints.length)];
    const selectedSlope = slopeConstraints[Math.floor(Math.random() * slopeConstraints.length)];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a unique, real-world algebra problem involving a system of two linear equations (y = mx + b). 
      
      Requirements:
      1. ${selectedIntercept}
      2. ${selectedSlope}
      3. The operators MUST be '=' (equal sign) for both equations.
      4. The slopes must be different so they intercept.
      5. The intersection point should ideally be at integer or simple decimal coordinates.
      6. Relate it to a situation like: Comparing plans, Filling/Draining, Distances.
      7. Think carefully about the math to ensure the intersection coordinate is correct.
      8. Do NOT set 'comparisonOperator' for standard equation systems.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: scenarioSchema,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    if (!response.text) throw new Error("No text returned from Gemini");
    return JSON.parse(response.text) as MathScenario;

  } catch (error) {
    console.error("Error generating math scenario:", error);
    throw error;
  }
};

export const generateInequalityScenario = async (): Promise<MathScenario> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a real-world algebra problem involving the comparison of two linear expressions, expressed as a one-variable inequality.
      
      Requirements:
      1. **Goal**: Create a scenario where two linear functions are compared (e.g., Plan A vs Plan B).
      2. **Description Format**: The description MUST explicitly include the inequality to be solved in the format: "Expression1 [operator] Expression2" (e.g., "Find x such that 5x + 30 < 6x + 55").
      3. **Vocabulary**: Use variety in the inequality phrasing, such as:
         - "at most", "no more than" (<=)
         - "at least", "no less than", "minimum" (>=)
         - "cheaper than", "less than" (<)
         - "exceeds", "more than", "greater than" (>)
      4. **Equations**: 
         - Equation 1 should correspond to the Left Hand Side of the inequality.
         - Equation 2 should correspond to the Right Hand Side.
         - **CRITICAL**: Set the 'inequality' field for BOTH equations to '='. We want to visualize the solid boundary lines (the functions themselves) so the student can visually see where one is above/below the other.
      5. **Comparison Operator**: Set the 'comparisonOperator' field to the inequality symbol used in requirement 2 (e.g., '<', '>=', etc.).
      6. **Real World Implication**: Explain the solution interval. (e.g., "Since the lines intersect at x=25, Plan A is cheaper when usage is less than 25 minutes").
      7. **Math**: Ensure slopes and intercepts are realistic and intersection is at a positive, simple number.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: scenarioSchema,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    if (!response.text) throw new Error("No text returned from Gemini");
    return JSON.parse(response.text) as MathScenario;

  } catch (error) {
    console.error("Error generating inequality scenario:", error);
    throw error;
  }
};

export const generateMathQuiz = async (): Promise<QuizData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a 20-question multiple choice quiz about Linear Equations and Inequalities.
      
      Requirements:
      1. **Quantity**: Exactly 20 questions.
      2. **Topics**: 
         - Solving linear systems (finding intersection).
         - Interpreting slopes and intercepts in real-world contexts.
         - Solving linear inequalities (algebraically and graphically).
         - Vocabulary of inequalities (at least, at most, exceeds).
      3. **Difficulty**: Mixed (Easy to Hard).
      4. **Structure**:
         - 'options': Array of 4 strings.
         - 'correctAnswerIndex': 0-3.
         - 'explanation': Brief reason why the answer is correct.
      5. Ensure questions are clear and numbers are manageable.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    if (!response.text) throw new Error("No text returned from Gemini");
    return JSON.parse(response.text) as QuizData;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};