import { supabase, handleResponse } from '../api/supabase/client';
import { userService } from './userService';

export const chatService = {
  // Send a message to the AI and update streak
  sendMessage: async (userId, message) => {
    try {
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

      if (userMessageError) throw userMessageError;

      // TODO: Implement actual AI chat functionality here
      
      // Record AI's response
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          message: "This is a mock response. AI chat will be implemented soon.",
          is_ai: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (aiMessageError) throw aiMessageError;
      
      // The streak will be automatically updated by the database trigger
      // when the user's message is inserted
      
      return {
        message: aiMessage.message,
        timestamp: aiMessage.created_at
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  },

  // Get chat history
  getChatHistory: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      throw error;
    }
  }
}; 