import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

console.log('Initializing Supabase with:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  urlLength: supabaseUrl?.length,
  keyLength: supabaseAnonKey?.length
});

// Create a custom storage implementation
const ExpoStorage = {
  getItem: (key) => {
    console.log('Getting storage item:', key);
    return Platform.OS === 'web' 
      ? localStorage.getItem(key)
      : AsyncStorage.getItem(key);
  },
  setItem: (key, value) => {
    console.log('Setting storage item:', key);
    return Platform.OS === 'web'
      ? localStorage.setItem(key, value)
      : AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    console.log('Removing storage item:', key);
    return Platform.OS === 'web'
      ? localStorage.removeItem(key)
      : AsyncStorage.removeItem(key);
  },
};

// Enhanced config with better timeout and retries
const supabaseConfig = {
  auth: {
    storage: ExpoStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    },
  },
  db: {
    schema: 'public'
  },
  realtime: {
    timeout: 20000
  },
  // Enhanced network handling with retries
  httpClient: {
    fetch: async (url, options) => {
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // 1 second
      
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      
      console.log('Making Supabase request:', {
        url,
        method: options.method,
        platform: Platform.OS
      });

      let lastError;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`Retry attempt ${attempt + 1} of ${MAX_RETRIES}`);
            await delay(RETRY_DELAY * attempt);
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'apikey': supabaseAnonKey,
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          console.log('Response received:', {
            status: response.status,
            ok: response.ok,
            url: url.split('?')[0] // Log URL without query params
          });

          return response;
        } catch (error) {
          lastError = error;
          console.error('Request failed:', {
            attempt: attempt + 1,
            error: error.message,
            type: error.name,
            url: url.split('?')[0]
          });

          // Don't retry if it's an abort error or last attempt
          if (error.name === 'AbortError' || attempt === MAX_RETRIES - 1) {
            throw error;
          }
        }
      }
      
      throw lastError;
    }
  }
};

console.log('Creating Supabase client with config:', {
  platform: Platform.OS,
  storage: Platform.OS === 'web' ? 'localStorage' : 'AsyncStorage',
});

// Create the Supabase client
let supabase;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig);
  
  // Test the connection
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', { event, hasSession: !!session });
  });

  // Verify the client is working
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Error getting session:', error);
    } else {
      console.log('Supabase client initialized successfully');
    }
  });

} catch (error) {
  console.error('Error creating Supabase client:', error);
  throw error;
}

export { supabase };

// Helper function to handle responses
export const handleResponse = (response) => {
  if (response.error) {
    console.error('Supabase response error:', response.error);
    throw new Error(response.error.message || 'An unexpected error occurred');
  }
  return response.data;
};

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