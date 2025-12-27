import { GoogleGenAI } from "@google/genai";
import { MenuItem } from '../types';
import { GEMINI_MODEL_TEXT } from '../constants';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY not found in environment");
  return new GoogleGenAI({ apiKey });
};

export const askMenuAssistant = async (
  menu: MenuItem[],
  query: string,
  history: string[] = []
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    const menuContext = menu.map(item => 
      `${item.name} (${item.category}): $${item.price} - ${item.description} [${item.available ? 'In Stock' : 'Out of Stock'}]`
    ).join('\n');

    const systemInstruction = `
    You are a knowledgeable and charming restaurant server. 
    Use the following current menu data to answer user questions:
    
    --- MENU START ---
    ${menuContext}
    --- MENU END ---
    
    Rules:
    1. Only recommend items currently on the menu.
    2. If an item is out of stock (available: false), mention it politely.
    3. Keep answers concise (under 100 words) unless asked for a detailed explanation.
    4. Be helpful with dietary restrictions if you can infer them from descriptions.
    `;

    const model = ai.models;
    const response = await model.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [
        ...history.map(h => ({ role: 'user', parts: [{ text: h }] })), // Simplified history for demo
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I apologize, I couldn't think of a response right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my brain right now. Please ask again later.";
  }
};
