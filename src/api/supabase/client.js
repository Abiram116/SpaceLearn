import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabaseConfig = {
  auth: {
    storage: Platform.OS === 'web' ? localStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
    debug: __DEV__,
    storageKey: `sb-${supabaseUrl}-auth-token`,
  },
};

console.log('Initializing Supabase with:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  platform: Platform.OS,
  storage: Platform.OS === 'web' ? 'localStorage' : 'AsyncStorage',
  flowType: supabaseConfig.auth.flowType,
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig);

// Enhanced session management
export const getValidSession = async () => {
  try {
    console.log('Getting valid session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    if (!session) {
      console.log('No session found');
      return null;
    }

    // Check if session is expired
    const expiryDate = new Date(session.expires_at * 1000);
    if (expiryDate < new Date()) {
      console.log('Session expired, signing out');
      await signOut();
      return null;
    }

    console.log('Valid session found');
    return session;
  } catch (error) {
    console.error('Unexpected error in getValidSession:', error);
    return null;
  }
};

// Enhanced sign out
export const signOut = async () => {
  try {
    console.log('Signing out...');
    
    // Clear any stored session data first
    if (Platform.OS === 'web') {
      localStorage.removeItem(supabaseConfig.auth.storageKey);
    } else {
      await AsyncStorage.removeItem(supabaseConfig.auth.storageKey);
    }
    
    // Then sign out from Supabase
    await supabase.auth.signOut();
    console.log('Sign out successful');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Enhanced error handling
export const handleError = (error) => {
  const errorDetails = {
    message: error.message,
    description: error.error_description,
    code: error.code,
    hint: error.hint,
    status: error.status
  };
  
  console.error('Supabase error details:', errorDetails);
  
  if (error.message) {
    return error.message;
  }
  if (error.error_description) {
    return error.error_description;
  }
  if (error.hint) {
    return error.hint;
  }
  return 'An unexpected error occurred';
};

// Enhanced response handling
export const handleResponse = (response) => {
  if (response.error) {
    console.error('Supabase response error:', response.error);
    throw new Error(handleError(response.error));
  }
  
  if (!response.data && response.error === null) {
    console.warn('Supabase response has no data but also no error');
    return null;
  }
  
  return response.data;
};

// Get current user with enhanced session validation and caching
export const getCurrentUser = async () => {
  try {
    console.log('Getting current user...');
    
    // First check if we have a valid session
    const session = await getValidSession();
    if (!session) {
      console.log('No valid session found');
      return null;
    }

    // If we have a cached session, we can use its user
    if (session?.user) {
      return session.user;
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error in getCurrentUser:', {
        message: error.message,
        status: error.status,
        code: error.code
      });
      return null;
    }
    
    if (!user) {
      console.log('No user found');
      return null;
    }
    
    console.log('Current user:', {
      id: user.id,
      email: user.email,
      lastSignIn: user.last_sign_in_at
    });
    
    return user;
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', {
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}; 