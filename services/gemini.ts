import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateDescription = async (theme: string, title: string): Promise<string> => {
  if (!apiKey) return "API Key not found. Please check your configuration.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, immersive, and poetic 2-sentence description for a photograph titled "${title}" with the theme "${theme}". Keep it abstract and evocative.`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not load description at this time.";
  }
};