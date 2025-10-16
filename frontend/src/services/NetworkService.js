import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NetworkService {
  constructor() {
    this.isConnected = true;
    this.listeners = [];
    this.init();
  }

  init() {
    NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected;
      
      if (wasConnected !== this.isConnected) {
        this.notifyListeners(this.isConnected);
      }
    });
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(isConnected) {
    this.listeners.forEach(listener => listener(isConnected));
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  async checkConnection() {
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected;
    return this.isConnected;
  }
}

class OfflineStorageService {
  static KEYS = {
    DASHBOARD_STATS: 'dashboard_stats',
    ORDERS: 'orders',
    MENU_ITEMS: 'menu_items',
    TENANT: 'tenant',
    PENDING_ACTIONS: 'pending_actions',
  };

  static async store(key, data) {
    try {
      const jsonData = JSON.stringify({
        data,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  static async retrieve(key, maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    try {
      const jsonData = await AsyncStorage.getItem(key);
      if (!jsonData) return null;

      const { data, timestamp } = JSON.parse(jsonData);
      
      // Check if data is too old
      if (Date.now() - timestamp > maxAge) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return null;
    }
  }

  static async addPendingAction(action) {
    try {
      const existingActions = await this.retrieve(this.KEYS.PENDING_ACTIONS) || [];
      const updatedActions = [...existingActions, {
        ...action,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }];
      await this.store(this.KEYS.PENDING_ACTIONS, updatedActions);
    } catch (error) {
      console.error('Error adding pending action:', error);
    }
  }

  static async getPendingActions() {
    return await this.retrieve(this.KEYS.PENDING_ACTIONS) || [];
  }

  static async clearPendingActions() {
    try {
      await AsyncStorage.removeItem(this.KEYS.PENDING_ACTIONS);
    } catch (error) {
      console.error('Error clearing pending actions:', error);
    }
  }

  static async removePendingAction(actionId) {
    try {
      const existingActions = await this.retrieve(this.KEYS.PENDING_ACTIONS) || [];
      const filteredActions = existingActions.filter(action => action.id !== actionId);
      await this.store(this.KEYS.PENDING_ACTIONS, filteredActions);
    } catch (error) {
      console.error('Error removing pending action:', error);
    }
  }
}

const networkService = new NetworkService();

export { networkService, OfflineStorageService };
