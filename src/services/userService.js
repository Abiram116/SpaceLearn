import { supabase, handleResponse } from '../api/supabase/client';

const isNewDay = (lastDate) => {
  if (!lastDate) return true;
  
  // Convert dates to user's local timezone
  const last = new Date(lastDate);
  const now = new Date();
  
  // Get dates in user's timezone
  const lastLocal = new Date(last.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
  const nowLocal = new Date(now.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
  
  // Compare just the dates (year, month, day)
  return lastLocal.getFullYear() < nowLocal.getFullYear() ||
         lastLocal.getMonth() < nowLocal.getMonth() ||
         lastLocal.getDate() < nowLocal.getDate();
};

const isConsecutiveDay = (lastDate) => {
  if (!lastDate) return false;
  
  // Convert dates to user's local timezone
  const last = new Date(lastDate);
  const now = new Date();
  
  // Get dates in user's timezone
  const lastLocal = new Date(last.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
  const nowLocal = new Date(now.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
  
  // Reset hours to start of day in local time
  lastLocal.setHours(0, 0, 0, 0);
  nowLocal.setHours(0, 0, 0, 0);
  
  // Calculate the difference in days
  const diffTime = nowLocal.getTime() - lastLocal.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Return true if it's exactly one day difference
  return diffDays === 1;
};

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

      return handleResponse(response);
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

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Incorrect email or password. Please try again.' };
        }
        throw error;
      }
      return { data };
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

      return handleResponse(response);
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

      return handleResponse(response);
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

      return handleResponse(response);
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

      if (response.error) throw response.error;

      const { streak_count, last_activity_date } = response.data;
      
      // Update streak if needed
      await userService.updateStreak(userId, streak_count, last_activity_date);

      // Get updated streak
      const updatedResponse = await supabase
        .from('users')
        .select('streak_count, last_activity_date')
        .eq('id', userId)
        .single();

      return handleResponse(updatedResponse);
    } catch (error) {
      console.error('Error in getUserStreak:', error);
      throw error;
    }
  },

  // Update streak
  updateStreak: async (userId, currentStreak = 0, lastActivityDate = null) => {
    try {
      // Get current time in user's timezone
      const now = new Date();
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const nowLocal = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
      
      let newStreak = currentStreak;

      // If it's a new day in user's timezone
      if (isNewDay(lastActivityDate)) {
        if (!lastActivityDate) {
          // First time user starts with 1
          newStreak = 1;
        } else if (isConsecutiveDay(lastActivityDate)) {
          // Increment streak for consecutive days
          newStreak += 1;
        } else {
          // Reset streak to 0 if chain is broken (missed a day)
          newStreak = 0;
        }

        // Update the streak and last activity date
        const response = await supabase
          .from('users')
          .update({
            streak_count: newStreak,
            last_activity_date: nowLocal.toISOString(),
          })
          .eq('id', userId)
          .select()
          .single();

        return handleResponse(response);
      }

      return { streak_count: currentStreak, last_activity_date: lastActivityDate };
    } catch (error) {
      console.error('Error in updateStreak:', error);
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