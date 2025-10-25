import React from 'react';
import { View, StyleSheet, Platform, ScrollView, SafeAreaView } from 'react-native';
import SideNav from './SideNav';
import { useApp } from '../context/AppContext';

export default function AppLayout({ children }) {
  const { darkMode } = useApp();
  const isWeb = Platform.OS === 'web';

  const Container = isWeb ? View : SafeAreaView;

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: darkMode ? '#111827' : '#F9FAFB' },
      ]}
    >
      <View style={styles.layoutContainer}>
        <SideNav />
        <View style={[styles.content, isWeb && styles.contentWeb]}>
          {children}
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    ...Platform.select({
      web: {
        marginLeft: 70, // Minimum collapsed sidebar width
      },
    }),
  },
  contentWeb: {
    overflowY: 'auto',
    height: '100vh',
  },
});
