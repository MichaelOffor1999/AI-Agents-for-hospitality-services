import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 70;

export default function SideNav() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [animation] = useState(new Animated.Value(1)); // 1 = expanded, 0 = collapsed
  const navigation = useNavigation();
  const route = useRoute();
  const { darkMode, setIsAuthenticated } = useApp();

  const menuItems = [
    { name: 'Dashboard', icon: 'analytics', route: 'Dashboard' },
    { name: 'Orders', icon: 'basket', route: 'Orders' },
    { name: 'Menu', icon: 'restaurant', route: 'Menu' },
    { name: 'Transcripts', icon: 'chatbubbles', route: 'Transcripts' },
    { name: 'Business Profile', icon: 'business', route: 'BusinessProfile' },
    { name: 'AI Voice', icon: 'mic', route: 'AIVoiceSettings' },
    { name: 'Settings', icon: 'settings', route: 'Settings' },
  ];

  const toggleSidebar = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const handleNavigation = (routeName) => {
    // Navigate directly to the route
    navigation.navigate(routeName);
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('token');
    }
    setIsAuthenticated(false);
  };

  const currentRouteName = route.name;

  // Interpolate width based on animation value
  const sidebarWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED],
  });

  const isWeb = Platform.OS === 'web';
  const windowHeight = Dimensions.get('window').height;

  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          width: sidebarWidth,
          backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
          borderRightColor: darkMode ? '#374151' : '#E5E7EB',
          height: isWeb ? '100vh' : windowHeight,
        },
      ]}
    >
      {/* Header with Logo and Toggle */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="restaurant" size={32} color="#4F83FF" />
          {isExpanded && (
            <Text style={[styles.logoText, { color: darkMode ? '#F3F4F6' : '#111827' }]}>
              RestaurantAI
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={toggleSidebar} style={styles.toggleButton}>
          <Ionicons
            name={isExpanded ? 'chevron-back' : 'chevron-forward'}
            size={24}
            color={darkMode ? '#9CA3AF' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      {/* Navigation Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = currentRouteName === item.route;
          return (
            <MenuItem
              key={item.route}
              item={item}
              isActive={isActive}
              isExpanded={isExpanded}
              darkMode={darkMode}
              onPress={() => handleNavigation(item.route)}
            />
          );
        })}
      </View>

      {/* Footer with Logout */}
      <View style={styles.footer}>
        <MenuItem
          item={{ name: 'Logout', icon: 'log-out' }}
          isActive={false}
          isExpanded={isExpanded}
          darkMode={darkMode}
          onPress={handleLogout}
          isLogout
        />
      </View>
    </Animated.View>
  );
}

// Separate component for menu items with hover support
function MenuItem({ item, isActive, isExpanded, darkMode, onPress, isLogout = false }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => Platform.OS === 'web' && setIsHovered(true);
  const handleMouseLeave = () => Platform.OS === 'web' && setIsHovered(false);

  const iconColor = isLogout 
    ? (darkMode ? '#EF4444' : '#DC2626')
    : (isActive ? '#4F83FF' : darkMode ? '#9CA3AF' : '#6B7280');

  const textColor = isLogout
    ? (darkMode ? '#EF4444' : '#DC2626')
    : (isActive ? '#4F83FF' : darkMode ? '#D1D5DB' : '#374151');

  const backgroundColor = isActive
    ? (darkMode ? '#374151' : '#EFF6FF')
    : (isHovered ? (darkMode ? '#2D3748' : '#F3F4F6') : 'transparent');

  return (
    <TouchableOpacity
      onPress={onPress}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={[
        styles.menuItem,
        { backgroundColor },
        !isExpanded && styles.menuItemCollapsed,
      ]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={iconColor}
        style={styles.menuIcon}
      />
      {isExpanded && (
        <Text style={[styles.menuText, { color: textColor }]}>
          {item.name}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    borderRightWidth: 1,
    flexDirection: 'column',
    ...Platform.select({
      web: {
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        flex: 0,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  toggleButton: {
    padding: 4,
    borderRadius: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      },
    }),
  },
  menuContainer: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s',
        userSelect: 'none',
      },
    }),
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  menuIcon: {
    width: 24,
    marginRight: 0,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
