import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import ApiService from '../services/ApiService';

const BusinessProfileScreen = () => {
  const { tenant, updateTenant } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [profile, setProfile] = useState({
    name: 'The Gourmet Kitchen',
    description: 'Fine dining restaurant specializing in modern Irish cuisine with locally sourced ingredients.',
    phone: '+353 1 234 5678',
    email: 'info@gourmetkitchen.ie',
    website: 'www.gourmetkitchen.ie',
    address: '123 Main Street, Dublin, D01 F2G3',
    timezone: 'Europe/Dublin',
    industry: 'Restaurant',
    establishedYear: '2018',
    ownerManager: 'Chef Michael O\'Brien',
    capacity: '80',
    priceRange: '€€€',
    cuisineType: ['Irish', 'European', 'Modern'],
    specialties: ['Seafood', 'Locally Sourced Ingredients', 'Seasonal Menu'],
    parkingAvailable: true,
    wheelchairAccessible: true,
    wifiAvailable: true,
    outdoorSeating: true,
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

  const [additionalInfo, setAdditionalInfo] = useState([
    {
      id: '1',
      title: 'WiFi Information',
      content: 'Free WiFi available - Network: GourmetGuest, Password available from staff'
    },
    {
      id: '2',
      title: 'Special Features',
      content: 'Live music on Friday nights, Private dining room available for events'
    }
  ]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'business', color: '#4F83FF' },
    { id: 'hours', label: 'Hours', icon: 'time', color: '#10B981' },
    { id: 'services', label: 'Services', icon: 'options', color: '#8B5CF6' },
    { id: 'faqs', label: 'FAQs', icon: 'help-circle', color: '#F59E0B' },
    { id: 'extra', label: 'Extra Info', icon: 'add-circle', color: '#EF4444' },
  ];

  const [services, setServices] = useState({
    dineIn: true,
    takeout: true,
    delivery: true,
    catering: false,
    privateEvents: true,
    reservations: true,
  });

  const [faqs, setFaqs] = useState([
    {
      id: '1',
      question: 'Do you take reservations?',
      answer: 'Yes, we recommend reservations especially for dinner service. You can book online or call us directly.'
    },
    {
      id: '2',
      question: 'What are your parking options?',
      answer: 'We have a small private car park behind the restaurant, and there\'s street parking available on Main Street.'
    },
    {
      id: '3',
      question: 'Do you cater for dietary restrictions?',
      answer: 'Absolutely! We have vegetarian, vegan, and gluten-free options. Please inform us of any allergies when booking.'
    }
  ]);

  // Load existing tenant data when component mounts
  useEffect(() => {
    if (tenant) {
      console.log('Loading tenant data:', tenant);
      setProfile(prev => ({
        ...prev,
        name: tenant.name || prev.name,
        phone: tenant.phone || prev.phone,
        address: tenant.address || prev.address,
      }));
      
      if (tenant.hours) {
        setBusinessHours(tenant.hours);
      }
    }
  }, [tenant]);

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateHours = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const addAdditionalInfo = () => {
    console.log('✅ BUTTON CLICKED - Adding new info item');
    
    const newItem = {
      id: String(Date.now()),
      title: '',
      content: ''
    };
    
    console.log('✅ New item created:', newItem);
    
    setAdditionalInfo(currentItems => {
      const newArray = [...currentItems, newItem];
      console.log('✅ Current items:', currentItems.length);
      console.log('✅ New array length:', newArray.length);
      return newArray;
    });
  };

  const updateAdditionalInfo = (id, field, value) => {
    setAdditionalInfo(prev => prev.map(info => 
      info.id === id ? { ...info, [field]: value } : info
    ));
  };

  const deleteAdditionalInfo = (id) => {
    Alert.alert(
      'Delete Information',
      'Are you sure you want to delete this information?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setAdditionalInfo(prev => prev.filter(info => info.id !== id));
        }}
      ]
    );
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      
      console.log('Saving business profile...', { profile, businessHours, additionalInfo });
      
      // Prepare restaurant data for backend
      const restaurantData = {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        hours: businessHours,
      };
      
      let savedRestaurant;
      
      // If tenant exists, update; otherwise, create new restaurant
      if (tenant && tenant.id) {
        console.log('Updating existing restaurant:', tenant.id);
        savedRestaurant = await ApiService.updateRestaurant(tenant.id, restaurantData);
      } else {
        console.log('Creating new restaurant');
        savedRestaurant = await ApiService.createRestaurant(restaurantData);
      }
      
      console.log('Restaurant saved:', savedRestaurant);
      
      // Update the app context with the new/updated restaurant
      await updateTenant(savedRestaurant);
      
      Alert.alert('Success', 'Business profile updated successfully!');
      
    } catch (error) {
      console.error('Error saving business data:', error);
      Alert.alert('Error', `Failed to save changes: ${error.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Basic Information Card */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.cardIcon}>
              <Ionicons name="business" size={20} color="#4F83FF" />
            </View>
            <Text style={styles.cardTitle}>Basic Information</Text>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Ionicons name="storefront" size={14} color="#6B7280" /> Business Name
          </Text>
          <TextInput
            style={styles.textInput}
            value={profile.name}
            onChangeText={(text) => updateProfile('name', text)}
            placeholder="Enter your business name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Ionicons name="document-text" size={14} color="#6B7280" /> Description
          </Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={profile.description}
            onChangeText={(text) => updateProfile('description', text)}
            placeholder="Describe your business, cuisine, atmosphere..."
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Contact Information Card */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.cardIcon}>
              <Ionicons name="call" size={20} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Contact Information</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Ionicons name="call" size={14} color="#6B7280" /> Phone Number
          </Text>
          <TextInput
            style={styles.textInput}
            value={profile.phone}
            onChangeText={(text) => updateProfile('phone', text)}
            placeholder="+353 1 234 5678"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Ionicons name="mail" size={14} color="#6B7280" /> Email Address
          </Text>
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
          <Text style={styles.inputLabel}>
            <Ionicons name="globe" size={14} color="#6B7280" /> Website
          </Text>
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
          <Text style={styles.inputLabel}>
            <Ionicons name="location" size={14} color="#6B7280" /> Address
          </Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={profile.address}
            onChangeText={(text) => updateProfile('address', text)}
            placeholder="Full business address with postcode"
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      {/* Amenities & Features Card */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.cardIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.cardTitle}>Amenities & Features</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>Let customers know what amenities you offer</Text>

        <View style={styles.amenitiesGrid}>
          <View style={styles.amenityItem}>
            <View style={styles.amenityIcon}>
              <Ionicons name="car" size={20} color="#F59E0B" />
            </View>
            <View style={styles.amenityContent}>
              <Text style={styles.amenityLabel}>Parking Available</Text>
              <Text style={styles.amenityDescription}>On-site parking for guests</Text>
            </View>
            <Switch
              value={profile.parkingAvailable}
              onValueChange={(value) => updateProfile('parkingAvailable', value)}
              trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
              thumbColor={profile.parkingAvailable ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.amenityItem}>
            <View style={styles.amenityIcon}>
              <Ionicons name="accessibility" size={20} color="#10B981" />
            </View>
            <View style={styles.amenityContent}>
              <Text style={styles.amenityLabel}>Wheelchair Accessible</Text>
              <Text style={styles.amenityDescription}>Full accessibility support</Text>
            </View>
            <Switch
              value={profile.wheelchairAccessible}
              onValueChange={(value) => updateProfile('wheelchairAccessible', value)}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor={profile.wheelchairAccessible ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.amenityItem}>
            <View style={styles.amenityIcon}>
              <Ionicons name="wifi" size={20} color="#4F83FF" />
            </View>
            <View style={styles.amenityContent}>
              <Text style={styles.amenityLabel}>WiFi Available</Text>
              <Text style={styles.amenityDescription}>Free internet for customers</Text>
            </View>
            <Switch
              value={profile.wifiAvailable}
              onValueChange={(value) => updateProfile('wifiAvailable', value)}
              trackColor={{ false: '#E5E7EB', true: '#4F83FF' }}
              thumbColor={profile.wifiAvailable ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderHoursTab = () => (
    <View style={styles.tabContent}>
      {/* Business Hours Card */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.cardIcon}>
              <Ionicons name="time" size={20} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Business Hours</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>Set your operating hours for each day of the week</Text>
        
        {Object.entries(businessHours).map(([day, hours]) => (
          <View key={day} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                {hours.isOpen && (
                  <Text style={styles.dayHours}>{hours.open} - {hours.close}</Text>
                )}
                {!hours.isOpen && (
                  <Text style={styles.dayClosedText}>Closed</Text>
                )}
              </View>
              <Switch
                value={hours.isOpen}
                onValueChange={(value) => updateHours(day, 'isOpen', value)}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={hours.isOpen ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            {hours.isOpen && (
              <View style={styles.timeRow}>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeLabel}>
                    <Ionicons name="play" size={12} color="#10B981" /> Opens
                  </Text>
                  <TextInput
                    style={styles.timeField}
                    value={hours.open}
                    onChangeText={(text) => updateHours(day, 'open', text)}
                    placeholder="09:00"
                  />
                </View>
                
                <View style={styles.timeSeparator}>
                  <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                </View>
                
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeLabel}>
                    <Ionicons name="stop" size={12} color="#EF4444" /> Closes
                  </Text>
                  <TextInput
                    style={styles.timeField}
                    value={hours.close}
                    onChangeText={(text) => updateHours(day, 'close', text)}
                    placeholder="22:00"
                  />
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Quick Hours Templates */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.cardIcon}>
              <Ionicons name="flash" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.cardTitle}>Quick Setup</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>Apply common hour patterns to all days</Text>
        
        <View style={styles.quickSetupGrid}>
          <TouchableOpacity 
            style={styles.quickSetupButton}
            onPress={() => {
              const newHours = {};
              Object.keys(businessHours).forEach(day => {
                newHours[day] = { isOpen: true, open: '09:00', close: '17:00' };
              });
              setBusinessHours(newHours);
            }}
          >
            <Text style={styles.quickSetupText}>9 AM - 5 PM</Text>
            <Text style={styles.quickSetupSubtext}>Standard hours</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickSetupButton}
            onPress={() => {
              const newHours = {};
              Object.keys(businessHours).forEach(day => {
                if (day === 'saturday' || day === 'sunday') {
                  newHours[day] = { isOpen: true, open: '10:00', close: '22:00' };
                } else {
                  newHours[day] = { isOpen: true, open: '17:00', close: '22:00' };
                }
              });
              setBusinessHours(newHours);
            }}
          >
            <Text style={styles.quickSetupText}>Restaurant</Text>
            <Text style={styles.quickSetupSubtext}>Dinner focused</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderServicesTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Services & Capabilities</Text>
      <Text style={styles.sectionSubtitle}>What services do you offer?</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Cuisine Type</Text>
        <TextInput
          style={styles.textInput}
          value={profile.cuisineType.join(', ')}
          onChangeText={(text) => updateProfile('cuisineType', text.split(', ').filter(t => t.trim()))}
          placeholder="Irish, European, Modern"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Specialties</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.specialties.join(', ')}
          onChangeText={(text) => updateProfile('specialties', text.split(', ').filter(t => t.trim()))}
          placeholder="Seafood, Wine Pairing, etc."
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Price Range</Text>
        <TextInput
          style={styles.textInput}
          value={profile.priceRange}
          onChangeText={(text) => updateProfile('priceRange', text)}
          placeholder="€, €€, €€€, or €€€€"
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
    </View>
  );

  const renderFAQsTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Common Questions</Text>
      <Text style={styles.sectionSubtitle}>Sample FAQs your AI agent can answer</Text>
      
      <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>Do you take reservations?</Text>
        <Text style={styles.faqAnswer}>Yes, we accept reservations by phone or online. Walk-ins are welcome based on availability.</Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>Do you have parking?</Text>
        <Text style={styles.faqAnswer}>{profile.parkingAvailable ? 'Yes, parking is available.' : 'Parking is limited, street parking available nearby.'}</Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>Are you wheelchair accessible?</Text>
        <Text style={styles.faqAnswer}>{profile.wheelchairAccessible ? 'Yes, we are fully wheelchair accessible.' : 'Please contact us about accessibility accommodations.'}</Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.faqQuestion}>What type of cuisine do you serve?</Text>
        <Text style={styles.faqAnswer}>We specialize in {profile.cuisineType.join(', ')} cuisine with specialties in {profile.specialties.join(', ')}.</Text>
      </View>

      {/* Dynamic FAQ based on additional info */}
      {additionalInfo.map((info) => (
        <View key={info.id} style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Tell me about {info.title.toLowerCase()}</Text>
          <Text style={styles.faqAnswer}>{info.content || 'Information not available yet - please add details in the Extra Info tab.'}</Text>
        </View>
      ))}
    </View>
  );

  const renderExtraInfoTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            console.log('🟢 Add Info TouchableOpacity onPress triggered!');
            console.log('🟢 Current additionalInfo length:', additionalInfo.length);
            
            // Direct state update for testing
            const newItem = {
              id: `new_${Date.now()}`,
              title: 'New Information',
              content: 'Please fill in the details...'
            };
            
            setAdditionalInfo(current => {
              console.log('� Adding to current array:', current);
              const updated = [...current, newItem];
              console.log('🟢 New array will be:', updated);
              return updated;
            });
          }}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          activeOpacity={0.6}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Info</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSubtitle}>Add any extra information customers might need to know about your business</Text>
      
      {/* BACKUP ADD BUTTON - GUARANTEED TO WORK */}
      <TouchableOpacity 
        style={{
          backgroundColor: '#00FF00',
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
          alignItems: 'center',
          borderWidth: 3,
          borderColor: '#000'
        }}
        onPress={() => {
          console.log('🎯 BACKUP BUTTON CLICKED!');
          const newInfo = {
            id: 'backup_' + Date.now(),
            title: 'New Info Item',
            content: 'Enter details here...'
          };
          setAdditionalInfo(prev => [...prev, newInfo]);
          console.log('🎯 Item added successfully!');
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>
          🟢 CLICK HERE TO ADD NEW INFO 🟢
        </Text>
      </TouchableOpacity>
      
      {/* Debug info */}
      <View style={{ backgroundColor: '#FFF3CD', padding: 10, marginBottom: 10, borderRadius: 5 }}>
        <Text style={{ fontSize: 12, color: '#856404' }}>
          Debug: Current additionalInfo count: {additionalInfo.length}
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#007AFF', padding: 8, borderRadius: 4, marginTop: 5 }}
          onPress={() => {
            console.log('🟡 Debug button clicked!');
            const testInfo = { id: 'test_' + Date.now(), title: 'Test', content: 'Test content' };
            setAdditionalInfo(prev => [...prev, testInfo]);
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>Test Add (Debug)</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.exampleInfo}>
        <Text style={styles.exampleTitle}>💡 Examples of useful information to add:</Text>
        <Text style={styles.exampleText}>• Parking instructions and availability</Text>
        <Text style={styles.exampleText}>• Special events (live music, trivia nights)</Text>
        <Text style={styles.exampleText}>• Accessibility features</Text>
        <Text style={styles.exampleText}>• Seasonal menu changes</Text>
        <Text style={styles.exampleText}>• Private dining options</Text>
        <Text style={styles.exampleText}>• Group booking policies</Text>
        <Text style={styles.exampleText}>• Loyalty programs</Text>
        <Text style={styles.exampleText}>• COVID safety measures</Text>
      </View>
      
      {additionalInfo.map((info, index) => (
        <View key={info.id} style={styles.extraInfoItem}>
          <View style={styles.extraInfoHeader}>
            <Text style={styles.extraInfoNumber}>Info #{index + 1}</Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteAdditionalInfo(info.id)}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title/Category</Text>
            <TextInput
              style={styles.textInput}
              value={info.title}
              onChangeText={(text) => updateAdditionalInfo(info.id, 'title', text)}
              placeholder="e.g., Parking, Special Events, Accessibility, etc."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Details</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={info.content}
              onChangeText={(text) => updateAdditionalInfo(info.id, 'content', text)}
              placeholder="Provide detailed information that would be helpful for customers..."
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      ))}

      {additionalInfo.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="information-circle-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No Additional Information</Text>
          <Text style={styles.emptyStateText}>
            Add custom information that's unique to your business. This could include parking details, 
            special events, accessibility features, or anything else customers should know.
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton} 
            onPress={() => {
              console.log('Empty state Add First Entry button pressed!');
              addAdditionalInfo();
            }}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.6}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.emptyStateButtonText}>Add First Entry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'hours':
        return renderHoursTab();
      case 'services':
        return renderServicesTab();
      case 'faqs':
        return renderFAQsTab();
      case 'extra':
        return renderExtraInfoTab();
      default:
        return renderProfileTab();
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
      {/* Compact Responsive Header */}
      <LinearGradient
        colors={['#4F83FF', '#667EEA', '#764BA2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Business Profile</Text>
              <View style={styles.quickStats}>
                <Text style={styles.quickStatsText}>{profile.name} • {profile.phone}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="business" size={24} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Responsive Tab Navigation */}
      <View style={styles.tabNavigationContainer}>
        {isMobile ? (
          /* Mobile Dropdown Navigation */
          <View style={styles.mobileNavContainer}>
            <TouchableOpacity
              style={styles.mobileNavButton}
              onPress={() => setShowMobileMenu(!showMobileMenu)}
            >
              <View style={styles.mobileNavLeft}>
                <View style={[styles.tabIconContainer, { backgroundColor: tabs.find(t => t.id === activeTab)?.color }]}>
                  <Ionicons 
                    name={tabs.find(t => t.id === activeTab)?.icon} 
                    size={16} 
                    color="#fff"
                  />
                </View>
                <Text style={styles.mobileNavText}>
                  {tabs.find(t => t.id === activeTab)?.label}
                </Text>
              </View>
              <Ionicons 
                name={showMobileMenu ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
            
            {showMobileMenu && (
              <View style={styles.mobileDropdown}>
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.mobileDropdownItem,
                      activeTab === tab.id && styles.mobileDropdownItemActive
                    ]}
                    onPress={() => {
                      setActiveTab(tab.id);
                      setShowMobileMenu(false);
                    }}
                  >
                    <View style={[
                      styles.tabIconContainer,
                      { backgroundColor: activeTab === tab.id ? tab.color : '#F1F5F9' }
                    ]}>
                      <Ionicons 
                        name={tab.icon} 
                        size={16} 
                        color={activeTab === tab.id ? '#fff' : tab.color}
                      />
                    </View>
                    <Text style={[
                      styles.mobileDropdownText,
                      activeTab === tab.id && { color: tab.color, fontWeight: '600' }
                    ]}>
                      {tab.label}
                    </Text>
                    {activeTab === tab.id && (
                      <Ionicons name="checkmark" size={16} color={tab.color} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* Desktop Horizontal Tabs */
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={styles.tabContainer}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && [styles.activeTab, { borderColor: tab.color }]
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <View style={[
                  styles.tabIconContainer,
                  activeTab === tab.id && { backgroundColor: tab.color }
                ]}>
                  <Ionicons 
                    name={tab.icon} 
                    size={16} 
                    color={activeTab === tab.id ? '#fff' : tab.color}
                  />
                </View>
                <Text style={[
                  styles.tabText, 
                  activeTab === tab.id && { color: tab.color }
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
      >
        {renderTabContent()}
        
        {/* Inline Save Button */}
        <View style={styles.inlineActionButtons}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={saveChanges}
            disabled={saving}
          >
            <LinearGradient
              colors={saving ? ['#9CA3AF', '#6B7280'] : ['#4F83FF', '#667EEA']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {saving ? (
                <View style={styles.savingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>Saving...</Text>
                </View>
              ) : (
                <View style={styles.savingContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>Save Changes</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Compact Header Styles
  header: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    marginTop: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  headerLeft: {
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  quickStats: {
    marginTop: 2,
  },
  quickStatsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  
  // Profile Summary Card
  profileSummaryCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  summaryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  
  // Desktop Tab Styles
  tabScrollView: {
    paddingVertical: 4,
  },
  tabContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  // Content Styles
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingBottom: 120,
  },
  tabContent: {
    // Content wrapper for each tab
  },
  
  // Card Styles
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  
  // Amenities Grid
  amenitiesGrid: {
    marginTop: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  amenityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  amenityContent: {
    flex: 1,
  },
  amenityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  amenityDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    paddingHorizontal: 12,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
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
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    textTransform: 'capitalize',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeInput: {
    flex: 1,
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
  faqItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  inlineActionButtons: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 30,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F83FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 44,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    minWidth: 100,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  extraInfoItem: {
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  extraInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  extraInfoNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F83FF',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F83FF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#4F83FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exampleInfo: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#0C4A6E',
    marginBottom: 4,
    paddingLeft: 8,
  },

  // Hours Tab Styles
  dayCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayInfo: {
    flex: 1,
  },
  dayHours: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  dayClosedText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
  },
  timeInputContainer: {
    flex: 1,
  },
  quickSetupGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickSetupButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickSetupText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  quickSetupSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Mobile Navigation Styles
  tabNavigationContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mobileNavContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  mobileNavButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mobileNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileNavText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
  },
  mobileDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
  },
  mobileDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mobileDropdownItemActive: {
    backgroundColor: '#F8FAFC',
  },
  mobileDropdownText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
    flex: 1,
  },
});

export default BusinessProfileScreen;
