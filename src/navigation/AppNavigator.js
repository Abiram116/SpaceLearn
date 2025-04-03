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
import ChatScreen from '../screens/learning/ChatScreen';

// Assignment Screens
import AssignmentsScreen from '../screens/assignments/AssignmentsScreen';
import AssignmentQuizScreen from '../screens/AssignmentQuizScreen';

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
        headerShown: false,
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
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Subjects" component={SubjectsScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Assignments" component={AssignmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
        headerShown: false,
        animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
        gestureEnabled: Platform.OS !== 'web',
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Subspace" component={SubspaceScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="AssignmentQuiz" component={AssignmentQuizScreen} />
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
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="MainApp" component={MainAppStack} />
      <Stack.Screen name="Assignments" component={AssignmentsScreen} />
      <Stack.Screen name="AssignmentQuiz" component={AssignmentQuizScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 