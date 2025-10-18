import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useTheme } from '../utils/theme';

const SettingsScreen = ({ navigation }) => {
  const [retentionModalVisible, setRetentionModalVisible] = useState(false);
  const [selectedRetention, setSelectedRetention] = useState('60 Days');
  
  // App Settings
  const [notifications, setNotifications] = useState({
    newOrders: true,
    callTranscripts: true,
    dailyReports: false,
    systemUpdates: true,
  });
  
  const { darkMode, toggleDarkMode } = useApp();
  const theme = useTheme();
  
  const [openingHours, setOpeningHours] = useState({
    Monday: { open: '09:00', close: '22:00', closed: false },
    Tuesday: { open: '09:00', close: '22:00', closed: false },
    Wednesday: { open: '09:00', close: '22:00', closed: false },
    Thursday: { open: '09:00', close: '22:00', closed: false },
    Friday: { open: '09:00', close: '23:00', closed: false },
    Saturday: { open: '10:00', close: '23:00', closed: false },
    Sunday: { open: '00:00', close: '00:00', closed: true },
  });

  const retentionOptions = ['30 Days', '60 Days', '90 Days', '6 Months', '1 Year'];
  
  // Settings sections
  const generalSettings = [
    {
      id: 'business',
      title: 'Business Profile',
      subtitle: 'Update restaurant info, hours & contact details',
      icon: 'business',
      color: '#4F83FF',
      route: 'BusinessProfile',
    },
    {
      id: 'voice',
      title: 'AI Voice Assistant',
      subtitle: 'Configure AI responses & voice settings',
      icon: 'mic',
      color: '#10B981',
      route: 'AIVoiceSettings',
    },
    {
      id: 'transcripts',
      title: 'Call Transcripts',
      subtitle: 'Review customer calls & conversations',
      icon: 'chatbubbles',
      color: '#8B5CF6',
      route: 'Transcripts',
    },
    {
      id: 'menu',
      title: 'Menu Management',
      subtitle: 'Edit dishes, prices & availability',
      icon: 'restaurant',
      color: '#F59E0B',
      route: 'MenuManagement',
    },
  ];
  
  const formatHours = (day) => {
    const hours = openingHours[day];
    if (hours.closed) return 'Closed';
    return `${hours.open} - ${hours.close}`;
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transcripts and logs. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive', 
          onPress: () => {
            // Implement data clearing logic here
            Alert.alert('Success', 'All data has been cleared successfully.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      {/* Beautiful Gradient Header */}
      <LinearGradient
        colors={['#667EEA', '#764BA2', '#667EEA']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>Manage your restaurant preferences</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="settings" size={28} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Quick Actions Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIcon, { backgroundColor: '#EBF4FF' }]}>
                <Ionicons name="flash" size={20} color="#4F83FF" />
              </View>
              <Text style={styles.sectionTitle}>Quick Access</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>Navigate to main features quickly</Text>
          
          <View style={styles.quickActionsContainer}>
            {generalSettings.map((setting) => (
              <TouchableOpacity
                key={setting.id}
                style={styles.quickActionCard}
                onPress={() => setting.route && navigation.navigate(setting.route)}
                activeOpacity={0.7}
              >
                <View style={styles.quickActionContent}>
                  <View style={[styles.quickActionIcon, { backgroundColor: `${setting.color}15` }]}>
                    <Ionicons name={setting.icon} size={22} color={setting.color} />
                  </View>
                  <View style={styles.quickActionTextContainer}>
                    <Text style={styles.quickActionTitle} numberOfLines={1}>
                      {setting.title}
                    </Text>
                    <Text style={styles.quickActionSubtitle} numberOfLines={2}>
                      {setting.subtitle}
                    </Text>
                  </View>
                </View>
                <View style={[styles.quickActionArrow, { backgroundColor: `${setting.color}10` }]}>
                  <Ionicons name="chevron-forward" size={14} color={setting.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIcon}>
                <Ionicons name="notifications" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
          </View>
          
          {Object.entries(notifications).map(([key, value]) => (
            <View key={key} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>
                  {key === 'newOrders' && 'New Orders'}
                  {key === 'callTranscripts' && 'Call Transcripts'}
                  {key === 'dailyReports' && 'Daily Reports'}
                  {key === 'systemUpdates' && 'System Updates'}
                </Text>
                <Text style={styles.settingDescription}>
                  {key === 'newOrders' && 'Get notified when new orders arrive'}
                  {key === 'callTranscripts' && 'Receive call transcript summaries'}
                  {key === 'dailyReports' && 'Daily business performance reports'}
                  {key === 'systemUpdates' && 'App updates and new features'}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={(newValue) => 
                  setNotifications(prev => ({ ...prev, [key]: newValue }))
                }
                trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
                thumbColor={value ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>

        {/* App Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIcon}>
                <Ionicons name="options" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.sectionTitle}>App Preferences</Text>
            </View>
          </View>
          
          {/* Dark Mode Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme throughout the app</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E5E7EB', true: theme.primary }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIcon}>
                <Ionicons name="server" size={20} color="#10B981" />
              </View>
              <Text style={styles.sectionTitle}>Data Management</Text>
            </View>
          </View>
          
          <View style={styles.dataItem}>
            <View style={styles.dataItemLeft}>
              <View style={styles.dataItemIcon}>
                <Ionicons name="time" size={20} color="#10B981" />
              </View>
              <View style={styles.dataItemTextContainer}>
                <Text style={styles.dataItemTitle}>Transcript Retention</Text>
                <Text style={styles.dataItemSubtitle}>How long to keep call transcripts</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.dataSelector}
              onPress={() => setRetentionModalVisible(true)}
            >
              <Text style={styles.dataSelectorText}>{selectedRetention}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.dataAction} onPress={handleClearData}>
            <View style={styles.dataActionLeft}>
              <View style={[styles.dataItemIcon, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="trash" size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.dataActionTitle}>Clear All Data</Text>
                <Text style={styles.dataActionSubtitle}>Remove all transcripts and logs</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="information-circle" size={20} color="#6366F1" />
              </View>
              <Text style={styles.sectionTitle}>About</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>App information and support resources</Text>
          
          {/* Featured App Card */}
          <View style={styles.aboutAppCard}>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED', '#EC4899']}
              style={styles.aboutAppGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.aboutAppContent}>
                <View style={styles.aboutAppIcon}>
                  <Ionicons name="restaurant" size={32} color="#fff" />
                </View>
                <View style={styles.aboutAppInfo}>
                  <Text style={styles.aboutAppTagline}>AI-Powered Restaurant Solution</Text>
                  <View style={styles.aboutVersionBadge}>
                    <View style={styles.aboutStatusDot} />
                    <Text style={styles.aboutStatusText}>Stable • Reliable • Secure</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* App Description */}
          <View style={styles.aboutDescription}>
            <Text style={styles.aboutDescriptionTitle}>Restaurant Manager Pro</Text>
            <Text style={styles.aboutDescriptionText}>
              Streamline your restaurant operations with our comprehensive AI-powered solution. 
              From intelligent call handling and menu management to detailed analytics and 
              business insights - everything you need to run a successful restaurant.
            </Text>
            
            <View style={styles.aboutFeatures}>
              <View style={styles.aboutFeature}>
                <Ionicons name="mic" size={16} color="#6366F1" />
                <Text style={styles.aboutFeatureText}>AI Voice Assistant</Text>
              </View>
              <View style={styles.aboutFeature}>
                <Ionicons name="analytics" size={16} color="#10B981" />
                <Text style={styles.aboutFeatureText}>Business Analytics</Text>
              </View>
              <View style={styles.aboutFeature}>
                <Ionicons name="restaurant" size={16} color="#F59E0B" />
                <Text style={styles.aboutFeatureText}>Menu Management</Text>
              </View>
            </View>
          </View>

          {/* Support & Links */}
          <View style={styles.aboutActionsContainer}>
            <TouchableOpacity 
              style={styles.aboutAction}
              onPress={() => Alert.alert('Help', 'Opening support center...')}
            >
              <View style={styles.aboutActionIcon}>
                <Ionicons name="help-circle" size={20} color="#4F83FF" />
              </View>
              <View style={styles.aboutActionContent}>
                <Text style={styles.aboutActionTitle}>Help Center</Text>
                <Text style={styles.aboutActionSubtitle}>Get support and documentation</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.aboutAction}
              onPress={() => Alert.alert('Feedback', 'Opening feedback form...')}
            >
              <View style={styles.aboutActionIcon}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#10B981" />
              </View>
              <View style={styles.aboutActionContent}>
                <Text style={styles.aboutActionTitle}>Send Feedback</Text>
                <Text style={styles.aboutActionSubtitle}>Share your thoughts and suggestions</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.aboutAction}
              onPress={() => Alert.alert('Privacy', 'Opening privacy policy...')}
            >
              <View style={styles.aboutActionIcon}>
                <Ionicons name="document-text" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.aboutActionContent}>
                <Text style={styles.aboutActionTitle}>Privacy Policy</Text>
                <Text style={styles.aboutActionSubtitle}>Review our privacy terms</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.aboutAction}
              onPress={() => Alert.alert('Terms', 'Opening terms of service...')}
            >
              <View style={styles.aboutActionIcon}>
                <Ionicons name="document" size={20} color="#F59E0B" />
              </View>
              <View style={styles.aboutActionContent}>
                <Text style={styles.aboutActionTitle}>Terms of Service</Text>
                <Text style={styles.aboutActionSubtitle}>Read our terms and conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <View style={styles.aboutFooter}>
            <Text style={styles.aboutCopyright}>
              © 2025 Restaurant Manager Pro. All rights reserved.
            </Text>
            <Text style={styles.aboutMadeWith}>
              Made with ❤️ for restaurant owners
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => Alert.alert('Success', 'Settings saved successfully!')}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save All Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Retention Modal */}
      <Modal
        visible={retentionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRetentionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Retention Period</Text>
              <TouchableOpacity 
                onPress={() => setRetentionModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {retentionOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  selectedRetention === option && styles.selectedOption
                ]}
                onPress={() => {
                  setSelectedRetention(option);
                  setRetentionModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedRetention === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
                {selectedRetention === option && (
                  <Ionicons name="checkmark" size={20} color="#4F83FF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header Styles
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  
  // Scroll Content
  scrollContent: {
    paddingBottom: 30,
  },
  
  // Section Styles
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  
  // Quick Actions Container
  quickActionsContainer: {
    marginTop: 4,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionCardActive: {
    backgroundColor: '#fff',
    borderColor: '#4F83FF',
    transform: [{ scale: 0.98 }],
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  quickActionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 3,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 17,
  },
  quickActionArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Settings Row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  
  // Data Management
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 80,
  },
  dataItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 20,
    paddingTop: 2,
  },
  dataItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataItemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dataItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  dataItemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  dataSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 100,
    justifyContent: 'space-between',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  dataSelectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginRight: 8,
  },
  dataAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  dataActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 2,
  },
  dataActionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  
  // About Section - Enhanced App Card
  aboutAppCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  aboutAppGradient: {
    padding: 20,
  },
  aboutAppContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  aboutAppIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aboutAppInfo: {
    flex: 1,
  },
  aboutAppName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  aboutAppTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  aboutVersionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  aboutVersionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  aboutStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  aboutStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  aboutAppStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aboutStat: {
    alignItems: 'center',
  },
  aboutStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  aboutStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  // Enhanced Info Grid
  aboutInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  enhancedInfoCard: {
    position: 'relative',
  },
  aboutInfoCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  aboutInfoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  aboutInfoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  aboutInfoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aboutInfoBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4F83FF',
    textTransform: 'uppercase',
  },
  
  // Enhanced Description
  aboutDescription: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutDescriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  aboutDescriptionText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  aboutFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  aboutFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 4,
  },
  aboutFeatureText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    marginLeft: 6,
  },
  
  // Save Button
  saveContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#EBF4FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000',
  },
  selectedOptionText: {
    color: '#4F83FF',
    fontWeight: '500',
  },
  
  // About Actions Container
  aboutActionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  aboutActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aboutActionContent: {
    flex: 1,
  },
  aboutActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  aboutActionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  
  // About Footer
  aboutFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 20,
  },
  aboutCopyright: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  aboutMadeWith: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SettingsScreen;
