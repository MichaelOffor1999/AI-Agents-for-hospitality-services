import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
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
import AppLayout from '../components/AppLayout';
import { useApp } from '../context/AppContext';

const Stack = createStackNavigator();

// Wrapper component to add AppLayout to authenticated screens
function ScreenWithLayout({ component: Component, ...props }) {
  return (
    <AppLayout>
      <Component {...props} />
    </AppLayout>
  );
}

export default function MainStack() {
  const { darkMode, isAuthenticated } = useApp();
  console.log('MainStack rendering. darkMode:', darkMode, 'isAuthenticated:', isAuthenticated);

  return (
    <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Main screens with sidebar layout */}
          <Stack.Screen name="Dashboard">
            {(props) => <ScreenWithLayout component={DashboardScreen} {...props} />}
          </Stack.Screen>
          <Stack.Screen name="Orders">
            {(props) => <ScreenWithLayout component={OrdersScreen} {...props} />}
          </Stack.Screen>
          <Stack.Screen name="Menu">
            {(props) => <ScreenWithLayout component={MenuManagementScreen} {...props} />}
          </Stack.Screen>
          <Stack.Screen name="Transcripts">
            {(props) => <ScreenWithLayout component={TranscriptsScreen} {...props} />}
          </Stack.Screen>
          <Stack.Screen name="BusinessProfile">
            {(props) => <ScreenWithLayout component={BusinessProfileScreen} {...props} />}
          </Stack.Screen>
          <Stack.Screen name="AIVoiceSettings">
            {(props) => <ScreenWithLayout component={AIVoiceSettingsScreen} {...props} />}
          </Stack.Screen>
          <Stack.Screen name="Settings">
            {(props) => <ScreenWithLayout component={SettingsScreen} {...props} />}
          </Stack.Screen>
          
          {/* Modal/Detail screens without sidebar */}
          <Stack.Screen 
            name="OrderDetails" 
            component={OrderDetailsScreen} 
            options={{ headerShown: true, title: 'Order Details', presentation: 'card' }} 
          />
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
