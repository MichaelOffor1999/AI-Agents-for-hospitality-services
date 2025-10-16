export class Tenant {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.timezone = data.timezone || 'Europe/Dublin';
    this.industry = data.industry || 'restaurant';
    this.languages = data.languages || ['English'];
    this.logo = data.logo || null;
    this.theme = data.theme || 'default';
    this.openingHours = data.openingHours || this.getDefaultHours();
    this.holidays = data.holidays || [];
    this.orderOptions = data.orderOptions || this.getDefaultOrderOptions();
    this.aiVoiceSettings = data.aiVoiceSettings || this.getDefaultAISettings();
    this.dataRetention = data.dataRetention || 60;
    this.privacyNotes = data.privacyNotes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  getDefaultHours() {
    return {
      Monday: { open: '09:00', close: '22:00', closed: false },
      Tuesday: { open: '09:00', close: '22:00', closed: false },
      Wednesday: { open: '09:00', close: '22:00', closed: false },
      Thursday: { open: '09:00', close: '22:00', closed: false },
      Friday: { open: '09:00', close: '23:00', closed: false },
      Saturday: { open: '10:00', close: '23:00', closed: false },
      Sunday: { open: '10:00', close: '22:00', closed: true },
    };
  }

  getDefaultOrderOptions() {
    return {
      takeaway: true,
      delivery: false,
      dineIn: false,
      deliveryRadius: 5,
      prepMinutes: 20,
    };
  }

  getDefaultAISettings() {
    return {
      greeting: `Hello! Thank you for calling ${this.name}. How can I help you today?`,
      description: 'A welcoming restaurant serving delicious food',
      tone: 'friendly',
      allergenNotes: 'Please let us know about any allergies or dietary requirements',
      unavailablePhrase: 'I\'m sorry, that item is currently unavailable',
      closedMessage: 'Thank you for calling. We are currently closed. Our opening hours are...',
    };
  }

  isOpen(datetime = new Date()) {
    const day = datetime.toLocaleDateString('en-US', { weekday: 'long' });
    const hours = this.openingHours[day];
    
    if (!hours || hours.closed) {
      return false;
    }

    const currentTime = datetime.toTimeString().slice(0, 5);
    return currentTime >= hours.open && currentTime <= hours.close;
  }

  getCurrentStatus() {
    return this.isOpen() ? 'Open' : 'Closed';
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      address: this.address,
      timezone: this.timezone,
      industry: this.industry,
      languages: this.languages,
      logo: this.logo,
      theme: this.theme,
      openingHours: this.openingHours,
      holidays: this.holidays,
      orderOptions: this.orderOptions,
      aiVoiceSettings: this.aiVoiceSettings,
      dataRetention: this.dataRetention,
      privacyNotes: this.privacyNotes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class MenuItem {
  constructor(data = {}) {
    this.id = data.id || null;
    this.tenantId = data.tenantId || null;
    this.sku = data.sku || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.price = data.price || 0;
    this.category = data.category || 'Main';
    this.available = data.available !== undefined ? data.available : true;
    this.allergens = data.allergens || [];
    this.image = data.image || null;
    this.preparationTime = data.preparationTime || 15;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      sku: this.sku,
      name: this.name,
      description: this.description,
      price: this.price,
      category: this.category,
      available: this.available,
      allergens: this.allergens,
      image: this.image,
      preparationTime: this.preparationTime,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class Order {
  constructor(data = {}) {
    this.id = data.id || null;
    this.tenantId = data.tenantId || null;
    this.callId = data.callId || null;
    this.customerName = data.customerName || '';
    this.customerPhone = data.customerPhone || '';
    this.type = data.type || 'takeaway'; // takeaway, delivery, dine-in
    this.status = data.status || 'pending'; // pending, confirmed, preparing, ready, completed, cancelled
    this.items = (data.items || []).map(item => new OrderItem(item));
    this.notes = data.notes || '';
    this.scheduledTime = data.scheduledTime || null;
    this.subtotal = data.subtotal || 0;
    this.tax = data.tax || 0;
    this.total = data.total || 0;
    this.refunds = data.refunds || 0;
    this.paymentMethod = data.paymentMethod || 'cash';
    this.deliveryAddress = data.deliveryAddress || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  calculateTotals() {
    this.subtotal = this.items.reduce((sum, item) => sum + item.getTotal(), 0);
    this.tax = this.subtotal * 0.1; // 10% tax
    this.total = this.subtotal + this.tax;
    return {
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
      net: this.total - this.refunds,
    };
  }

  getStatusColor() {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#10B981',
      preparing: '#3B82F6',
      ready: '#8B5CF6',
      completed: '#6B7280',
      cancelled: '#EF4444',
    };
    return colors[this.status] || '#6B7280';
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      callId: this.callId,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      type: this.type,
      status: this.status,
      items: this.items.map(item => item.toJSON()),
      notes: this.notes,
      scheduledTime: this.scheduledTime,
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
      refunds: this.refunds,
      paymentMethod: this.paymentMethod,
      deliveryAddress: this.deliveryAddress,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class OrderItem {
  constructor(data = {}) {
    this.menuItemId = data.menuItemId || null;
    this.name = data.name || '';
    this.price = data.price || 0;
    this.quantity = data.quantity || 1;
    this.notes = data.notes || '';
    this.modifications = data.modifications || [];
  }

  getTotal() {
    return this.price * this.quantity;
  }

  toJSON() {
    return {
      menuItemId: this.menuItemId,
      name: this.name,
      price: this.price,
      quantity: this.quantity,
      notes: this.notes,
      modifications: this.modifications,
    };
  }
}

export class Transcript {
  constructor(data = {}) {
    this.id = data.id || null;
    this.tenantId = data.tenantId || null;
    this.callId = data.callId || null;
    this.customerPhone = data.customerPhone || '';
    this.duration = data.duration || 0;
    this.messages = (data.messages || []).map(msg => new TranscriptMessage(msg));
    this.intent = data.intent || 'unknown';
    this.confidence = data.confidence || 0;
    this.outcome = data.outcome || 'completed';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      callId: this.callId,
      customerPhone: this.customerPhone,
      duration: this.duration,
      messages: this.messages.map(msg => msg.toJSON()),
      intent: this.intent,
      confidence: this.confidence,
      outcome: this.outcome,
      createdAt: this.createdAt,
    };
  }
}

export class TranscriptMessage {
  constructor(data = {}) {
    this.type = data.type || 'customer'; // customer, ai
    this.text = data.text || '';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.confidence = data.confidence || 1.0;
  }

  toJSON() {
    return {
      type: this.type,
      text: this.text,
      timestamp: this.timestamp,
      confidence: this.confidence,
    };
  }
}

export class BusinessProfile {
  constructor(data = {}) {
    this.id = data.id || null;
    this.tenantId = data.tenantId || null;
    
    // Basic Information
    this.name = data.name || '';
    this.description = data.description || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.website = data.website || '';
    this.address = data.address || '';
    this.timezone = data.timezone || 'Europe/Dublin';
    this.industry = data.industry || 'Restaurant';
    this.languages = data.languages || ['English'];
    
    // Additional Details
    this.establishedYear = data.establishedYear || '';
    this.ownerManager = data.ownerManager || '';
    this.capacity = data.capacity || '';
    this.parkingAvailable = data.parkingAvailable || false;
    this.wheelchairAccessible = data.wheelchairAccessible || false;
    this.wifiAvailable = data.wifiAvailable || false;
    this.outdoorSeating = data.outdoorSeating || false;
    
    // Social Media
    this.socialMedia = data.socialMedia || {
      facebook: '',
      instagram: '',
      twitter: '',
    };
    
    // Cuisine & Specialties
    this.cuisineType = data.cuisineType || [];
    this.specialties = data.specialties || [];
    this.dietaryOptions = data.dietaryOptions || [];
    
    // Price Range
    this.priceRange = data.priceRange || '€€';
    this.averageMealPrice = data.averageMealPrice || '';
    
    // Awards & Certifications
    this.awards = data.awards || [];
    this.certifications = data.certifications || [];
    
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      description: this.description,
      phone: this.phone,
      email: this.email,
      website: this.website,
      address: this.address,
      timezone: this.timezone,
      industry: this.industry,
      languages: this.languages,
      establishedYear: this.establishedYear,
      ownerManager: this.ownerManager,
      capacity: this.capacity,
      parkingAvailable: this.parkingAvailable,
      wheelchairAccessible: this.wheelchairAccessible,
      wifiAvailable: this.wifiAvailable,
      outdoorSeating: this.outdoorSeating,
      socialMedia: this.socialMedia,
      cuisineType: this.cuisineType,
      specialties: this.specialties,
      dietaryOptions: this.dietaryOptions,
      priceRange: this.priceRange,
      averageMealPrice: this.averageMealPrice,
      awards: this.awards,
      certifications: this.certifications,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class BusinessHours {
  constructor(data = {}) {
    this.id = data.id || null;
    this.tenantId = data.tenantId || null;
    this.monday = data.monday || { isOpen: true, open: '09:00', close: '21:00' };
    this.tuesday = data.tuesday || { isOpen: true, open: '09:00', close: '21:00' };
    this.wednesday = data.wednesday || { isOpen: true, open: '09:00', close: '21:00' };
    this.thursday = data.thursday || { isOpen: true, open: '09:00', close: '21:00' };
    this.friday = data.friday || { isOpen: true, open: '09:00', close: '22:00' };
    this.saturday = data.saturday || { isOpen: true, open: '10:00', close: '22:00' };
    this.sunday = data.sunday || { isOpen: true, open: '10:00', close: '21:00' };
    this.specialHours = data.specialHours || []; // For holidays or special events
    this.timezone = data.timezone || 'Europe/Dublin';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  getDayHours(day) {
    return this[day.toLowerCase()] || { isOpen: false, open: '', close: '' };
  }

  isOpenOnDay(day) {
    const dayHours = this.getDayHours(day);
    return dayHours.isOpen;
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      monday: this.monday,
      tuesday: this.tuesday,
      wednesday: this.wednesday,
      thursday: this.thursday,
      friday: this.friday,
      saturday: this.saturday,
      sunday: this.sunday,
      specialHours: this.specialHours,
      timezone: this.timezone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class BusinessCapabilities {
  constructor(data = {}) {
    this.id = data.id || null;
    this.tenantId = data.tenantId || null;
    
    // Services
    this.services = data.services || {
      dineIn: true,
      takeout: true,
      delivery: false,
      catering: false,
      privateEvents: false,
      groupBookings: true,
    };
    
    // Service Details
    this.deliveryServices = data.deliveryServices || [];
    this.paymentMethods = data.paymentMethods || ['Cash', 'Card'];
    this.reservationSystem = data.reservationSystem || '';
    this.maxGroupSize = data.maxGroupSize || '';
    this.privateRoomCapacity = data.privateRoomCapacity || '';
    this.cateringMinOrder = data.cateringMinOrder || '';
    this.deliveryRadius = data.deliveryRadius || '';
    this.deliveryMinOrder = data.deliveryMinOrder || '';
    this.deliveryFee = data.deliveryFee || '';
    
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  hasService(serviceName) {
    return this.services[serviceName] || false;
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      services: this.services,
      deliveryServices: this.deliveryServices,
      paymentMethods: this.paymentMethods,
      reservationSystem: this.reservationSystem,
      maxGroupSize: this.maxGroupSize,
      privateRoomCapacity: this.privateRoomCapacity,
      cateringMinOrder: this.cateringMinOrder,
      deliveryRadius: this.deliveryRadius,
      deliveryMinOrder: this.deliveryMinOrder,
      deliveryFee: this.deliveryFee,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class BusinessPolicies {
  constructor(data = {}) {
    this.id = data.id || null;
    this.tenantId = data.tenantId || null;
    this.reservationPolicy = data.reservationPolicy || '';
    this.cancellationPolicy = data.cancellationPolicy || '';
    this.noShowPolicy = data.noShowPolicy || '';
    this.groupBookingPolicy = data.groupBookingPolicy || '';
    this.childrenPolicy = data.childrenPolicy || '';
    this.petPolicy = data.petPolicy || '';
    this.dressCode = data.dressCode || '';
    this.smokingPolicy = data.smokingPolicy || '';
    this.ageRestriction = data.ageRestriction || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      reservationPolicy: this.reservationPolicy,
      cancellationPolicy: this.cancellationPolicy,
      noShowPolicy: this.noShowPolicy,
      groupBookingPolicy: this.groupBookingPolicy,
      childrenPolicy: this.childrenPolicy,
      petPolicy: this.petPolicy,
      dressCode: this.dressCode,
      smokingPolicy: this.smokingPolicy,
      ageRestriction: this.ageRestriction,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class BusinessFAQ {
  constructor(data = {}) {
    this.id = data.id || null;
    this.tenantId = data.tenantId || null;
    this.question = data.question || '';
    this.answer = data.answer || '';
    this.category = data.category || 'general';
    this.order = data.order || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      question: this.question,
      answer: this.answer,
      category: this.category,
      order: this.order,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class SpecialOffer {
  constructor(data = {}) {
    this.id = data.id || null;
    this.tenantId = data.tenantId || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.validFrom = data.validFrom || new Date().toISOString().split('T')[0];
    this.validUntil = data.validUntil || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.category = data.category || 'promotion';
    this.discountType = data.discountType || 'percentage'; // percentage, fixed, BOGO
    this.discountValue = data.discountValue || 0;
    this.conditions = data.conditions || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  isCurrentlyValid() {
    const now = new Date();
    const validFrom = new Date(this.validFrom);
    const validUntil = this.validUntil ? new Date(this.validUntil) : null;
    
    return this.isActive && 
           now >= validFrom && 
           (!validUntil || now <= validUntil);
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      title: this.title,
      description: this.description,
      validFrom: this.validFrom,
      validUntil: this.validUntil,
      isActive: this.isActive,
      category: this.category,
      discountType: this.discountType,
      discountValue: this.discountValue,
      conditions: this.conditions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
