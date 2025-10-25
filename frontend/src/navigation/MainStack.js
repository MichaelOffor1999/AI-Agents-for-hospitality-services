import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import MenuManagementScreen from '../screens/MenuManagementScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TranscriptsScreen from '../screens/TranscriptsScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import BusinessProfileScreen from '../screens/BusinessProfileScreenSimple';
import AIVoiceSettingsScreen from '../screens/AIVoiceSettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { useApp } from '../context/AppContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const { darkMode } = useApp();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'analytics';
          else if (route.name === 'Orders') iconName = 'basket';
          else if (route.name === 'Menu') iconName = 'restaurant';
          else if (route.name === 'Transcripts') iconName = 'chatbubbles';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: darkMode ? '#4F83FF' : '#4F83FF',
        tabBarInactiveTintColor: darkMode ? '#888' : '#888',
        tabBarStyle: {
          backgroundColor: darkMode ? '#181A20' : '#fff',
          borderTopColor: darkMode ? '#222' : '#e0e0e0',
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Menu" component={MenuManagementScreen} />
      <Tab.Screen name="Transcripts" component={TranscriptsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function MainStack() {
  const { darkMode, isAuthenticated } = useApp();
  console.log('MainStack rendering. darkMode:', darkMode, 'isAuthenticated:', isAuthenticated);

  return (
    <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ headerShown: true, title: 'Order Details' }} />
          <Stack.Screen name="Transcripts" component={TranscriptsScreen} options={{ headerShown: true, title: 'Call Transcripts' }} />
          <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} options={{ headerShown: true, title: 'Business Profile' }} />
          <Stack.Screen name="AIVoiceSettings" component={AIVoiceSettingsScreen} options={{ headerShown: true, title: 'AI Voice Settings' }} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
