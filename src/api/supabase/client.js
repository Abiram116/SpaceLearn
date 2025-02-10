import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Initialize session state
let cachedSession = null;

// Clear any stale sessions in web localStorage
if (Platform.OS === 'web') {
  try {
    // Clear any old session format
    localStorage.removeItem('supabase.auth.token');
    
    const existingSession = localStorage.getItem('sb-session');
    if (existingSession) {
      const sessionData = JSON.parse(existingSession);
      if (sessionData?.expires_at) {
        const expiryDate = new Date(sessionData.expires_at * 1000);
        if (expiryDate < new Date()) {
          console.log('Clearing expired session from localStorage');
          localStorage.removeItem('sb-session');
        } else {
          cachedSession = sessionData;
        }
      }
    }
  } catch (error) {
    console.warn('Error checking session expiry:', error);
    localStorage.removeItem('sb-session');
  }
}

const supabaseConfig = {
  auth: {
    storage: Platform.OS === 'web' ? localStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    debug: true,
    // Add event listeners for auth state changes
    onAuthStateChange: (event, session) => {
      console.log('Auth state changed:', event, session ? 'Has session' : 'No session');
      cachedSession = session;
      
      if (Platform.OS === 'web') {
        // Update our cached session
        if (session) {
          localStorage.setItem('sb-session', JSON.stringify(session));
        } else {
          localStorage.removeItem('sb-session');
        }
      }
    }
  },
};

console.log('Initializing Supabase with:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  platform: Platform.OS,
  storage: Platform.OS === 'web' ? 'localStorage' : 'AsyncStorage',
  hasExistingSession: !!cachedSession
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig);

// Enhanced session management with caching
export const getValidSession = async () => {
  try {
    // First check our cached session
    if (cachedSession) {
      const expiryDate = new Date(cachedSession.expires_at * 1000);
      if (expiryDate > new Date()) {
        return cachedSession;
      }
      cachedSession = null;
    }

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

    // Cache the valid session
    cachedSession = session;
    return session;
  } catch (error) {
    console.error('Unexpected error in getValidSession:', error);
    return null;
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
    if (cachedSession?.user) {
      return cachedSession.user;
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

// Enhanced sign out with complete cleanup
export const signOut = async () => {
  try {
    console.log('Signing out user...');
    
    // Clear cached session
    cachedSession = null;
    
    // Clear all storage
    if (Platform.OS === 'web') {
      localStorage.removeItem('sb-session');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.expires_at');
    }
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error in signOut:', {
        message: error.message,
        status: error.status,
        code: error.code
      });
      throw error;
    }
    
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Unexpected error in signOut:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}; 