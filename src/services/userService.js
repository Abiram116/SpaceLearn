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
    try {
      console.log('Starting signup process with data:', {
        email: userData.email ? 'provided' : 'missing',
        password: userData.password ? 'provided' : 'missing',
        metadata: userData.metadata ? 'provided' : 'missing'
      });

      // Step 1: Create auth user with minimal data first
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (signUpError) {
        console.error('Auth signup error:', signUpError);
        throw signUpError;
      }

      if (!authData?.user) {
        throw new Error('No user data returned from signup');
      }

      console.log('Auth user created:', {
        id: authData.user.id,
        email: authData.user.email
      });

      // Step 2: Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: userData.metadata.full_name,
          username: userData.metadata.username
        }
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        // Clean up by signing out
        await supabase.auth.signOut();
        throw updateError;
      }

      // Step 3: Create user profile
      try {
        const profileData = {
          id: authData.user.id,
          email: userData.email.toLowerCase(),
          username: userData.metadata.username,
          full_name: userData.metadata.full_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          streak_count: 0,
          last_activity_date: new Date().toISOString(),
          bio: '',
          avatar_url: '',
          gender: userData.metadata.gender || null,
          age: userData.metadata.age || null
        };

        console.log('Creating user profile:', { ...profileData, id: 'HIDDEN' });

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert([profileData])
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Clean up by signing out
          await supabase.auth.signOut();
          throw profileError;
        }

        console.log('User profile created successfully');
        return { data: { user: authData.user, profile } };

      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        // Clean up by signing out
        await supabase.auth.signOut();
        throw new Error('Failed to create user profile');
      }

    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  },

  // Sign in user
  signIn: async (email, password) => {
    try {
      console.log('Starting sign in process for:', email);
      
      if (!email || !password) {
        console.error('Missing email or password');
        return { error: 'Please provide both email and password' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Incorrect email or password. Please try again.' };
        }
        return { error: error.message || 'Failed to sign in' };
      }

      if (!data?.user) {
        console.error('No user data returned from sign in');
        return { error: 'Failed to sign in' };
      }

      console.log('Sign in successful for:', email);
      return { data };
    } catch (error) {
      console.error('Unexpected error in signIn:', error);
      return { error: error.message || 'An unexpected error occurred' };
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

      console.log('Checking for existing user profile...');
      
      // First check if user exists in the users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();  // Use maybeSingle instead of single to avoid errors

      console.log('Existing user check result:', { existingUser, checkError });

      // If user doesn't exist in the users table, create a profile
      if (!existingUser && !checkError) {
        console.log('Creating new user profile...');
        
        const newUserData = {
          id: user.id,
          email: user.email,
          username: user.email.split('@')[0],
          full_name: user.user_metadata?.full_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          streak_count: 0,
          last_activity_date: new Date().toISOString(),
          bio: '',
          avatar_url: '',
          gender: null,
          age: null
        };

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .upsert([newUserData])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          throw createError;
        }

        console.log('New user profile created:', newUser);
        return newUser;
      }

      if (checkError) {
        console.error('Error checking user profile:', checkError);
        throw checkError;
      }

      // Safely handle the grade field removal
      if (existingUser) {
        const { grade, ...userWithoutGrade } = existingUser;
        console.log('Profile data loaded:', userWithoutGrade);
        return userWithoutGrade;
      }

      return null;
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
      console.log('Getting user streak for ID:', userId);
      
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('streak_count, last_activity_date')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user streak:', checkError);
        throw checkError;
      }

      // If no user found, return default values
      if (!existingUser) {
        console.log('No user profile found for streak, returning defaults');
        return { streak_count: 0, last_activity_date: null };
      }

      const { streak_count, last_activity_date } = existingUser;
      
      console.log('Current streak data:', { streak_count, last_activity_date });
      
      // Update streak if needed
      try {
        const updatedStreak = await userService.updateStreak(userId, streak_count, last_activity_date);
        console.log('Updated streak:', updatedStreak);
        return updatedStreak;
      } catch (updateError) {
        console.error('Error updating streak:', updateError);
        // If update fails, return the existing streak data
        return { streak_count, last_activity_date };
      }
    } catch (error) {
      console.error('Error in getUserStreak:', error);
      // Return default values on error
      return { streak_count: 0, last_activity_date: null };
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

  // Delete user account and all associated data
  deleteAccount: async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Delete user data from the database (this will cascade to all related tables)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

    } catch (error) {
      console.error('Error in deleteAccount:', error);
      throw error;
    }
  }
}; 