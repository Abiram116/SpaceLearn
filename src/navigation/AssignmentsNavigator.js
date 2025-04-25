import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AssignmentsScreen from '../screens/assignments/AssignmentsScreen';
import AssignmentHistoryScreen from '../screens/assignments/AssignmentHistoryScreen';
import { colors } from '../styles/theme';

const Tab = createMaterialTopTabNavigator();

const AssignmentsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIndicatorStyle: { backgroundColor: colors.primary },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Create" component={AssignmentsScreen} />
      <Tab.Screen name="History" component={AssignmentHistoryScreen} />
    </Tab.Navigator>
  );
};

export default AssignmentsNavigator; 