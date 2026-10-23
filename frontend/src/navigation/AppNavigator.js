import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, List, PieChart, Settings } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          if (route.name === 'Home') IconComponent = Home;
          else if (route.name === 'HistoryTab') IconComponent = List;
          else if (route.name === 'Statistics') IconComponent = PieChart;
          else if (route.name === 'Settings') IconComponent = Settings;

          return <IconComponent size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          elevation: 10,
          shadowColor: colors.cardShadow,
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard', headerShown: false }} />
      <Tab.Screen name="HistoryTab" component={ExpensesScreen} options={{ title: 'History' }} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { colors } = useTheme();
  const { isLoggedIn, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!isLoggedIn ? (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
      ) : !user?.isProfileComplete ? (
        <Stack.Screen 
          name="ProfileSetup" 
          component={ProfileSetupScreen} 
          options={{ headerShown: false }} 
        />
      ) : (
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={TabNavigator} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AddExpense" 
            component={AddExpenseScreen}
            options={({ route }) => ({
              title: route.params?.expense ? 'Edit Expense' : 'Add Expense',
              presentation: 'modal',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
            })}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
