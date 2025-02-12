import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadUserPreference = async () => {
      const userData = await userService.getCurrentUser();
      if (userData && userData.user_preferences) {
        const darkModePreference = userData.user_preferences[0]?.dark_mode ?? false;
        setIsDarkMode(darkModePreference);
      }
    };
    loadUserPreference();
  }, []);

  const toggleTheme = async () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      userService.updatePreferences(user.id, { dark_mode: newMode });
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};