import { supabase, handleResponse } from '../api/supabase/client';
import { userService } from './userService';
import Constants from 'expo-constants';

// Get API key directly from environment variables
const GOOGLE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || 
                          Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_AI_API_KEY || 
                          Constants.manifest?.extra?.EXPO_PUBLIC_GOOGLE_AI_API_KEY;

// Updated to use v1 instead of v1beta and use the right model
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

// Error messages
const ERROR_MESSAGES = {
  SUPABASE_CONNECTION: 'Unable to connect to the database. Please check your internet connection.',
  AI_SERVICE: 'Unable to get AI response. Please try again.',
  NETWORK: 'Network connection error. Please check your internet connection.',
  UNKNOWN: 'An unexpected error occurred. Please try again.'
};

// Helper function to check if error is a network error
const isNetworkError = (error) => {
  return error.message === 'Network request failed' || 
         error.name === 'AuthRetryableFetchError' ||
         error.message.includes('network') ||
         (typeof navigator !== 'undefined' && !navigator.onLine);
};

// Add better debugging and API key validation
const callGeminiAPI = async (message) => {
  // Check if API key is present
  if (!GOOGLE_AI_API_KEY) {
    console.error('Google AI API key is missing. Check your .env file and make sure EXPO_PUBLIC_GOOGLE_AI_API_KEY is set correctly.');
    throw new Error('API configuration error: Missing API key');
  }

  console.log('Calling Gemini API with endpoint:', API_ENDPOINT);
  console.log('API key available:', GOOGLE_AI_API_KEY ? 'Yes' : 'No');
  
  try {
    // For testing network connectivity
    try {
      const testResponse = await fetch('https://www.google.com');
      console.log('Network connectivity test:', testResponse.ok ? 'Success' : 'Failed');
    } catch (testError) {
      console.error('Network connectivity test failed:', testError.message);
      throw new Error(ERROR_MESSAGES.NETWORK);
    }

    const url = `${API_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`;
    console.log('Full API URL (without key):', API_ENDPOINT + '?key=[REDACTED]');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('AI API Error Status:', response.status);
      const errorData = await response.text();
      console.error('AI API Error Details:', errorData);
      
      // Improve error messaging to help with debugging
      if (response.status === 404) {
        console.error('Model not found. Please check your model name and API version.');
        // List available models to help with troubleshooting
        try {
          const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${GOOGLE_AI_API_KEY}`);
          if (modelsResponse.ok) {
            const modelData = await modelsResponse.json();
            console.log('Available models:', modelData.models?.map(m => m.name) || []);
          }
        } catch (listError) {
          console.error('Error listing models:', listError);
        }
      } else if (response.status === 400) {
        console.error('Bad request. Check your API request format.');
      } else if (response.status === 401 || response.status === 403) {
        console.error('Authentication error. Check your API key.');
      } else if (response.status >= 500) {
        console.error('Server error. The API service might be experiencing issues.');
      }
      
      throw new Error(`AI API Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid API response format');
    }
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error in callGeminiAPI:', error.message, error.stack);
    // Improve network error detection
    if (isNetworkError(error)) {
      throw new Error(ERROR_MESSAGES.NETWORK);
    }
    throw error;
  }
};

export const chatService = {
  // Generate AI response with context
  generateResponse: async (message, context = '') => {
    try {
      const prompt = context ? `${context}\n\nUser: ${message}` : message;
      return await callGeminiAPI(prompt);
    } catch (error) {
      console.error('Error generating AI response:', error);
      if (isNetworkError(error)) {
        throw new Error(ERROR_MESSAGES.NETWORK);
      }
      throw new Error(ERROR_MESSAGES.AI_SERVICE);
    }
  },

  // Send a message to the AI and update streak
  sendMessage: async (userId, message) => {
    try {
      // First check if we can connect to Supabase
      try {
        const { data: healthCheck, error: healthError } = await supabase.from('chat_messages').select('id').limit(1);
        if (healthError) {
          throw new Error(ERROR_MESSAGES.SUPABASE_CONNECTION);
        }
      } catch (error) {
        if (isNetworkError(error)) {
          throw new Error(ERROR_MESSAGES.NETWORK);
        }
        throw error;
      }

      // Record the user's message in the chat_messages table
      const { data: userMessage, error: userMessageError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          message: message,
          is_ai: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userMessageError) {
        console.error('Error saving user message:', userMessageError);
        throw new Error(ERROR_MESSAGES.SUPABASE_CONNECTION);
      }

      // Get AI response using Google AI API - now using the common function
      let aiResponseText;
      try {
        aiResponseText = await callGeminiAPI(message);
      } catch (error) {
        console.error('Error getting AI response:', error);
        if (isNetworkError(error)) {
          throw new Error(ERROR_MESSAGES.NETWORK);
        }
        throw new Error(ERROR_MESSAGES.AI_SERVICE);
      }
      
      // Record AI's response in Supabase
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          message: aiResponseText,
          is_ai: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (aiMessageError) {
        console.error('Error saving AI response:', aiMessageError);
        throw new Error(ERROR_MESSAGES.SUPABASE_CONNECTION);
      }
      
      return {
        message: aiMessage.message,
        timestamp: aiMessage.created_at
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      // If it's already one of our custom errors, throw it directly
      if (Object.values(ERROR_MESSAGES).includes(error.message)) {
        throw error;
      }
      // Otherwise throw a generic error
      throw new Error(ERROR_MESSAGES.UNKNOWN);
    }
  },

  // Get chat history for a user
  getChatHistory: async (userId) => {
    try {
      // Check connection first
      try {
        const { data: healthCheck, error: healthError } = await supabase.from('chat_messages').select('id').limit(1);
        if (healthError) {
          throw new Error(ERROR_MESSAGES.SUPABASE_CONNECTION);
        }
      } catch (error) {
        if (isNetworkError(error)) {
          throw new Error(ERROR_MESSAGES.NETWORK);
        }
        throw error;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat history:', error);
        throw new Error(ERROR_MESSAGES.SUPABASE_CONNECTION);
      }

      return data.map(msg => ({
        id: msg.id,
        content: msg.message,
        isUser: !msg.is_ai,
        timestamp: msg.created_at
      }));
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      // If it's already one of our custom errors, throw it directly
      if (Object.values(ERROR_MESSAGES).includes(error.message)) {
        throw error;
      }
      // Otherwise throw a generic error
      throw new Error(ERROR_MESSAGES.UNKNOWN);
    }
  }
};