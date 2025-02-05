import { supabase } from './supabaseClient';

export const userService = {
  // Sign up a new user
  signUp: async (userData) => {
    const { email, password, ...profileData } = userData;
    
    try {
      // First, create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Then, create user profile
      const response = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email,
          ...profileData,
        }])
        .select()
        .single();

      return supabase.handleResponse(response);
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  },

  // Sign in user
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const response = await supabase
        .from('users')
        .select(`
          *,
          user_preferences (*)
        `)
        .eq('id', user.id)
        .single();

      return supabase.handleResponse(response);
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    try {
      const response = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return supabase.handleResponse(response);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  },

  // Update user preferences
  updatePreferences: async (userId, preferences) => {
    try {
      const response = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
        })
        .select()
        .single();

      return supabase.handleResponse(response);
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      throw error;
    }
  },

  // Get user streak
  getUserStreak: async (userId) => {
    try {
      const response = await supabase
        .from('users')
        .select('streak_count, last_activity_date')
        .eq('id', userId)
        .single();

      return supabase.handleResponse(response);
    } catch (error) {
      console.error('Error in getUserStreak:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw error;
    }
  },
}; 