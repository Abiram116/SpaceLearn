import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { linking } from './src/navigation/linking';
import { Platform, View, Text } from 'react-native';

// Initialize web-specific polyfills and configurations
if (Platform.OS === 'web') {
  // Add web-specific polyfills here if needed
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

export default function App() {
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

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
            -webkit-tap-highlight-color: transparent;
          }
          input, button {
            font-family: inherit;
          }
          #root {
            display: flex;
            flex-direction: column;
          }
        `;
        document.head.appendChild(style);
        setInitialized(true);
      } catch (err) {
        console.error('Error initializing web styles:', err);
        setError(err.message);
      }
    } else {
      setInitialized(true);
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

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
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
  );
} 