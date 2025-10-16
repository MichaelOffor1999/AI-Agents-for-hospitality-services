import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const AIVoiceSettingsScreen = ({ navigation }) => {
  const { tenant, updateTenant, isLoading } = useApp();
  
  const [settings, setSettings] = useState({
    greeting: '',
    description: '',
    tone: 'friendly',
    allergenNotes: '',
    unavailablePhrase: '',
    closedMessage: '',
    enableCallRecording: true,
    enableTranscripts: true,
    confidenceThreshold: 0.8,
    fallbackToHuman: true,
  });

  useEffect(() => {
    if (tenant?.aiVoiceSettings) {
      setSettings({
        ...settings,
        ...tenant.aiVoiceSettings,
      });
    }
  }, [tenant]);

  const handleSave = async () => {
    try {
      const success = await updateTenant({
        aiVoiceSettings: settings,
      });
      
      if (success) {
        Alert.alert('Success', 'AI Voice settings saved successfully');
      } else {
        Alert.alert('Error', 'Failed to save settings');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePreviewGreeting = () => {
    const currentHours = tenant?.getCurrentStatus() === 'Open' 
      ? 'We are currently open' 
      : 'We are currently closed';
    
    const previewText = `${settings.greeting}\n\n${currentHours}.\n\n${settings.description}`;
    
    Alert.alert('AI Greeting Preview', previewText);
  };

  const toneOptions = ['friendly', 'professional', 'casual', 'formal'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Voice Settings</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Greeting & Introduction</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Custom Greeting</Text>
            <TextInput
              style={styles.textInput}
              value={settings.greeting}
              onChangeText={(text) => setSettings({ ...settings, greeting: text })}
              placeholder="Hello! Thank you for calling..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Description</Text>
            <TextInput
              style={styles.textInput}
              value={settings.description}
              onChangeText={(text) => setSettings({ ...settings, description: text })}
              placeholder="Brief description of your business..."
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Voice Tone</Text>
            <View style={styles.toneSelector}>
              {toneOptions.map((tone) => (
                <TouchableOpacity
                  key={tone}
                  style={[
                    styles.toneOption,
                    settings.tone === tone && styles.selectedTone
                  ]}
                  onPress={() => setSettings({ ...settings, tone })}
                >
                  <Text style={[
                    styles.toneText,
                    settings.tone === tone && styles.selectedToneText
                  ]}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.previewButton} onPress={handlePreviewGreeting}>
            <Ionicons name="play-circle-outline" size={20} color="#4F83FF" />
            <Text style={styles.previewText}>Preview Greeting</Text>
          </TouchableOpacity>
        </View>

        {/* Response Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Response Templates</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Allergen Information</Text>
            <TextInput
              style={styles.textInput}
              value={settings.allergenNotes}
              onChangeText={(text) => setSettings({ ...settings, allergenNotes: text })}
              placeholder="Please let us know about any allergies..."
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Item Unavailable Message</Text>
            <TextInput
              style={styles.textInput}
              value={settings.unavailablePhrase}
              onChangeText={(text) => setSettings({ ...settings, unavailablePhrase: text })}
              placeholder="I'm sorry, that item is currently unavailable..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Closed Hours Message</Text>
            <TextInput
              style={styles.textInput}
              value={settings.closedMessage}
              onChangeText={(text) => setSettings({ ...settings, closedMessage: text })}
              placeholder="Thank you for calling. We are currently closed..."
              multiline
            />
          </View>
        </View>

        {/* Call Handling Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Call Handling</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Enable Call Recording</Text>
              <Text style={styles.switchDescription}>Record calls for quality and training</Text>
            </View>
            <Switch
              value={settings.enableCallRecording}
              onValueChange={(value) => setSettings({ ...settings, enableCallRecording: value })}
              trackColor={{ false: '#d1d5db', true: '#4F83FF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Generate Transcripts</Text>
              <Text style={styles.switchDescription}>Create text transcripts of conversations</Text>
            </View>
            <Switch
              value={settings.enableTranscripts}
              onValueChange={(value) => setSettings({ ...settings, enableTranscripts: value })}
              trackColor={{ false: '#d1d5db', true: '#4F83FF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Fallback to Human</Text>
              <Text style={styles.switchDescription}>Transfer complex calls to staff</Text>
            </View>
            <Switch
              value={settings.fallbackToHuman}
              onValueChange={(value) => setSettings({ ...settings, fallbackToHuman: value })}
              trackColor={{ false: '#d1d5db', true: '#4F83FF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Confidence Threshold: {Math.round(settings.confidenceThreshold * 100)}%
            </Text>
            <Text style={styles.inputDescription}>
              Minimum confidence level for AI responses
            </Text>
            <View style={styles.sliderContainer}>
              {[0.6, 0.7, 0.8, 0.9, 0.95].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.sliderButton,
                    settings.confidenceThreshold === value && styles.selectedSlider
                  ]}
                  onPress={() => setSettings({ ...settings, confidenceThreshold: value })}
                >
                  <Text style={[
                    styles.sliderText,
                    settings.confidenceThreshold === value && styles.selectedSliderText
                  ]}>
                    {Math.round(value * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Test Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing</Text>
          
          <TouchableOpacity style={styles.testButton}>
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={styles.testButtonText}>Test AI Voice Assistant</Text>
          </TouchableOpacity>
          
          <Text style={styles.testDescription}>
            This will place a test call to verify your AI settings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F83FF',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
  },
  toneSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toneOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedTone: {
    backgroundColor: '#EBF4FF',
    borderColor: '#4F83FF',
  },
  toneText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedToneText: {
    color: '#4F83FF',
    fontWeight: '500',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FF',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#4F83FF',
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchInfo: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedSlider: {
    backgroundColor: '#4F83FF',
  },
  sliderText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  selectedSliderText: {
    color: '#fff',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F83FF',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
  },
  testButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  testDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AIVoiceSettingsScreen;
