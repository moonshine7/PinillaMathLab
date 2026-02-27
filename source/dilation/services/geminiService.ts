import { GoogleGenAI, Type } from "@google/genai";
import { ShapeData } from '../types';

const getAiAndSchema = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const schema = {
    type: Type.OBJECT,
    properties: {
      shapeType: {
        type: Type.STRING,
        description: "The type of shape (e.g., 'triangle', 'square').",
      },
      quadrant: {
        type: Type.INTEGER,
        description: "The quadrant (1, 2, 3, or 4) where the shape is located. If it crosses axes, this can be the starting quadrant.",
      },
      vertices: {
        type: Type.ARRAY,
        description: "An array of the shape's vertices.",
        items: {
          type: Type.OBJECT,
          properties: {
            label: {
              type: Type.STRING,
              description: "The label for the vertex (e.g., 'A', 'B').",
            },
            x: {
              type: Type.INTEGER,
              description: "The x-coordinate of the vertex.",
            },
            y: {
              type: Type.INTEGER,
              description: "The y-coordinate of the vertex.",
            },
          },
          required: ["label", "x", "y"],
        },
      },
    },
    required: ["shapeType", "quadrant", "vertices"],
  };
  return { ai, schema };
};


const callGemini = async (prompt: string, schema: any): Promise<ShapeData> => {
    const { ai } = getAiAndSchema();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                thinkingConfig: {
                    thinkingBudget: 32768,
                },
            },
        });

        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);

        if (
            !parsedData.shapeType ||
            !parsedData.quadrant ||
            !Array.isArray(parsedData.vertices)
        ) {
            throw new Error("Invalid data structure received from API.");
        }
        
        return parsedData as ShapeData;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get data from Gemini API.");
    }
};

export const generateShapeData = async (shapeToGenerate: string, generationType: 'enlarge' | 'reduce'): Promise<ShapeData> => {
  const { schema } = getAiAndSchema();
  
  const coordinateConstraint = generationType === 'reduce'
    ? "Generate a LARGE version of the shape. All vertex coordinates (x and y) must be integers with absolute values between 10 and 20 (inclusive)."
    : "All vertex coordinates (x and y) must be integers between -10 and 10 (inclusive), but not zero.";
  
  const prompt = `
    Generate a geometric shape to be placed on a Cartesian plane.
    - The shape must be a ${shapeToGenerate}.
    - Place the entire shape within a single quadrant (1, 2, 3, or 4).
    - ${coordinateConstraint}
    - Vertices should be labeled sequentially starting with 'A'.
    - For a trapezoid, ensure only one pair of sides is parallel.
    - For a square or rectangle, ensure all angles are 90 degrees.
  `;
  return callGemini(prompt, schema);
};


export const transformShapeData = async (originalShape: ShapeData, scaleFactor: number): Promise<ShapeData> => {
    const { schema } = getAiAndSchema();
    
    // Create a specific schema for this transformation task
    const transformSchema = JSON.parse(JSON.stringify(schema));
    
    // Allow floating-point numbers for the new coordinates
    transformSchema.properties.vertices.items.properties.x.type = Type.NUMBER;
    transformSchema.properties.vertices.items.properties.y.type = Type.NUMBER;
    transformSchema.properties.vertices.items.properties.x.description = "The transformed x-coordinate of the vertex, which can be a float.";
    transformSchema.properties.vertices.items.properties.y.description = "The transformed y-coordinate of the vertex, which can be a float.";
    
    // Ensure the labels are primed
    transformSchema.properties.vertices.items.properties.label.description = "The label for the new vertex. This MUST be the original label followed by a prime symbol (e.g., if the original was 'A', the new one must be 'A'').";

    const transformationType = scaleFactor > 1 ? "enlargement" : "reduction";

    const prompt = `
        You are a geometry expert. Given the shape defined by the following JSON:
        ${JSON.stringify(originalShape)}

        Your task is to perform a geometric dilation (a ${transformationType}) of this shape with the center of dilation at the origin (0, 0).
        - Use a scale factor of ${scaleFactor}.
        - Calculate the new coordinates for each vertex. For example, if a vertex is at (x, y) and the scale factor is ${scaleFactor}, the new vertex will be at (${scaleFactor}*x, ${scaleFactor}*y). The new coordinates can be floating-point numbers.
        - The new vertex labels must be the original label followed by a prime symbol (e.g., 'A' becomes 'A'').
        - Return the new, transformed shape's data in the specified JSON format. The 'shapeType' should remain the same. The 'quadrant' should represent the quadrant of the transformed shape.
    `;
    return callGemini(prompt, transformSchema);
};