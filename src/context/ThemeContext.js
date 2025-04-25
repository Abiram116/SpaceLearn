import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../styles/theme';

const ThemeContext = createContext({
  theme: { colors },
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceTheme === 'dark');

  useEffect(() => {
    // Update theme when device theme changes
    setIsDark(deviceTheme === 'dark');
  }, [deviceTheme]);

  // Define light and dark theme colors
  const lightTheme = {
    colors: {
      ...colors,
    },
  };

  const darkTheme = {
    colors: {
      primary: '#6366F1',
      primaryLight: '#312E81',
      secondary: '#10B981',
      background: '#111827',
      card: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#374151',
      error: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
  };

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 