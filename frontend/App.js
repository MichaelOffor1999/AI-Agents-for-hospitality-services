import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import MainStack from './src/navigation/MainStack';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function FallbackUI({ error }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' }}>
      <StatusBar style="auto" />
      <Ionicons name="alert-circle" size={64} color="#EF4444" style={{ marginBottom: 16 }} />
      <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 22, marginBottom: 8 }}>App Error</Text>
      <Text style={{ color: '#333', fontSize: 16, marginBottom: 8 }}>{error?.toString() || 'Unknown error occurred.'}</Text>
      <Text style={{ color: '#666', fontSize: 14, textAlign: 'center' }}>Please check your code or contact support.</Text>
    </View>
  );
}

export default function App() {
  console.log('App component mounted!');
  return (
    <ErrorBoundary FallbackComponent={FallbackUI}>
      <AppProvider>
        <MainStack />
      </AppProvider>
    </ErrorBoundary>
  );
}

// --- WEB ROOT FALLBACK: Show a visible error if the app fails to mount ---
if (typeof document !== 'undefined') {
  window.addEventListener('error', (e) => {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `<div style="color:#EF4444;font-size:24px;padding:32px;text-align:center;">App failed to mount.<br/>Error: ${e.message || e.toString()}<br/>Check your console for details.</div>`;
    }
  });
  const root = document.getElementById('root');
  if (root && root.innerHTML.trim() === '') {
    root.innerHTML = '<div style="color:#EF4444;font-size:24px;padding:32px;text-align:center;">App failed to mount.<br/>Check your console for errors.</div>';
  }
}
