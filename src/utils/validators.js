import { VALIDATION } from './constants';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
};

export const validateAge = (age) => {
  const ageNum = parseInt(age);
  return !isNaN(ageNum) && ageNum >= VALIDATION.MIN_AGE;
};

export const validateGender = (gender) => {
  return VALIDATION.ALLOWED_GENDERS.includes(gender?.toLowerCase());
};

export const validateBio = (bio) => {
  return !bio || bio.length <= VALIDATION.MAX_BIO_LENGTH;
};

export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateForm = (formData, requiredFields = []) => {
  const errors = {};

  // Validate required fields
  requiredFields.forEach(field => {
    if (!validateRequired(formData[field])) {
      errors[field] = 'This field is required';
    }
  });

  // Validate specific fields if they exist
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.password && !validatePassword(formData.password)) {
    errors.password = `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long`;
  }

  if (formData.confirmPassword && !validatePasswordMatch(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (formData.age && !validateAge(formData.age)) {
    errors.age = `You must be at least ${VALIDATION.MIN_AGE} years old`;
  }

  if (formData.gender && !validateGender(formData.gender)) {
    errors.gender = 'Please select a valid gender';
  }

  if (formData.bio && !validateBio(formData.bio)) {
    errors.bio = `Bio cannot exceed ${VALIDATION.MAX_BIO_LENGTH} characters`;
  }

  if (formData.username && !validateUsername(formData.username)) {
    errors.username = 'Username must be 3-20 characters and can only contain letters, numbers, and underscores';
  }

  if (formData.fullName && !validateName(formData.fullName)) {
    errors.fullName = 'Please enter a valid name';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}; 