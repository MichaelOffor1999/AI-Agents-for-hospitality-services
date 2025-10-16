/**
 * Production Configuration Manager
 */

export const Config = {
  // API Configuration
  API: {
    BASE_URL: __DEV__ 
      ? 'http://localhost:8000/api/v1' 
      : 'https://your-production-api.com/api/v1',
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // App Configuration
  APP: {
    NAME: 'Restaurant Manager',
    VERSION: '1.0.0',
    BUILD_NUMBER: '1',
    BUNDLE_ID: 'com.yourcompany.restaurantmanager',
  },

  // Feature Flags
  FEATURES: {
    OFFLINE_MODE: true,
    ANALYTICS: !__DEV__,
    CRASH_REPORTING: !__DEV__,
    DEBUG_LOGS: __DEV__,
    MOCK_DATA: __DEV__,
  },

  // Cache Configuration
  CACHE: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
  },

  // Business Rules
  BUSINESS: {
    MAX_MENU_ITEMS: 500,
    MAX_ORDER_ITEMS: 50,
    MIN_ORDER_AMOUNT: 1.00,
    MAX_ORDER_AMOUNT: 10000.00,
    DEFAULT_CURRENCY: 'USD',
    SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD'],
  },

  // UI Configuration
  UI: {
    THEME: {
      PRIMARY_COLOR: '#4F83FF',
      SECONDARY_COLOR: '#F8F9FA',
      ERROR_COLOR: '#FF6B6B',
      SUCCESS_COLOR: '#4CAF50',
      WARNING_COLOR: '#FF9800',
    },
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
  },

  // Security Configuration
  SECURITY: {
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    PASSWORD_MIN_LENGTH: 8,
  },
};

/**
 * Environment-specific configuration
 */
export const getEnvironmentConfig = () => {
  if (__DEV__) {
    return {
      ...Config,
      API: {
        ...Config.API,
        BASE_URL: 'http://localhost:8000/api/v1',
      },
      FEATURES: {
        ...Config.FEATURES,
        MOCK_DATA: true,
        DEBUG_LOGS: true,
        ANALYTICS: false,
        CRASH_REPORTING: false,
      },
    };
  }

  return {
    ...Config,
    FEATURES: {
      ...Config.FEATURES,
      MOCK_DATA: false,
      DEBUG_LOGS: false,
      ANALYTICS: true,
      CRASH_REPORTING: true,
    },
  };
};

/**
 * Feature flag utilities
 */
export const FeatureFlags = {
  isEnabled: (feature) => {
    const config = getEnvironmentConfig();
    return config.FEATURES[feature] || false;
  },

  withFeature: (feature, component, fallback = null) => {
    return FeatureFlags.isEnabled(feature) ? component : fallback;
  },
};

/**
 * Debug utilities
 */
export const Debug = {
  log: (...args) => {
    if (FeatureFlags.isEnabled('DEBUG_LOGS')) {
      console.log('[DEBUG]', ...args);
    }
  },

  warn: (...args) => {
    if (FeatureFlags.isEnabled('DEBUG_LOGS')) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (...args) => {
    console.error('[ERROR]', ...args);
  },

  time: (label) => {
    if (FeatureFlags.isEnabled('DEBUG_LOGS')) {
      console.time(label);
    }
  },

  timeEnd: (label) => {
    if (FeatureFlags.isEnabled('DEBUG_LOGS')) {
      console.timeEnd(label);
    }
  },
};

export default getEnvironmentConfig();
