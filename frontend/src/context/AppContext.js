import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/ApiService';
import { Tenant } from '../models';

// Initial state
const initialState = {
  tenant: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  dashboardStats: null,
  orders: [],
  transcripts: [],
  menuItems: [],
  filters: {
    dateRange: 'today',
    orderStatus: 'all',
    orderType: 'all',
  },
  darkMode: false, // NEW
};

// Action types
export const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TENANT: 'SET_TENANT',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_DASHBOARD_STATS: 'SET_DASHBOARD_STATS',
  SET_ORDERS: 'SET_ORDERS',
  ADD_ORDER: 'ADD_ORDER',
  UPDATE_ORDER: 'UPDATE_ORDER',
  SET_TRANSCRIPTS: 'SET_TRANSCRIPTS',
  ADD_TRANSCRIPT: 'ADD_TRANSCRIPT',
  SET_MENU_ITEMS: 'SET_MENU_ITEMS',
  UPDATE_MENU_ITEM: 'UPDATE_MENU_ITEM',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
  SET_DARK_MODE: 'SET_DARK_MODE', // NEW
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case ActionTypes.SET_TENANT:
      return { ...state, tenant: action.payload };
    
    case ActionTypes.SET_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload };
    
    case ActionTypes.SET_DASHBOARD_STATS:
      return { ...state, dashboardStats: action.payload };
    
    case ActionTypes.SET_ORDERS:
      return { ...state, orders: action.payload };
    
    case ActionTypes.ADD_ORDER:
      return { ...state, orders: [action.payload, ...state.orders] };
    
    case ActionTypes.UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? action.payload : order
        ),
      };
    
    case ActionTypes.SET_TRANSCRIPTS:
      return { ...state, transcripts: action.payload };
    
    case ActionTypes.ADD_TRANSCRIPT:
      return { ...state, transcripts: [action.payload, ...state.transcripts] };
    
    case ActionTypes.SET_MENU_ITEMS:
      return { ...state, menuItems: action.payload };
    
    case ActionTypes.UPDATE_MENU_ITEM:
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.LOGOUT:
      return { ...initialState };
    
    case ActionTypes.SET_DARK_MODE:
      return { ...state, darkMode: action.payload };
    
    default:
      return state;
  }
};

// Context
export const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Provide a mock tenant and mock data if nothing is found
  const mockTenant = {
    id: 'mock-tenant',
    name: 'Demo Restaurant',
    address: '123 Demo St',
    phone: '555-1234',
    email: 'demo@restaurant.com',
  };
  const mockDashboardStats = {
    todaysRevenue: 1250.50,
    ordersToday: 82,
    avgOrderValue: 15.25,
    missedCalls: 5,
    revenueGrowth: 5.2,
    ordersGrowth: 8.0,
    avgOrderGrowth: -1.5,
    missedCallsGrowth: 10,
    revenueByDay: [450, 680, 520, 480, 780, 320, 620, 890, 445, 667, 523, 789, 445, 1250],
    dailyTotals: [
      { date: 'Oct 26, 2023', orders: 22, gross: 450.50, refunds: 0, net: 450.50 },
      { date: 'Oct 25, 2023', orders: 18, gross: 380.20, refunds: 15, net: 365.20 },
      { date: 'Oct 24, 2023', orders: 25, gross: 512.80, refunds: 0, net: 512.80 },
      { date: 'Oct 23, 2023', orders: 20, gross: 410.00, refunds: 25.50, net: 384.50 },
      { date: 'Oct 22, 2023', orders: 30, gross: 620.00, refunds: 0, net: 620.00 },
    ],
  };

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      // Check for stored auth token
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        await ApiService.setAuthToken(token);
        dispatch({ type: ActionTypes.SET_AUTHENTICATED, payload: true });
        // Load tenant data
        const tenantId = await AsyncStorage.getItem('tenant_id');
        if (tenantId) {
          await loadTenant(tenantId);
        }
      } else {
        // No token/tenant: set mock tenant and mock dashboard data
        dispatch({ type: ActionTypes.SET_TENANT, payload: mockTenant });
        dispatch({ type: ActionTypes.SET_DASHBOARD_STATS, payload: mockDashboardStats });
      }
      // Load dark mode from storage
      const storedDarkMode = await AsyncStorage.getItem('dark_mode');
      if (storedDarkMode !== null) {
        dispatch({ type: ActionTypes.SET_DARK_MODE, payload: storedDarkMode === 'true' });
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      // In a real app, you would call your auth API here
      const { token, tenant } = credentials; // Mock response
      
      await ApiService.setAuthToken(token);
      await AsyncStorage.setItem('tenant_id', tenant.id);
      
      dispatch({ type: ActionTypes.SET_AUTHENTICATED, payload: true });
      dispatch({ type: ActionTypes.SET_TENANT, payload: new Tenant(tenant) });
      
      return true;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return false;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'tenant_id']);
      dispatch({ type: ActionTypes.LOGOUT });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const loadTenant = async (tenantId) => {
    try {
      const tenantData = await ApiService.getTenant(tenantId);
      dispatch({ type: ActionTypes.SET_TENANT, payload: new Tenant(tenantData) });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateTenant = async (updates) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const updatedTenant = await ApiService.updateTenant(state.tenant.id, updates);
      dispatch({ type: ActionTypes.SET_TENANT, payload: new Tenant(updatedTenant) });
      
      return true;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return false;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const loadDashboardStats = async (dateRange = {}) => {
    try {
      if (!state.tenant) return;
      
      const stats = await ApiService.getDashboardStats(state.tenant.id, dateRange);
      dispatch({ type: ActionTypes.SET_DASHBOARD_STATS, payload: stats });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const loadOrders = async (filters = {}) => {
    try {
      if (!state.tenant) return;
      
      const orders = await ApiService.getOrders(state.tenant.id, filters);
      dispatch({ type: ActionTypes.SET_ORDERS, payload: orders });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const updatedOrder = await ApiService.updateOrderStatus(orderId, status);
      dispatch({ type: ActionTypes.UPDATE_ORDER, payload: updatedOrder });
      return true;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return false;
    }
  };

  const loadTranscripts = async (filters = {}) => {
    try {
      if (!state.tenant) return;
      
      const transcripts = await ApiService.getTranscripts(state.tenant.id, filters);
      dispatch({ type: ActionTypes.SET_TRANSCRIPTS, payload: transcripts });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const loadMenuItems = async () => {
    try {
      if (!state.tenant) return;
      
      const menuItems = await ApiService.getMenu(state.tenant.id);
      dispatch({ type: ActionTypes.SET_MENU_ITEMS, payload: menuItems });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateMenuItem = async (itemId, updates) => {
    try {
      const updatedItem = await ApiService.updateMenuItem(state.tenant.id, itemId, updates);
      dispatch({ type: ActionTypes.UPDATE_MENU_ITEM, payload: updatedItem });
      return true;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return false;
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
  };

  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  const toggleDarkMode = async (value) => {
    try {
      await AsyncStorage.setItem('dark_mode', value ? 'true' : 'false');
      dispatch({ type: ActionTypes.SET_DARK_MODE, payload: value });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const value = {
    ...state,
    // Actions
    login,
    logout,
    updateTenant,
    loadDashboardStats,
    loadOrders,
    updateOrderStatus,
    loadTranscripts,
    loadMenuItems,
    updateMenuItem,
    setFilters,
    clearError,
    toggleDarkMode, // NEW
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
