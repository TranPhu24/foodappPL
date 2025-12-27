import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateText(prompt) {
  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: prompt,
  });

  return response.text;
}
