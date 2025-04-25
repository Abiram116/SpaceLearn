import Constants from 'expo-constants';

// Global variable that can be set from outside
let manualApiKey = null;

// Set API key function that can be called from other files
export const setGoogleAIApiKey = (apiKey) => {
  manualApiKey = apiKey;
  console.log('Manual Google AI API key has been set');
};

// Get API key with priority for manual setting
const getApiKey = () => {
  if (manualApiKey) return manualApiKey;
  
  return Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_AI_API_KEY || 
         Constants.manifest?.extra?.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
};
                         
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

export const generateAIResponse = async (userMessage) => {
  try {
    const GOOGLE_AI_API_KEY = getApiKey();
    
    console.log('Starting AI request to endpoint:', API_ENDPOINT);
    console.log('API key available:', GOOGLE_AI_API_KEY ? 'Yes' : 'No');
    
    // Check if API key is valid
    if (!GOOGLE_AI_API_KEY) {
      console.error('API key is missing or invalid');
      throw new Error('API key is missing. Please set it using setGoogleAIApiKey() or check your environment variables.');
    }
    
    // Make request with improved error handling
    const response = await fetch(`${API_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: userMessage
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      
      if (response.status === 400) {
        throw new Error('Bad request. The prompt might be too long or contain invalid content.');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication error. Please check your API key.');
      } else if (response.status === 404) {
        throw new Error('API endpoint not found. The service might have changed.');
      } else if (response.status >= 500) {
        throw new Error('AI service error. The service might be temporarily unavailable.');
      }
      
      throw new Error(`API request failed with status ${response.status}`);
    }

    console.log('AI response received successfully');
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected API response format:', JSON.stringify(data));
      throw new Error('Invalid response format from AI service');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating AI response:', error.message);
    throw error;
  }
}; 