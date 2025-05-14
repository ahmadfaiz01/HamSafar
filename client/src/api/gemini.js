import axios from 'axios';

// Ideally, move this to .env and load via process.env
const API_KEY = 'AIzaSyDTYLBMLhpgf-HfdgU9TWYtlzzfVc0vTB8'; 
const URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// System prompt defining assistant behavior
const SYSTEM_PROMPT = `
You are HamSafar, a helpful and friendly **AI travel planner assistant**.
Your job is to:
- Help users plan trips by suggesting destinations, hotels, transport, and activities.
- Use a **professional**, warm, and concise tone.
- Format responses with markdown-like styles: use **bold**, bullet points, and line breaks where helpful.
- If unsure, politely ask for more details.
`;

// Main API call
export const generateGeminiResponse = async (userMessage) => {
  console.log("Calling Gemini API with message:", userMessage);
  
  const requestData = {
    contents: [
      {
        role: "user",
        parts: [
          { text: SYSTEM_PROMPT },
          { text: userMessage }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.9,
      topK: 32,
      topP: 1,
      maxOutputTokens: 1024,
    }
  };

  try {
    const response = await axios.post(`${URL}?key=${API_KEY}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "No response received.";
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    return "An error occurred while fetching response from HamSafar.";
  }
};
