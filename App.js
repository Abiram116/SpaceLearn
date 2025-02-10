import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { linking } from './src/navigation/linking';
import { Platform, View } from 'react-native';

export default function App() {
  useEffect(() => {
    // Add web-specific styles
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: #FFFFFF;
        }
        * {
          box-sizing: border-box;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer 
          linking={Platform.OS === 'web' ? linking : undefined}
          fallback={<View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />}
          onStateChange={(state) => console.log('Navigation state changed:', state)}
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