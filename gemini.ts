
import { GoogleGenAI, Type } from "@google/genai";
import { DayEntry, DayAnalysis, ChatMessage } from "./types";

const SYSTEM_PROMPT_CORE = `You are Friend&Help, a kind and joyful companion.
Your goal is to bring clarity and happiness to the user's life through simple, empathetic conversation.

APP STRUCTURE KNOWLEDGE:
- Home: Today's happiness score and the Daily Check-In.
- Chat: General conversation and support.
- Explore: Find parks, activities, and nature spots nearby.
- Data: Visual charts of happiness over time and emotional patterns.
- Help: Specific suggestions and personalized advice based on entries.
- User: Settings for light/dark mode, data export, and deletion.

RULES:
1. Be warm, supportive, and positive.
2. Never judge.
3. No medical or diagnostic claims.
4. If distress is high, gently suggest professional support.
5. Use clear, simple language.
6. DO NOT use emojis in your text responses.
7. If the user asks where to find something, guide them to Home, Explore, Data, Help, or User tabs.`;

export async function getCompanionResponse(message: string, history: ChatMessage[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chatHistory = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }]
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...chatHistory, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT_CORE + " You are talking to the user as their friend. Listen to their problems and offer kind, joyful, and simple advice.",
      temperature: 0.8,
    }
  });
  return response.text || "I am here with you. Tell me more.";
}

export async function getFollowUp(userMessage: string, history: string[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { role: 'user', parts: [{ text: `User said: "${userMessage}". Conversation history: ${history.join('. ')}. Ask one creative, insightful, and unique follow-up question. DO NOT ask general questions like "how are you". Ask something specific to what they said to help them reflect deeply.` }] }
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT_CORE + " Be a curious friend. Ask a specific, diverse question that varies from previous sessions.",
      temperature: 0.9,
    }
  });
  return response.text || "That sounds interesting. How did it affect your perspective today?";
}

export async function analyzeDay(currentEntry: string, followUps: string[], pastEntries: DayEntry[]): Promise<DayAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      { role: 'user', parts: [{ text: `Precisely analyze this day based on these inputs: Primary Entry: "${currentEntry}". Follow-up Responses: ${followUps.join(', ')}. 
      Calculate a precise Happiness Score from 0 to 100 based on sentiment analysis. 
      BE ACCURATE: A neutral day should be around 50, a very sad day 10, a ecstatic day 95. 
      The score must be based on the emotional weight of the words used. If the user is having a great day, give a high score (80-100). If it's a standard day, give around 50-70. Only give very low scores for genuine sadness.` }] }
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT_CORE + " You are a precise emotional analyzer. Evaluate the user's sentiment with high mathematical accuracy.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          happinessScore: { type: Type.INTEGER, description: "A precise integer from 0 to 100 representing happiness level." },
          patternInsight: { type: Type.STRING },
          advice: { type: Type.ARRAY, items: { type: Type.STRING } },
          detectedEmotions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "happinessScore", "advice", "detectedEmotions"]
      }
    }
  });
  return JSON.parse(response.text.trim());
}

export async function getNearbyActivities(lat: number, lng: number) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: 'user', parts: [{ text: "Suggest exactly 5 beautiful parks or peaceful outdoor activities near my location. MANDATORY: For EVERY activity you list, you MUST include its coordinates in this exact format at the end of the line: [COORD: latitude, longitude]. Do not miss any." }] }],
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    }
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const text = response.text || "";
  
  const links = chunks
    .filter((c: any) => c.maps)
    .map((c: any) => ({
      title: c.maps.title,
      uri: c.maps.uri
    }));

  return { text, links };
}
