import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import ApiService from '../services/ApiService';

const BusinessProfileScreen = () => {
  const { tenant, updateTenant } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    // Basic Info
    name: 'The Gourmet Kitchen',
    description: 'Fine dining restaurant specializing in modern Irish cuisine with locally sourced ingredients.',
    phone: '+353 1 234 5678',
    email: 'info@gourmetkitchen.ie',
    website: 'www.gourmetkitchen.ie',
    address: '123 Main Street, Dublin, D01 F2G3',
    timezone: 'Europe/Dublin',
    industry: 'Restaurant',
    languages: ['English', 'Irish'],
    
    // Additional Details
    establishedYear: '2018',
    ownerManager: 'Chef Michael O\'Brien',
    capacity: '80',
    parkingAvailable: true,
    wheelchairAccessible: true,
    wifiAvailable: true,
    outdoorSeating: true,
    
    // Social Media
    socialMedia: {
      facebook: '@gourmetkitchen',
      instagram: '@gourmetkitchen_dublin',
      twitter: '@gourmetkitchen',
    },
    
    // Cuisine & Specialties
    cuisineType: ['Irish', 'European', 'Modern'],
    specialties: ['Seafood', 'Locally Sourced Ingredients', 'Seasonal Menu', 'Wine Pairing'],
    dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'],
    
    // Price Range
    priceRange: '€€€',
    averageMealPrice: '45-65',
    
    // Awards & Certifications
    awards: ['Michelin Recommended 2023', 'Best Irish Restaurant 2022', 'Sustainable Restaurant Award'],
    certifications: ['Food Safety Certified', 'Organic Certified', 'Sustainable Dining'],
  });

  const [businessHours, setBusinessHours] = useState({
    monday: { isOpen: true, open: '17:00', close: '22:00' },
    tuesday: { isOpen: true, open: '17:00', close: '22:00' },
    wednesday: { isOpen: true, open: '17:00', close: '22:00' },
    thursday: { isOpen: true, open: '17:00', close: '22:00' },
    friday: { isOpen: true, open: '17:00', close: '23:00' },
    saturday: { isOpen: true, open: '12:00', close: '23:00' },
    sunday: { isOpen: true, open: '12:00', close: '21:00' },
  });

  const [capabilities, setCapabilities] = useState({
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
  });

  const [policies, setPolicies] = useState({
    reservationPolicy: 'Reservations recommended, walk-ins welcome based on availability',
    cancellationPolicy: '24 hours notice required for cancellations',
    noShowPolicy: 'Tables held for 15 minutes past reservation time',
    groupBookingPolicy: 'Groups of 8+ require deposit and set menu',
    childrenPolicy: 'Children welcome, high chairs available',
    petPolicy: 'Well-behaved dogs welcome in outdoor seating area',
    dressCode: 'Smart casual',
    smokingPolicy: 'Non-smoking establishment, designated outdoor area available',
    ageRestriction: 'No age restrictions during day, 18+ after 9pm on weekends',
  });

  const [faqs, setFaqs] = useState([
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
  ]);

  const [specialOffers, setSpecialOffers] = useState([
    {
      id: '1',
      title: 'Early Bird Special',
      description: '20% off main courses for bookings before 6:30pm, Monday-Thursday',
      validUntil: '2024-12-31',
    },
    {
      id: '2',
      title: 'Wine Wednesday',
      description: '50% off selected bottles of wine every Wednesday',
      validUntil: 'Ongoing',
    },
  ]);



  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'business' },
    { id: 'hours', label: 'Hours', icon: 'time' },
    { id: 'capabilities', label: 'Services', icon: 'options' },
    { id: 'policies', label: 'Policies', icon: 'document-text' },
    { id: 'faqs', label: 'FAQs', icon: 'help-circle' },
    { id: 'offers', label: 'Offers', icon: 'pricetag' },
  ];

  const timezoneOptions = ['Europe/Dublin', 'Europe/London', 'Europe/Paris', 'America/New_York'];
  const industryOptions = ['Restaurant', 'Cafe', 'Fast Food', 'Bakery', 'Bar', 'Hotel', 'Retail', 'Service'];
  const languageOptions = ['English', 'Irish', 'French', 'Spanish', 'German', 'Italian'];
  const priceRangeOptions = ['€', '€€', '€€€', '€€€€'];

  const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);
  const [industryModalVisible, setIndustryModalVisible] = useState(false);
  const [priceRangeModalVisible, setPriceRangeModalVisible] = useState(false);

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateHours = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const updateCapabilities = (field, value) => {
    setCapabilities(prev => ({ ...prev, [field]: value }));
  };

  const updateServiceCapability = (service, value) => {
    setCapabilities(prev => ({
      ...prev,
      services: { ...prev.services, [service]: value }
    }));
  };

  const updatePolicy = (field, value) => {
    setPolicies(prev => ({ ...prev, [field]: value }));
  };

  const addFAQ = () => {
    const newFAQ = {
      id: Date.now().toString(),
      question: '',
      answer: '',
    };
    setFaqs(prev => [...prev, newFAQ]);
  };

  const updateFAQ = (id, field, value) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ));
  };

  const deleteFAQ = (id) => {
    Alert.alert(
      'Delete FAQ',
      'Are you sure you want to delete this FAQ?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setFaqs(prev => prev.filter(faq => faq.id !== id));
        }}
      ]
    );
  };

  const addSpecialOffer = () => {
    const newOffer = {
      id: Date.now().toString(),
      title: '',
      description: '',
      validUntil: '',
    };
    setSpecialOffers(prev => [...prev, newOffer]);
  };

  const updateSpecialOffer = (id, field, value) => {
    setSpecialOffers(prev => prev.map(offer => 
      offer.id === id ? { ...offer, [field]: value } : offer
    ));
  };

  const deleteSpecialOffer = (id) => {
    Alert.alert(
      'Delete Offer',
      'Are you sure you want to delete this special offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setSpecialOffers(prev => prev.filter(offer => offer.id !== id));
        }}
      ]
    );
  };

  const renderDropdownModal = (visible, setVisible, options, currentValue, field, title) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select {title}</Text>
            <TouchableOpacity 
              onPress={() => setVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  currentValue === option && styles.selectedOption
                ]}
                onPress={() => {
                  updateProfile(field, option);
                  setVisible(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  currentValue === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
                {currentValue === option && (
                  <Ionicons name="checkmark" size={20} color="#4F83FF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderProfileTab = () => (
    <>
      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Business Name</Text>
          <TextInput
            style={styles.textInput}
            value={profile.name}
            onChangeText={(text) => updateProfile('name', text)}
            placeholder="Enter business name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={profile.description}
            onChangeText={(text) => updateProfile('description', text)}
            placeholder="Describe your business, cuisine, atmosphere..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={profile.phone}
            onChangeText={(text) => updateProfile('phone', text)}
            placeholder="+353 1 234 5678"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            value={profile.email}
            onChangeText={(text) => updateProfile('email', text)}
            placeholder="info@yourbusiness.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Website</Text>
          <TextInput
            style={styles.textInput}
            value={profile.website}
            onChangeText={(text) => updateProfile('website', text)}
            placeholder="www.yourbusiness.com"
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={profile.address}
            onChangeText={(text) => updateProfile('address', text)}
            placeholder="Full business address including postal code"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Industry</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setIndustryModalVisible(true)}
          >
            <Text style={styles.dropdownText}>{profile.industry}</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Timezone</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setTimezoneModalVisible(true)}
          >
            <Text style={styles.dropdownText}>{profile.timezone}</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Additional Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Established Year</Text>
          <TextInput
            style={styles.textInput}
            value={profile.establishedYear}
            onChangeText={(text) => updateProfile('establishedYear', text)}
            placeholder="2020"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Owner/Manager</Text>
          <TextInput
            style={styles.textInput}
            value={profile.ownerManager}
            onChangeText={(text) => updateProfile('ownerManager', text)}
            placeholder="Owner or manager name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Seating Capacity</Text>
          <TextInput
            style={styles.textInput}
            value={profile.capacity}
            onChangeText={(text) => updateProfile('capacity', text)}
            placeholder="80"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price Range</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setPriceRangeModalVisible(true)}
          >
            <Text style={styles.dropdownText}>{profile.priceRange}</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Average Meal Price (€)</Text>
          <TextInput
            style={styles.textInput}
            value={profile.averageMealPrice}
            onChangeText={(text) => updateProfile('averageMealPrice', text)}
            placeholder="25-35"
          />
        </View>

        {/* Amenities Switches */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Parking Available</Text>
          <Switch
            value={profile.parkingAvailable}
            onValueChange={(value) => updateProfile('parkingAvailable', value)}
            trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Wheelchair Accessible</Text>
          <Switch
            value={profile.wheelchairAccessible}
            onValueChange={(value) => updateProfile('wheelchairAccessible', value)}
            trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>WiFi Available</Text>
          <Switch
            value={profile.wifiAvailable}
            onValueChange={(value) => updateProfile('wifiAvailable', value)}
            trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Outdoor Seating</Text>
          <Switch
            value={profile.outdoorSeating}
            onValueChange={(value) => updateProfile('outdoorSeating', value)}
            trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
          />
        </View>
      </View>

      {/* Cuisine & Specialties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuisine & Specialties</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cuisine Types</Text>
          <TextInput
            style={styles.textInput}
            value={profile.cuisineType.join(', ')}
            onChangeText={(text) => updateProfile('cuisineType', text.split(', ').filter(t => t.trim()))}
            placeholder="Irish, European, Modern (comma separated)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Specialties</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={profile.specialties.join(', ')}
            onChangeText={(text) => updateProfile('specialties', text.split(', ').filter(t => t.trim()))}
            placeholder="Seafood, Wine Pairing, Seasonal Menu (comma separated)"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Dietary Options</Text>
          <TextInput
            style={styles.textInput}
            value={profile.dietaryOptions.join(', ')}
            onChangeText={(text) => updateProfile('dietaryOptions', text.split(', ').filter(t => t.trim()))}
            placeholder="Vegetarian, Vegan, Gluten-Free (comma separated)"
          />
        </View>
      </View>

      {/* Awards & Social Media */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Awards & Recognition</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Awards & Accolades</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={profile.awards.join(', ')}
            onChangeText={(text) => updateProfile('awards', text.split(', ').filter(t => t.trim()))}
            placeholder="Michelin Recommended, Best Restaurant Award (comma separated)"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Certifications</Text>
          <TextInput
            style={styles.textInput}
            value={profile.certifications.join(', ')}
            onChangeText={(text) => updateProfile('certifications', text.split(', ').filter(t => t.trim()))}
            placeholder="Food Safety, Organic Certified (comma separated)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Facebook Handle</Text>
          <TextInput
            style={styles.textInput}
            value={profile.socialMedia.facebook}
            onChangeText={(text) => updateProfile('socialMedia', { ...profile.socialMedia, facebook: text })}
            placeholder="@yourbusiness"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Instagram Handle</Text>
          <TextInput
            style={styles.textInput}
            value={profile.socialMedia.instagram}
            onChangeText={(text) => updateProfile('socialMedia', { ...profile.socialMedia, instagram: text })}
            placeholder="@yourbusiness"
          />
        </View>
      </View>
    </>
  );

  const renderHoursTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Business Hours</Text>
      <Text style={styles.sectionSubtitle}>Set your operating hours for each day of the week</Text>
      
      {Object.entries(businessHours).map(([day, hours]) => (
        <View key={day} style={styles.dayRow}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
            <Switch
              value={hours.isOpen}
              onValueChange={(value) => updateHours(day, 'isOpen', value)}
              trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
            />
          </View>
          
          {hours.isOpen && (
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Open</Text>
                <TextInput
                  style={styles.timeField}
                  value={hours.open}
                  onChangeText={(text) => updateHours(day, 'open', text)}
                  placeholder="09:00"
                />
              </View>
              <Text style={styles.timeSeparator}>-</Text>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Close</Text>
                <TextInput
                  style={styles.timeField}
                  value={hours.close}
                  onChangeText={(text) => updateHours(day, 'close', text)}
                  placeholder="21:00"
                />
              </View>
            </View>
          )}
          
          {!hours.isOpen && (
            <View style={styles.closedRow}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderServicesTab = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services Offered</Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Dine In</Text>
          <Switch
            value={capabilities.services.dineIn}
            onValueChange={(value) => updateServiceCapability('dineIn', value)}
            trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Takeout</Text>
          <Switch
            value={capabilities.services.takeout}
            onValueChange={(value) => updateServiceCapability('takeout', value)}
            trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Delivery</Text>
          <Switch
            value={capabilities.services.delivery}
            onValueChange={(value) => updateServiceCapability('delivery', value)}
            trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Catering</Text>
          <Switch
            value={capabilities.services.catering}
            onValueChange={(value) => updateServiceCapability('catering', value)}
            trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Private Events</Text>
          <Switch
            value={capabilities.services.privateEvents}
            onValueChange={(value) => updateServiceCapability('privateEvents', value)}
            trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Group Bookings</Text>
          <Switch
            value={capabilities.services.groupBookings}
            onValueChange={(value) => updateServiceCapability('groupBookings', value)}
            trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Delivery Services</Text>
          <TextInput
            style={styles.textInput}
            value={capabilities.deliveryServices.join(', ')}
            onChangeText={(text) => updateCapabilities('deliveryServices', text.split(', ').filter(t => t.trim()))}
            placeholder="Deliveroo, Just Eat, Uber Eats"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Payment Methods</Text>
          <TextInput
            style={styles.textInput}
            value={capabilities.paymentMethods.join(', ')}
            onChangeText={(text) => updateCapabilities('paymentMethods', text.split(', ').filter(t => t.trim()))}
            placeholder="Cash, Card, Apple Pay, Google Pay"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reservation System</Text>
          <TextInput
            style={styles.textInput}
            value={capabilities.reservationSystem}
            onChangeText={(text) => updateCapabilities('reservationSystem', text)}
            placeholder="OpenTable, Resy, Phone"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Max Group Size</Text>
          <TextInput
            style={styles.textInput}
            value={capabilities.maxGroupSize}
            onChangeText={(text) => updateCapabilities('maxGroupSize', text)}
            placeholder="20"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Private Room Capacity</Text>
          <TextInput
            style={styles.textInput}
            value={capabilities.privateRoomCapacity}
            onChangeText={(text) => updateCapabilities('privateRoomCapacity', text)}
            placeholder="25"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Delivery Radius (km)</Text>
          <TextInput
            style={styles.textInput}
            value={capabilities.deliveryRadius}
            onChangeText={(text) => updateCapabilities('deliveryRadius', text)}
            placeholder="10km"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Delivery Minimum Order (€)</Text>
          <TextInput
            style={styles.textInput}
            value={capabilities.deliveryMinOrder}
            onChangeText={(text) => updateCapabilities('deliveryMinOrder', text)}
            placeholder="25"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Delivery Fee (€)</Text>
          <TextInput
            style={styles.textInput}
            value={capabilities.deliveryFee}
            onChangeText={(text) => updateCapabilities('deliveryFee', text)}
            placeholder="3.50"
            keyboardType="numeric"
          />
        </View>
      </View>
    </>
  );

  const renderPoliciesTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Business Policies</Text>
      <Text style={styles.sectionSubtitle}>These policies help the AI assistant answer customer questions accurately</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Reservation Policy</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={policies.reservationPolicy}
          onChangeText={(text) => updatePolicy('reservationPolicy', text)}
          placeholder="How do you handle reservations?"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Cancellation Policy</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={policies.cancellationPolicy}
          onChangeText={(text) => updatePolicy('cancellationPolicy', text)}
          placeholder="What's your cancellation policy?"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>No-Show Policy</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={policies.noShowPolicy}
          onChangeText={(text) => updatePolicy('noShowPolicy', text)}
          placeholder="How do you handle no-shows?"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Group Booking Policy</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={policies.groupBookingPolicy}
          onChangeText={(text) => updatePolicy('groupBookingPolicy', text)}
          placeholder="Special requirements for large groups?"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Children Policy</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={policies.childrenPolicy}
          onChangeText={(text) => updatePolicy('childrenPolicy', text)}
          placeholder="Are children welcome? Any restrictions?"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pet Policy</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={policies.petPolicy}
          onChangeText={(text) => updatePolicy('petPolicy', text)}
          placeholder="Are pets allowed? Any restrictions?"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Dress Code</Text>
        <TextInput
          style={styles.textInput}
          value={policies.dressCode}
          onChangeText={(text) => updatePolicy('dressCode', text)}
          placeholder="Smart casual, formal, etc."
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Smoking Policy</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={policies.smokingPolicy}
          onChangeText={(text) => updatePolicy('smokingPolicy', text)}
          placeholder="Smoking allowed? Designated areas?"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Age Restrictions</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={policies.ageRestriction}
          onChangeText={(text) => updatePolicy('ageRestriction', text)}
          placeholder="Any age restrictions or time-based policies?"
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  const renderFAQsTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <TouchableOpacity style={styles.addButton} onPress={addFAQ}>
          <Ionicons name="add" size={20} color="#4F83FF" />
          <Text style={styles.addButtonText}>Add FAQ</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSubtitle}>Common questions customers ask about your business</Text>
      
      {faqs.map((faq) => (
        <View key={faq.id} style={styles.faqItem}>
          <View style={styles.faqHeader}>
            <Text style={styles.faqNumber}>FAQ {faqs.indexOf(faq) + 1}</Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteFAQ(faq.id)}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Question</Text>
            <TextInput
              style={styles.textInput}
              value={faq.question}
              onChangeText={(text) => updateFAQ(faq.id, 'question', text)}
              placeholder="What do customers often ask?"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Answer</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={faq.answer}
              onChangeText={(text) => updateFAQ(faq.id, 'answer', text)}
              placeholder="Provide a helpful, detailed answer"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderOffersTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Special Offers & Promotions</Text>
        <TouchableOpacity style={styles.addButton} onPress={addSpecialOffer}>
          <Ionicons name="add" size={20} color="#4F83FF" />
          <Text style={styles.addButtonText}>Add Offer</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSubtitle}>Current promotions and special deals</Text>
      
      {specialOffers.map((offer) => (
        <View key={offer.id} style={styles.offerItem}>
          <View style={styles.offerHeader}>
            <Text style={styles.offerNumber}>Offer {specialOffers.indexOf(offer) + 1}</Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteSpecialOffer(offer.id)}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Offer Title</Text>
            <TextInput
              style={styles.textInput}
              value={offer.title}
              onChangeText={(text) => updateSpecialOffer(offer.id, 'title', text)}
              placeholder="Early Bird Special"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={offer.description}
              onChangeText={(text) => updateSpecialOffer(offer.id, 'description', text)}
              placeholder="Describe the offer, terms, and conditions"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Valid Until</Text>
            <TextInput
              style={styles.textInput}
              value={offer.validUntil}
              onChangeText={(text) => updateSpecialOffer(offer.id, 'validUntil', text)}
              placeholder="2024-12-31 or 'Ongoing'"
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderStaffTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Key Staff & Personnel</Text>
        <TouchableOpacity style={styles.addButton} onPress={addKeyStaff}>
          <Ionicons name="add" size={20} color="#4F83FF" />
          <Text style={styles.addButtonText}>Add Staff</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSubtitle}>Information about key team members for customer inquiries</Text>
      
      {additionalInfo.keyStaff.map((staff) => (
        <View key={staff.id} style={styles.faqItem}>
          <View style={styles.faqHeader}>
            <Text style={styles.faqNumber}>Staff Member {additionalInfo.keyStaff.indexOf(staff) + 1}</Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteKeyStaff(staff.id)}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={staff.name}
              onChangeText={(text) => updateKeyStaff(staff.id, 'name', text)}
              placeholder="Staff member name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Role/Position</Text>
            <TextInput
              style={styles.textInput}
              value={staff.role}
              onChangeText={(text) => updateKeyStaff(staff.id, 'role', text)}
              placeholder="Head Chef, Manager, etc."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio/Background</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={staff.bio}
              onChangeText={(text) => updateKeyStaff(staff.id, 'bio', text)}
              placeholder="Brief background and experience"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Specialization</Text>
            <TextInput
              style={styles.textInput}
              value={staff.specialization}
              onChangeText={(text) => updateKeyStaff(staff.id, 'specialization', text)}
              placeholder="Areas of expertise"
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderAccessibilityTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Accessibility Features</Text>
      <Text style={styles.sectionSubtitle}>Help customers understand what accessibility features you offer</Text>
      
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Wheelchair Access</Text>
        <Switch
          value={additionalInfo.accessibility.wheelchairAccess}
          onValueChange={(value) => updateAdditionalInfo('accessibility', 'wheelchairAccess', value)}
          trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Accessible Restrooms</Text>
        <Switch
          value={additionalInfo.accessibility.accessibleRestrooms}
          onValueChange={(value) => updateAdditionalInfo('accessibility', 'accessibleRestrooms', value)}
          trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Braille Menus</Text>
        <Switch
          value={additionalInfo.accessibility.braileMenus}
          onValueChange={(value) => updateAdditionalInfo('accessibility', 'braileMenus', value)}
          trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Hearing Loop System</Text>
        <Switch
          value={additionalInfo.accessibility.hearingLoop}
          onValueChange={(value) => updateAdditionalInfo('accessibility', 'hearingLoop', value)}
          trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Service Animals Welcome</Text>
        <Switch
          value={additionalInfo.accessibility.serviceAnimals}
          onValueChange={(value) => updateAdditionalInfo('accessibility', 'serviceAnimals', value)}
          trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Accessible Parking</Text>
        <Switch
          value={additionalInfo.accessibility.accessibleParking}
          onValueChange={(value) => updateAdditionalInfo('accessibility', 'accessibleParking', value)}
          trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
        />
      </View>
    </View>
  );

  const renderSustainabilityTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sustainability & Environmental Practices</Text>
      <Text style={styles.sectionSubtitle}>Share your green initiatives with environmentally conscious customers</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Local Sourcing Policy</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={additionalInfo.sustainability.localSourcing}
          onChangeText={(text) => updateAdditionalInfo('sustainability', 'localSourcing', text)}
          placeholder="Describe your local sourcing practices"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Waste Reduction Efforts</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={additionalInfo.sustainability.wasteReduction}
          onChangeText={(text) => updateAdditionalInfo('sustainability', 'wasteReduction', text)}
          placeholder="How do you minimize waste?"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Energy Efficiency</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={additionalInfo.sustainability.energyEfficiency}
          onChangeText={(text) => updateAdditionalInfo('sustainability', 'energyEfficiency', text)}
          placeholder="Energy-saving measures you've implemented"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Other Sustainable Practices</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={additionalInfo.sustainability.sustainablePractices.join(', ')}
          onChangeText={(text) => updateAdditionalInfo('sustainability', 'sustainablePractices', text.split(', ').filter(t => t.trim()))}
          placeholder="Recyclable packaging, water conservation (comma separated)"
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  const renderTechnologyTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Technology & Digital Services</Text>
      <Text style={styles.sectionSubtitle}>Information about your tech amenities and digital offerings</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>WiFi Information</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={additionalInfo.technology.wifiDetails}
          onChangeText={(text) => updateAdditionalInfo('technology', 'wifiDetails', text)}
          placeholder="Network name, password policy, etc."
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Charging Stations Available</Text>
        <Switch
          value={additionalInfo.technology.chargingStations}
          onValueChange={(value) => updateAdditionalInfo('technology', 'chargingStations', value)}
          trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Mobile Ordering</Text>
        <Switch
          value={additionalInfo.technology.mobileOrdering}
          onValueChange={(value) => updateAdditionalInfo('technology', 'mobileOrdering', value)}
          trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Loyalty Program</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={additionalInfo.technology.loyaltyProgram}
          onChangeText={(text) => updateAdditionalInfo('technology', 'loyaltyProgram', text)}
          placeholder="Description of loyalty program and how to join"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Digital Menu Information</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={additionalInfo.technology.digitalMenu}
          onChangeText={(text) => updateAdditionalInfo('technology', 'digitalMenu', text)}
          placeholder="QR codes, digital menu access, printed options"
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'hours':
        return renderHoursTab();
      case 'capabilities':
        return renderServicesTab();
      case 'policies':
        return renderPoliciesTab();
      case 'faqs':
        return renderFAQsTab();
      case 'offers':
        return renderOffersTab();
      default:
        return renderProfileTab();
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      // Load all business profile data
      const [profileRes, hoursRes, capabilitiesRes, policiesRes, faqsRes, offersRes] = await Promise.all([
        ApiService.getBusinessProfile(),
        ApiService.getBusinessHours(),
        ApiService.getBusinessCapabilities(),
        ApiService.getBusinessPolicies(),
        ApiService.getBusinessFAQs(),
        ApiService.getSpecialOffers(),
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(prev => ({ ...prev, ...profileRes.data }));
      }
      
      if (hoursRes.success && hoursRes.data) {
        setBusinessHours(hoursRes.data);
      }
      
      if (capabilitiesRes.success && capabilitiesRes.data) {
        setCapabilities(capabilitiesRes.data);
      }
      
      if (policiesRes.success && policiesRes.data) {
        setPolicies(policiesRes.data);
      }
      
      if (faqsRes.success && faqsRes.data) {
        setFaqs(faqsRes.data);
      }
      
      if (offersRes.success && offersRes.data) {
        setSpecialOffers(offersRes.data);
      }
      
    } catch (error) {
      console.error('Error loading business data:', error);
      Alert.alert('Error', 'Failed to load business information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      
      // Save all the different sections
      const savePromises = [];
      
      switch (activeTab) {
        case 'profile':
          savePromises.push(ApiService.updateBusinessProfile(profile));
          break;
        case 'hours':
          savePromises.push(ApiService.updateBusinessHours(businessHours));
          break;
        case 'capabilities':
          savePromises.push(ApiService.updateBusinessCapabilities(capabilities));
          break;
        case 'policies':
          savePromises.push(ApiService.updateBusinessPolicies(policies));
          break;
        case 'faqs':
          savePromises.push(ApiService.updateBusinessFAQs(faqs));
          break;
        case 'offers':
          savePromises.push(ApiService.updateSpecialOffers(specialOffers));
          break;

        default:
          // Save all if no specific tab
          savePromises.push(
            ApiService.updateBusinessProfile(profile),
            ApiService.updateBusinessHours(businessHours),
            ApiService.updateBusinessCapabilities(capabilities),
            ApiService.updateBusinessPolicies(policies),
            ApiService.updateBusinessFAQs(faqs),
            ApiService.updateSpecialOffers(specialOffers)
          );
      }
      
      const results = await Promise.all(savePromises);
      
      // Check if all saves were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        // Update the app context with the new tenant info
        if (activeTab === 'profile' || !activeTab) {
          updateTenant({
            ...tenant,
            name: profile.name,
            phone: profile.phone,
            address: profile.address,
            timezone: profile.timezone,
            industry: profile.industry,
          });
        }
        
        Alert.alert(
          'Success', 
          'Business profile has been updated successfully!',
          [{ text: 'OK', onPress: () => {} }]
        );
      } else {
        throw new Error('Some updates failed');
      }
      
    } catch (error) {
      console.error('Error saving business data:', error);
      Alert.alert(
        'Error', 
        'Failed to save some changes. Please check your connection and try again.',
        [{ text: 'OK', onPress: () => {} }]
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F83FF" />
          <Text style={styles.loadingText}>Loading business profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={16} 
              color={activeTab === tab.id ? '#4F83FF' : '#6B7280'} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabText, 
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.contentScroll}>
        {renderTabContent()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={saveChanges}
            disabled={saving}
          >
            {saving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      {renderDropdownModal(
        timezoneModalVisible,
        setTimezoneModalVisible,
        timezoneOptions,
        profile.timezone,
        'timezone',
        'Timezone'
      )}
      {renderDropdownModal(
        industryModalVisible,
        setIndustryModalVisible,
        industryOptions,
        profile.industry,
        'industry',
        'Industry'
      )}
      {renderDropdownModal(
        priceRangeModalVisible,
        setPriceRangeModalVisible,
        priceRangeOptions,
        profile.priceRange,
        'priceRange',
        'Price Range'
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabScrollView: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    minWidth: 80,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#EBF4FF',
    borderWidth: 1,
    borderColor: '#4F83FF',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4F83FF',
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  dayRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeField: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  closedRow: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  closedText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#4F83FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  faqItem: {
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  faqNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F83FF',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  offerItem: {
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  staffItem: {
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  saveButton: {
    backgroundColor: '#4F83FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4F83FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 320,
    maxHeight: '70%',
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  selectedOption: {
    backgroundColor: '#EBF4FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#4F83FF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
});

export default BusinessProfileScreen;
