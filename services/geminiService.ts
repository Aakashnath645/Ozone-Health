import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ""; 

// Local fallback logic when AI is unavailable or rate-limited
const getLocalFallback = (aqi: number, uv: number) => {
  const parts = [];
  
  if (aqi > 200) parts.push("Emergency: Air is hazardous. Keep windows closed.");
  else if (aqi > 150) parts.push("Pollution is very high. Avoid outdoor activities.");
  else if (aqi > 100) parts.push("Air is unhealthy for sensitive groups. Limit exertion.");
  else if (aqi > 50) parts.push("Air quality is moderate.");
  else parts.push("Air quality is excellent.");

  if (uv > 10) parts.push("UV is extreme. Skin damage occurs in minutes.");
  else if (uv > 7) parts.push("UV is very high. Extra protection required.");
  else if (uv > 5) parts.push("UV is high. Wear sunscreen.");
  
  return parts.join(" ") + " (Offline Mode)";
};

export const getHealthInsights = async (city: string, aqi: number, uv: number) => {
  if (!apiKey) {
    console.warn("Gemini API Key missing");
    return { text: getLocalFallback(aqi, uv) };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-3-flash-preview";
    
    // Fallback if city is unknown, so AI still generates useful advice based on data
    const locationTerm = (!city || city === "Unknown Location") ? "this location" : city;
    
    const prompt = `
      Current conditions in ${locationTerm}: AQI ${aqi}, UV Index ${uv}.
      Find the latest specific environmental health news or advisories for ${locationTerm} if possible.
      Otherwise, provide a general health recommendation based on these specific metrics (AQI ${aqi} and UV ${uv}).
      Summarize any alerts. Keep it short, actionable, and under 50 words.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    return { text, grounding };
  } catch (e: any) {
    console.error("Gemini Search Error", e);
    // On 429 (Quota Exceeded) or network error, return local fallback
    return { text: getLocalFallback(aqi, uv) };
  }
};

export const findNearbyPlaces = async (lat: number, lon: number, type: 'park' | 'clinic') => {
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-2.5-flash";
    
    const query = type === 'park' 
      ? "Find the highest rated parks or green spaces nearby for fresh air." 
      : "Find nearby medical clinics or respiratory specialists.";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lon }
          }
        }
      }
    });

    const text = response.text;
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { text, grounding };
  } catch (e: any) {
    console.error("Gemini Maps Error", e);
    
    // Handle Quota Limit gracefully
    if (e.toString().includes('429') || e.message?.includes('quota') || e.code === 429) {
       return { 
         text: "AI services are temporarily unavailable due to high traffic. Please check your local maps application for nearby locations." 
       };
    }
    
    return null;
  }
};