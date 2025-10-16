import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import TranscriptsScreen from './src/screens/TranscriptsScreen';
import MenuManagementScreen from './src/screens/MenuManagementScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BusinessProfileScreen from './src/screens/BusinessProfileScreenSimple';
import AIVoiceSettingsScreen from './src/screens/AIVoiceSettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F83FF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Menu" component={MenuManagementScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="OrderDetails" 
              component={OrderDetailsScreen}
              options={{ 
                title: 'Order Details',
                headerBackTitle: '',
                headerTintColor: '#000',
              }}
            />
            <Stack.Screen 
              name="Transcripts" 
              component={TranscriptsScreen}
              options={{ 
                title: 'Search Transcripts',
                headerBackTitle: '',
                headerTintColor: '#000',
              }}
            />
            <Stack.Screen 
              name="BusinessProfile" 
              component={BusinessProfileScreen}
              options={{ 
                title: 'Business Profile',
                headerBackTitle: '',
                headerTintColor: '#000',
              }}
            />
            <Stack.Screen 
              name="AIVoiceSettings" 
              component={AIVoiceSettingsScreen}
              options={{ 
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </ErrorBoundary>
  );
}
