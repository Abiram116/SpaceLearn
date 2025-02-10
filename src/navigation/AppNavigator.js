import React, { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../styles/theme';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';

// Main Screens
import EditProfileScreen from '../screens/main/EditProfileScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Learning Screens
import SubjectsScreen from '../screens/learning/SubjectsScreen';
import SubspaceScreen from '../screens/learning/SubspaceScreen';
import NotesScreen from '../screens/learning/NotesScreen';

// Assignment Screens
import AssignmentsScreen from '../screens/assignments/AssignmentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ErrorBoundaryScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <Text style={{ color: colors.text }}>Something went wrong. Please try again.</Text>
  </View>
);

// Tab Navigator for main app screens
const TabNavigator = () => {
  useEffect(() => {
    console.log('TabNavigator mounted');
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Subjects') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Notes') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Assignments') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          ...typography.h2,
          color: colors.text,
        },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Subjects" 
        component={SubjectsScreen}
        options={{ title: 'Your Subjects' }}
      />
      <Tab.Screen 
        name="Notes" 
        component={NotesScreen}
        options={{ title: 'Your Notes' }}
      />
      <Tab.Screen 
        name="Assignments" 
        component={AssignmentsScreen}
        options={{ title: 'Your Tasks' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main App Stack
const MainAppStack = () => {
  useEffect(() => {
    console.log('MainAppStack mounted');
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          ...typography.h2,
          color: colors.text,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Subspace"
        component={SubspaceScreen}
        options={{
          headerShown: true,
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
          gestureEnabled: Platform.OS !== 'web',
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: 'Change Password',
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  useEffect(() => {
    console.log('AppNavigator mounted');
    console.log('Platform:', Platform.OS);
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'web' ? 'none' : 'default',
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Auth" 
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          title: 'Forgot Password',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            ...typography.h2,
            color: colors.text,
          },
        }}
      />
      <Stack.Screen 
        name="MainApp" 
        component={MainAppStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 