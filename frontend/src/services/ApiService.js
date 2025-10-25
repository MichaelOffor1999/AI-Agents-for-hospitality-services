import AsyncStorage from '@react-native-async-storage/async-storage';
import { networkService, OfflineStorageService } from './NetworkService';

const BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api/v1' 
  : 'https://your-production-api.com/api/v1';

// Request timeout
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Mock data for offline/development
const mockTenant = {
  id: '1',
  name: 'Demo Restaurant',
  phone: '+1-555-0123',
  email: 'demo@restaurant.com',
  address: '123 Main St, City, State 12345',
  businessHours: {
    monday: { open: '09:00', close: '21:00', isOpen: true },
    tuesday: { open: '09:00', close: '21:00', isOpen: true },
    wednesday: { open: '09:00', close: '21:00', isOpen: true },
    thursday: { open: '09:00', close: '21:00', isOpen: true },
    friday: { open: '09:00', close: '22:00', isOpen: true },
    saturday: { open: '10:00', close: '22:00', isOpen: true },
    sunday: { open: '10:00', close: '20:00', isOpen: true },
  },
  aiSettings: {
    greeting: 'Thank you for calling Demo Restaurant! How can I help you today?',
    tone: 'friendly',
    responseTemplates: [
      'I\'d be happy to help you with that.',
      'Let me check that for you.',
      'Is there anything else I can help you with?'
    ],
    callHandling: {
      maxCallDuration: 300,
      transferToHuman: true,
      recordCalls: true,
    }
  }
};

class ApiService {
  // Login API
  async login({ email, password }) {
    return this.request('/login', {
      method: 'POST',
      body: { email, password },
    });
  }
  constructor() {
    this.baseURL = BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Signup API
  async signup(data) {
    // Map password to password_hash for backend compatibility
    const payload = {
      ...data,
      password_hash: data.password,
    };
    delete payload.password;
    return this.request('/signup', {
      method: 'POST',
      body: payload,
    });
  }

  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem('auth_token', token);
      this.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  async request(endpoint, options = {}) {
    try {
      // Check network connectivity
      const isConnected = await networkService.checkConnection();
      
      const token = await this.getAuthToken();
      if (token) {
        this.headers.Authorization = `Bearer ${token}`;
      }

      const config = {
        headers: this.headers,
        ...options,
      };

      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }

      // If offline, try to handle the request offline
      if (!isConnected) {
        return await this.handleOfflineRequest(endpoint, options);
      }

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        console.log(`[ApiService] Response status for ${endpoint}: ${response.status}`);
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          console.log('[ApiService] 401 Unauthorized - Token expired or invalid');
          console.log('[ApiService] Clearing auth data and reloading...');
          // Clear auth data
          await AsyncStorage.multiRemove(['auth_token', 'tenant_id']);
          // Reload the app to redirect to login
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
          throw new Error('Session expired. Please log in again.');
        }
        
        if (!response.ok) {
          console.log(`[ApiService] Request failed: ${response.status} ${response.statusText}`);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = response;
        }

        // Cache successful GET requests
        if (!options.method || options.method === 'GET') {
          const cacheKey = this.getCacheKey(endpoint);
          await OfflineStorageService.store(cacheKey, data);
        }

        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // If network error, try offline handling
        if (fetchError.name === 'AbortError' || fetchError.name === 'TypeError') {
          return await this.handleOfflineRequest(endpoint, options);
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      
      // Last resort: try offline handling
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return await this.handleOfflineRequest(endpoint, options);
      }
      
      throw error;
    }
  }

  async handleOfflineRequest(endpoint, options) {
    console.log(`Handling offline request for: ${endpoint}`);
    
    // For GET requests, try to return cached data
    if (!options.method || options.method === 'GET') {
      const cacheKey = this.getCacheKey(endpoint);
      const cachedData = await OfflineStorageService.retrieve(cacheKey);
      
      if (cachedData) {
        console.log(`Returning cached data for: ${endpoint}`);
        return cachedData;
      }
    }

    // For write operations, queue them for later
    if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
      await OfflineStorageService.addPendingAction({
        endpoint,
        options,
        type: 'api_request',
      });
      
      // Return optimistic response for certain operations
      return this.getOptimisticResponse(endpoint, options);
    }

    // Return mock data as fallback
    return this.getMockData(endpoint);
  }

  getCacheKey(endpoint) {
    if (endpoint.includes('/tenant')) return OfflineStorageService.KEYS.TENANT;
    if (endpoint.includes('/orders')) return OfflineStorageService.KEYS.ORDERS;
    if (endpoint.includes('/menu')) return OfflineStorageService.KEYS.MENU_ITEMS;
    if (endpoint.includes('/analytics')) return OfflineStorageService.KEYS.DASHBOARD_STATS;
    return `cache_${endpoint.replace(/[\/\?&=]/g, '_')}`;
  }

  getMockData(endpoint) {
    if (endpoint.includes('/tenant')) return mockTenant;
    if (endpoint.includes('/orders')) return [];
    if (endpoint.includes('/menu')) return [];
    if (endpoint.includes('/analytics')) return { 
      revenue: 0, 
      orders: 0, 
      items: 0, 
      growth: 0,
      chartData: [],
      period: 'today'
    };
    return null;
  }

  getOptimisticResponse(endpoint, options) {
    // Return optimistic responses for write operations
    if (options.method === 'POST') {
      return { success: true, id: Date.now().toString(), ...options.body };
    }
    if (options.method === 'PUT' || options.method === 'PATCH') {
      return { success: true, ...options.body };
    }
    if (options.method === 'DELETE') {
      return { success: true };
    }
    return { success: true };
  }

  // Tenant/Business Profile APIs
  async getTenant(tenantId) {
    return this.request(`/tenants/${tenantId}`);
  }

  async updateTenant(tenantId, data) {
    return this.request(`/tenants/${tenantId}`, {
      method: 'PUT',
      body: data,
    });
  }

  async getEffectiveConfig(tenantId) {
    return this.request(`/tenants/${tenantId}/config/effective`);
  }

  async previewGreeting(tenantId) {
    return this.request(`/tenants/${tenantId}/preview/greeting`, {
      method: 'POST',
    });
  }

  // Restaurant APIs
  async createRestaurant(data) {
    return this.request('/restaurants', {
      method: 'POST',
      body: data,
    });
  }

  async updateRestaurant(restaurantId, data) {
    return this.request(`/restaurants/${restaurantId}`, {
      method: 'PUT',
      body: data,
    });
  }

  async getRestaurant(restaurantId) {
    return this.request(`/restaurants/${restaurantId}`);
  }

  async getRestaurants() {
    return this.request('/restaurants');
  }

  // Menu APIs
  async getMenu(tenantId) {
    return this.request(`/menu?tenant_id=${tenantId}`);
  }

  async updateMenuItem(tenantId, itemId, data) {
    return this.request(`/menu/${itemId}`, {
      method: 'PUT',
      body: { ...data, tenant_id: tenantId },
    });
  }

  async createMenuItem(tenantId, data) {
    return this.request('/menu', {
      method: 'POST',
      body: { ...data, tenant_id: tenantId },
    });
  }

  async deleteMenuItem(itemId) {
    return this.request(`/menu/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Orders APIs
  async getOrders(tenantId, filters = {}) {
    const queryParams = new URLSearchParams({
      tenant_id: tenantId,
      ...filters,
    });
    return this.request(`/orders?${queryParams}`);
  }

  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async getOrderReceipt(orderId) {
    return this.request(`/orders/${orderId}/receipt`);
  }

  // Transcripts APIs
  async getTranscripts(tenantId, filters = {}) {
    const queryParams = new URLSearchParams({
      tenant_id: tenantId,
      ...filters,
    });
    return this.request(`/transcripts?${queryParams}`);
  }

  async createTranscript(data) {
    return this.request('/transcripts', {
      method: 'POST',
      body: data,
    });
  }

  // Analytics APIs
  async getDashboardStats(tenantId, dateRange = {}) {
    const queryParams = new URLSearchParams({
      tenant_id: tenantId,
      ...dateRange,
    });
    return this.request(`/analytics/dashboard?${queryParams}`);
  }

  async getRevenueByDay(tenantId, days = 14) {
    return this.request(`/analytics/revenue-by-day?tenant_id=${tenantId}&days=${days}`);
  }

  async getDailyTotals(tenantId, dateRange = {}) {
    const queryParams = new URLSearchParams({
      tenant_id: tenantId,
      ...dateRange,
    });
    return this.request(`/analytics/daily-totals?${queryParams}`);
  }

  async exportData(tenantId, type, dateRange = {}) {
    const queryParams = new URLSearchParams({
      tenant_id: tenantId,
      type,
      ...dateRange,
    });
    return this.request(`/export?${queryParams}`);
  }

  // Business Profile APIs
  async getBusinessProfile() {
    try {
      return await networkService.request('/tenant/profile', {
        method: 'GET',
        headers: this.headers,
      });
    } catch (error) {
      console.log('Using mock business profile data');
      return {
        success: true,
        data: {
          name: 'The Gourmet Kitchen',
          description: 'Fine dining restaurant specializing in modern Irish cuisine with locally sourced ingredients.',
          phone: '+353 1 234 5678',
          email: 'info@gourmetkitchen.ie',
          website: 'www.gourmetkitchen.ie',
          address: '123 Main Street, Dublin, D01 F2G3',
          timezone: 'Europe/Dublin',
          industry: 'Restaurant',
          languages: ['English', 'Irish'],
          establishedYear: '2018',
          ownerManager: 'Chef Michael O\'Brien',
          capacity: '80',
          parkingAvailable: true,
          wheelchairAccessible: true,
          wifiAvailable: true,
          outdoorSeating: true,
          socialMedia: {
            facebook: '@gourmetkitchen',
            instagram: '@gourmetkitchen_dublin',
            twitter: '@gourmetkitchen',
          },
          cuisineType: ['Irish', 'European', 'Modern'],
          specialties: ['Seafood', 'Locally Sourced Ingredients', 'Seasonal Menu', 'Wine Pairing'],
          dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'],
          priceRange: '€€€',
          averageMealPrice: '45-65',
          awards: ['Michelin Recommended 2023', 'Best Irish Restaurant 2022', 'Sustainable Restaurant Award'],
          certifications: ['Food Safety Certified', 'Organic Certified', 'Sustainable Dining'],
        }
      };
    }
  }

  async updateBusinessProfile(profileData) {
    try {
      return await networkService.request('/tenant/profile', {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      console.log('Mock: Business profile updated');
      return {
        success: true,
        data: profileData
      };
    }
  }

  async getBusinessHours() {
    try {
      return await networkService.request('/tenant/hours', {
        method: 'GET',
        headers: this.headers,
      });
    } catch (error) {
      console.log('Using mock business hours data');
      return {
        success: true,
        data: {
          monday: { isOpen: true, open: '17:00', close: '22:00' },
          tuesday: { isOpen: true, open: '17:00', close: '22:00' },
          wednesday: { isOpen: true, open: '17:00', close: '22:00' },
          thursday: { isOpen: true, open: '17:00', close: '22:00' },
          friday: { isOpen: true, open: '17:00', close: '23:00' },
          saturday: { isOpen: true, open: '12:00', close: '23:00' },
          sunday: { isOpen: true, open: '12:00', close: '21:00' },
        }
      };
    }
  }

  async updateBusinessHours(hoursData) {
    try {
      return await networkService.request('/tenant/hours', {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(hoursData),
      });
    } catch (error) {
      console.log('Mock: Business hours updated');
      return {
        success: true,
        data: hoursData
      };
    }
  }

  async getBusinessCapabilities() {
    try {
      return await networkService.request('/tenant/capabilities', {
        method: 'GET',
        headers: this.headers,
      });
    } catch (error) {
      console.log('Using mock business capabilities data');
      return {
        success: true,
        data: {
          services: {
            dineIn: true,
            takeout: true,
            delivery: true,
            catering: true,
            privateEvents: true,
            groupBookings: true,
          },
          deliveryServices: ['Deliveroo', 'Just Eat', 'Uber Eats'],
          paymentMethods: ['Cash', 'Card', 'Contactless', 'Apple Pay', 'Google Pay'],
          reservationSystem: 'OpenTable',
          maxGroupSize: '20',
          privateRoomCapacity: '25',
          cateringMinOrder: '€300',
          deliveryRadius: '10km',
          deliveryMinOrder: '€25',
          deliveryFee: '€3.50',
        }
      };
    }
  }

  async updateBusinessCapabilities(capabilitiesData) {
    try {
      return await networkService.request('/tenant/capabilities', {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(capabilitiesData),
      });
    } catch (error) {
      console.log('Mock: Business capabilities updated');
      return {
        success: true,
        data: capabilitiesData
      };
    }
  }

  async getBusinessPolicies() {
    try {
      return await networkService.request('/tenant/policies', {
        method: 'GET',
        headers: this.headers,
      });
    } catch (error) {
      console.log('Using mock business policies data');
      return {
        success: true,
        data: {
          reservationPolicy: 'Reservations recommended, walk-ins welcome based on availability',
          cancellationPolicy: '24 hours notice required for cancellations',
          noShowPolicy: 'Tables held for 15 minutes past reservation time',
          groupBookingPolicy: 'Groups of 8+ require deposit and set menu',
          childrenPolicy: 'Children welcome, high chairs available',
          petPolicy: 'Well-behaved dogs welcome in outdoor seating area',
          dressCode: 'Smart casual',
          smokingPolicy: 'Non-smoking establishment, designated outdoor area available',
          ageRestriction: 'No age restrictions during day, 18+ after 9pm on weekends',
        }
      };
    }
  }

  async updateBusinessPolicies(policiesData) {
    try {
      return await networkService.request('/tenant/policies', {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(policiesData),
      });
    } catch (error) {
      console.log('Mock: Business policies updated');
      return {
        success: true,
        data: policiesData
      };
    }
  }

  async getBusinessFAQs() {
    try {
      return await networkService.request('/tenant/faqs', {
        method: 'GET',
        headers: this.headers,
      });
    } catch (error) {
      console.log('Using mock business FAQs data');
      return {
        success: true,
        data: [
          {
            id: '1',
            question: 'Do you take reservations?',
            answer: 'Yes, we accept reservations through OpenTable, by phone, or in person. We recommend booking ahead, especially for weekends.',
          },
          {
            id: '2',
            question: 'Do you have vegetarian/vegan options?',
            answer: 'Absolutely! We have a dedicated vegetarian section on our menu and can accommodate vegan and other dietary requirements with advance notice.',
          },
          {
            id: '3',
            question: 'Is there parking available?',
            answer: 'Yes, we have a small private car park behind the restaurant, and there\'s street parking available on Main Street.',
          },
          {
            id: '4',
            question: 'Do you offer delivery?',
            answer: 'Yes, we offer delivery through Deliveroo, Just Eat, and Uber Eats within a 10km radius. Minimum order is €25.',
          },
          {
            id: '5',
            question: 'Can you accommodate large groups?',
            answer: 'Yes, we can accommodate groups up to 20 people in our main dining room, or up to 25 in our private dining room. Groups of 8+ require a deposit.',
          },
        ]
      };
    }
  }

  async updateBusinessFAQs(faqsData) {
    try {
      return await networkService.request('/tenant/faqs', {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(faqsData),
      });
    } catch (error) {
      console.log('Mock: Business FAQs updated');
      return {
        success: true,
        data: faqsData
      };
    }
  }

  async getSpecialOffers() {
    try {
      return await networkService.request('/tenant/offers', {
        method: 'GET',
        headers: this.headers,
      });
    } catch (error) {
      console.log('Using mock offers data');
      return {
        success: true,
        data: [
          {
            id: '1',
            title: 'Happy Hour',
            description: '50% off appetizers 4-6pm weekdays',
            validUntil: '2024-12-31',
          }
        ]
      };
    }
  }

  async updateSpecialOffers(offersData) {
    try {
      return await networkService.request('/tenant/offers', {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(offersData),
      });
    } catch (error) {
      console.log('Mock: Special offers updated');
      return {
        success: true,
        data: offersData
      };
    }
  }

  async getAdditionalBusinessInfo() {
    try {
      return await networkService.request('/tenant/additional-info', {
        method: 'GET',
        headers: this.headers,
      });
    } catch (error) {
      console.log('Using mock additional business info data');
      return {
        success: true,
        data: {
          keyStaff: [
            {
              id: '1',
              name: 'Chef Michael O\'Brien',
              role: 'Head Chef & Owner',
              bio: 'Award-winning chef with 15 years experience in fine dining',
              specialization: 'Modern Irish cuisine, seasonal ingredients',
            }
          ],
          accessibility: {
            wheelchairAccess: true,
            accessibleRestrooms: true,
            braileMenus: false,
            hearingLoop: false,
            serviceAnimals: true,
            accessibleParking: true,
            elevatorAccess: false,
          },
          sustainability: {
            localSourcing: 'Source 80% of ingredients locally within 50km',
            wasteReduction: 'Composting program, minimal food waste policy',
            energyEfficiency: 'LED lighting, energy-efficient appliances',
            sustainablePractices: ['Recyclable packaging', 'Water conservation', 'Seasonal menu'],
          },
          technology: {
            wifiDetails: 'Free WiFi: GourmetGuest, password available from staff',
            chargingStations: 'USB charging points available at select tables',
            mobileOrdering: false,
            loyaltyProgram: 'Points-based loyalty program with mobile app',
            digitalMenu: 'QR code menus available, printed menus on request',
          }
        }
      };
    }
  }

  async updateAdditionalBusinessInfo(additionalData) {
    try {
      return await networkService.request('/tenant/additional-info', {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(additionalData),
      });
    } catch (error) {
      console.log('Mock: Additional business info updated');
      return {
        success: true,
        data: additionalData
      };
    }
  }
}

export default new ApiService();
