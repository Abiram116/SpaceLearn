import { supabase, handleResponse, createServiceClient } from '../api/supabase/client';

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

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(userData.email)) {
        console.error('Invalid email format:', userData.email);
        throw new Error('Please enter a valid email address');
      }

      // Step 1: Create auth user with metadata
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        options: {
          data: {
            full_name: userData.metadata.full_name,
            username: userData.metadata.username,
            gender: userData.metadata.gender,
            age: userData.metadata.age
          }
        }
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

      // Step 2: Wait briefly for auth session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Create user profile
      try {
        const profileData = {
          id: authData.user.id,
          email: userData.email.toLowerCase().trim(),
          username: userData.metadata.username.toLowerCase().trim(),
          full_name: userData.metadata.full_name.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          streak_count: 1,
          last_activity_date: new Date().toISOString(),
          bio: '',
          avatar_url: '',
          gender: userData.metadata.gender || null,
          age: userData.metadata.age || null
        };

        console.log('Creating user profile with data:', {
          ...profileData,
          id: 'HIDDEN',
          email: 'HIDDEN'
        });

        // Try first with regular client
        let { data: profile, error: profileError } = await supabase
          .from('users')
          .insert([profileData])
          .select()
          .single();

        // If we get an RLS policy error, we need to use a workaround with the service client
        if (profileError && (profileError.message?.includes('row-level security') || 
            profileError.code === '42501')) {
          console.log('RLS policy error detected, trying with service client...');
            
          // Use the service client which can bypass RLS
          const serviceClient = await createServiceClient();
          
          const { data: serviceProfile, error: serviceError } = await serviceClient
            .from('users')
            .insert([profileData])
            .select()
            .single();
            
          profile = serviceProfile;
          profileError = serviceError;
        }

        // If we still have an error, try the minimal approach
        if (profileError) {
          console.log('Service client approach failed, trying minimal profile creation...');
          
          // Try with minimal data that's most likely to succeed
          const minimalProfile = {
            id: authData.user.id,
            email: userData.email.toLowerCase().trim(),
            username: userData.metadata.username.toLowerCase().trim(),
            full_name: userData.metadata.full_name.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: minimalData, error: minimalError } = await supabase
            .from('users')
            .insert([minimalProfile])
            .select()
            .single();
            
          profile = minimalData;
          profileError = minimalError;
        }

        if (profileError) {
          console.error('Profile creation error:', {
            error: profileError,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code
          });
          await supabase.auth.signOut();
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }

        if (!profile) {
          console.error('No profile data returned after creation');
          await supabase.auth.signOut();
          throw new Error('Failed to create user profile: No data returned');
        }

        console.log('User profile created successfully:', {
          id: 'HIDDEN',
          username: profile.username
        });
        
        return { data: { user: authData.user, profile } };

      } catch (profileError) {
        console.error('Error creating user profile:', {
          error: profileError,
          message: profileError.message,
          stack: profileError.stack
        });
        await supabase.auth.signOut();
        throw new Error(`Failed to create user profile: ${profileError.message}`);
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

      // Basic network check
      try {
        const testResponse = await fetch('https://www.google.com');
        if (!testResponse.ok) {
          return { error: 'Internet connection appears to be offline. Please check your connection.' };
        }
      } catch (networkError) {
        console.error('Basic network test failed:', networkError);
        return { error: 'Unable to connect to the internet. Please check your connection.' };
      }

      console.log('Network check passed, attempting Supabase login');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase sign in error:', {
          message: error.message,
          name: error.name,
          status: error?.status
        });
        
        if (error.message?.includes('Invalid login credentials')) {
          return { error: 'Incorrect email or password. Please try again.' };
        }
        if (error.message?.includes('Network request failed')) {
          return { error: 'Unable to reach the server. Please check your internet connection and try again.' };
        }
        if (error.message?.includes('Email not confirmed')) {
          return { error: 'Please verify your email address before signing in.' };
        }
        return { error: 'Unable to sign in. Please try again later.' };
      }

      if (!data?.user) {
        console.error('No user data returned from sign in');
        return { error: 'Failed to sign in' };
      }

      console.log('Sign in successful for:', email);
      return { data };
    } catch (error) {
      console.error('Unexpected error in signIn:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return { error: 'An unexpected error occurred. Please try again.' };
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
      console.log('=== Starting getCurrentUser ===');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error in getCurrentUser:', authError);
        throw authError;
      }
      
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }

      console.log('Checking for existing user profile...');
      
      // First check if user exists in the users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();  // Use maybeSingle instead of single to avoid errors

      console.log('Existing user check result:', { 
        hasUser: !!existingUser, 
        hasError: !!checkError 
      });

      // If user doesn't exist in the users table, create a profile
      if (!existingUser && !checkError) {
        console.log('Creating new user profile...');
        
        const newUserData = {
          id: user.id,
          email: user.email,
          username: user.email.split('@')[0],
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          streak_count: 0,
          last_activity_date: new Date().toISOString(),
          bio: '',
          avatar_url: '',
          gender: null,
          age: null
        };

        console.log('Attempting to create user profile with data:', {
          ...newUserData,
          id: 'HIDDEN',
          email: 'HIDDEN'
        });

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .upsert([newUserData])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', {
            error: createError,
            message: createError.message,
            details: createError.details,
            hint: createError.hint,
            code: createError.code
          });
          throw createError;
        }

        if (!newUser) {
          console.error('No profile data returned after creation');
          throw new Error('Failed to create user profile: No data returned');
        }

        console.log('User profile created successfully:', {
          id: 'HIDDEN',
          username: newUser.username
        });
        
        return newUser;
      }

      if (checkError) {
        console.error('Error checking user profile:', {
          error: checkError,
          message: checkError.message,
          details: checkError.details,
          hint: checkError.hint,
          code: checkError.code
        });
        throw checkError;
      }

      // Return the existing user data
      if (existingUser) {
        console.log('Returning existing user profile:', {
          id: 'HIDDEN',
          username: existingUser.username
        });
        return existingUser;
      }

      return null;
    } catch (error) {
      console.error('Error in getCurrentUser:', {
        error,
        message: error.message,
        stack: error.stack
      });
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
      // Try to get from user_streaks table first
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId);

      // If the table doesn't exist or there's another error, fall back to the users table
      if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
        console.log('Falling back to users table for streak data');
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('streak_count, last_activity_date')
          .eq('id', userId)
          .maybeSingle();

        if (userError) {
          console.error('Error in streak fallback:', userError);
          return { streak_count: 0, last_activity_date: null };
        }

        return userData || { streak_count: 0, last_activity_date: null };
      }

      if (error) {
        console.error('Error fetching user streak:', error);
        return { streak_count: 0, last_activity_date: null };
      }

      return data && data.length > 0 ? data[0] : { streak_count: 0, last_activity_date: null };
    } catch (error) {
      console.error('Error in getUserStreak:', error);
      // Return default values instead of throwing
      return { streak_count: 0, last_activity_date: null };
    }
  },

  // Update streak when user is active
  updateStreak: async (userId) => {
    try {
      // Get current time in user's timezone
      const now = new Date();
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const nowLocal = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
      
      // Get user's current streak info
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('streak_count, last_activity_date')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      let newStreak = user.streak_count;
      const lastActivityDate = user.last_activity_date;

      // If it's a new day in user's timezone
      if (isNewDay(lastActivityDate)) {
        if (!lastActivityDate) {
          // First time user starts with 1
          newStreak = 1;
        } else if (isConsecutiveDay(lastActivityDate)) {
          // Increment streak for consecutive days
          newStreak += 1;
        } else {
          // Reset streak to 1 if chain is broken (missed a day)
          newStreak = 1;
        }

        // Update the streak and last activity date
        const { data, error } = await supabase
          .from('users')
          .update({
            streak_count: newStreak,
            last_activity_date: nowLocal.toISOString(),
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      return user;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  },

  // Update streak specifically after AI chat interaction
  updateStreakAfterChat: async (userId) => {
    try {
      // Get current time in user's timezone
      const now = new Date();
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const nowLocal = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
      
      // Get user's current streak info
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('streak_count, last_activity_date')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      let newStreak = user.streak_count;
      const lastActivityDate = user.last_activity_date;

      // If it's a new day in user's timezone
      if (isNewDay(lastActivityDate)) {
        if (!lastActivityDate) {
          // First time user starts with 1
          newStreak = 1;
        } else if (isConsecutiveDay(lastActivityDate)) {
          // Increment streak for consecutive days
          newStreak += 1;
        } else {
          // Reset streak to 1 if chain is broken (missed a day)
          newStreak = 1;
        }

        // Update the streak and last activity date
        const { data, error } = await supabase
          .from('users')
          .update({
            streak_count: newStreak,
            last_activity_date: nowLocal.toISOString(),
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      return user;
    } catch (error) {
      console.error('Error updating streak after chat:', error);
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