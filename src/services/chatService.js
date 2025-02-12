import { supabase, handleResponse } from '../api/supabase/client';
import { userService } from './userService';

export const chatService = {
  // Send a message to the AI and update streak
  sendMessage: async (userId, message) => {
    try {
      // TODO: Implement actual AI chat functionality here
      
      // Update user's streak after successful chat interaction
      await userService.updateStreakAfterChat(userId);
      
      // For now, return a mock response
      return {
        message: "This is a mock response. AI chat will be implemented soon.",
        timestamp: new Date().toISOString()
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