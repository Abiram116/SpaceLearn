// App Constants
export const APP_NAME = 'Space Learn';
export const APP_VERSION = '1.0.0';

// API Endpoints
export const API_BASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const DEEPSEEK_API_URL = process.env.EXPO_PUBLIC_DEEPSEEK_API_URL;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_PREFERENCES: '@user_preferences',
  THEME: '@app_theme',
};

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_AGE: 13,
  MAX_BIO_LENGTH: 200,
  ALLOWED_GENDERS: ['male', 'female', 'other', 'prefer_not_to_say'],
};

// Navigation Routes
export const ROUTES = {
  AUTH: {
    SIGN_IN: 'SignIn',
    SIGN_UP: 'SignUp',
    FORGOT_PASSWORD: 'ForgotPassword',
    CHANGE_PASSWORD: 'ChangePassword',
  },
  MAIN: {
    HOME: 'Home',
    SUBJECTS: 'Subjects',
    NOTES: 'Notes',
    ASSIGNMENTS: 'Assignments',
    PROFILE: 'Profile',
  },
  LEARNING: {
    SUBSPACE: 'Subspace',
    EDIT_SUBSPACE: 'EditSubspace',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    WEAK_PASSWORD: 'Password must be at least 6 characters long',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
    EMAIL_IN_USE: 'Email is already in use',
    INVALID_EMAIL: 'Please enter a valid email address',
  },
  PROFILE: {
    INVALID_AGE: 'You must be at least 13 years old',
    INVALID_GENDER: 'Please select a valid gender',
    BIO_TOO_LONG: 'Bio cannot exceed 200 characters',
  },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    PASSWORD_RESET: 'Password reset instructions have been sent to your email',
    PASSWORD_CHANGED: 'Password updated successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
  },
};

// Default Values
export const DEFAULTS = {
  AVATAR_URL: null,
  THEME: 'light',
  NOTIFICATIONS_ENABLED: true,
}; 