import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { linking } from './src/navigation/linking';
import { Platform, View, Text } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Add web-specific styles
    if (Platform.OS === 'web') {
      try {
        const style = document.createElement('style');
        style.textContent = `
          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif;
          }
          * {
            box-sizing: border-box;
          }
          input, button {
            font-family: inherit;
          }
        `;
        document.head.appendChild(style);
      } catch (err) {
        console.error('Error initializing web styles:', err);
        setError(err.message);
      }
    }
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
          An error occurred while initializing the app
        </Text>
        <Text style={{ color: 'red', fontSize: 12 }}>{error}</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer 
            linking={Platform.OS === 'web' ? linking : undefined}
            fallback={<View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />}
            onStateChange={(state) => {
              if (Platform.OS === 'web') {
                console.log('Navigation state changed:', state);
              }
            }}
            documentTitle={{
              formatter: (options, route) => {
                if (route?.name) {
                  return `${route.name} - Space Learn`;
                }
                return 'Space Learn';
              },
            }}
          >
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
} 