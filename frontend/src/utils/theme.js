// src/utils/theme.js
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const light = {
  bg: '#f8f9fa',
  headerGlass: 'rgba(255,255,255,0.7)',
  cardGlass: 'rgba(255,255,255,0.6)',
  chartIconBg: '#f0f4ff',
  primary: '#4F83FF',
  primaryRGBA: (opacity = 1) => `rgba(79, 131, 255, ${opacity})`,
  icon: '#4F83FF',
  iconDim: '#888',
  textStrong: '#1a1a1a',
  textDim: '#666',
  textDimRGBA: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
  border: '#e0e0e0',
  buttonBg: '#fff',
  success: '#10B981',
  danger: '#EF4444',
  accent: '#8B5CF6',
  chartGradientFrom: '#f8f9ff',
  chartGradientTo: '#e0e7ff',
};

const dark = {
  bg: '#18181b',
  headerGlass: 'rgba(36,37,42,0.85)',
  cardGlass: 'rgba(36,37,42,0.85)',
  chartIconBg: '#232336',
  primary: '#4F83FF',
  primaryRGBA: (opacity = 1) => `rgba(79, 131, 255, ${opacity})`,
  icon: '#4F83FF',
  iconDim: '#888',
  textStrong: '#f3f4f6',
  textDim: '#a1a1aa',
  textDimRGBA: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
  border: '#232336',
  buttonBg: '#232336',
  success: '#10B981',
  danger: '#EF4444',
  accent: '#8B5CF6',
  chartGradientFrom: '#232336',
  chartGradientTo: '#18181b',
};

export function useTheme() {
  const { darkMode } = useContext(AppContext);
  return darkMode ? dark : light;
}

export const theme = { light, dark };
