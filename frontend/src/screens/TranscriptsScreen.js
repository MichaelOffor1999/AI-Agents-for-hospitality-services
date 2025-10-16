import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TranscriptsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const conversations = [
    {
      id: 1,
      callId: 'CALL-001',
      phone: '+1 (555) 123-4567',
      date: 'Oct 15, 2025',
      duration: '2m 15s',
      status: 'completed',
      customerName: 'John Smith',
      orderTotal: '$18.50',
      messages: [
        {
          type: 'customer',
          text: 'Hello, I\'d like to place an order for pickup.',
          time: '10:32 AM',
          avatar: 'customer-1',
        },
        {
          type: 'ai',
          text: 'Of course! What can I get for you today?',
          time: '10:32 AM',
          avatar: 'ai',
        },
        {
          type: 'customer',
          text: 'I\'ll have a large pepperoni pizza and a side of garlic bread.',
          time: '10:33 AM',
          avatar: 'customer-1',
        },
        {
          type: 'ai',
          text: 'Great choice. Anything to drink with that?',
          time: '10:33 AM',
          avatar: 'ai',
        },
        {
          type: 'customer',
          text: 'No, that\'s all. Thanks.',
          time: '10:34 AM',
          avatar: 'customer-1',
        },
      ],
    },
    {
      id: 2,
      callId: 'CALL-002',
      phone: '+1 (555) 987-6543',
      date: 'Oct 15, 2025',
      duration: '1m 45s',
      status: 'completed',
      customerName: 'Sarah Wilson',
      orderTotal: '$24.75',
      messages: [
        {
          type: 'customer',
          text: 'Hi, do you have any vegetarian options?',
          time: '11:15 AM',
          avatar: 'customer-2',
        },
        {
          type: 'ai',
          text: 'Absolutely! We have several delicious vegetarian dishes. Would you like me to recommend some?',
          time: '11:15 AM',
          avatar: 'ai',
        },
        {
          type: 'customer',
          text: 'Yes, please. Something with pasta would be great.',
          time: '11:16 AM',
          avatar: 'customer-2',
        },
        {
          type: 'ai',
          text: 'I recommend our Truffle Risotto - it\'s very popular and completely vegetarian!',
          time: '11:16 AM',
          avatar: 'ai',
        },
        {
          type: 'customer',
          text: 'Perfect! I\'ll take one of those for delivery.',
          time: '11:17 AM',
          avatar: 'customer-2',
        },
      ],
    },
  ];

  const filters = ['All', 'Today', 'This Week', 'Completed', 'Pending'];

  const getAvatarColor = (avatar) => {
    if (avatar === 'ai') {
      return '#8B5CF6';
    }
    return '#10B981';
  };

  const getAvatarIcon = (avatar) => {
    if (avatar === 'ai') {
      return null; // Will show "AI" text
    }
    return null; // Will show customer icon
  };

  const renderConversation = ({ item: conversation }) => (
    <View style={styles.conversationCard}>
      {/* Conversation Header */}
      <View style={styles.conversationHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.callInfo}>
            <View style={styles.callIdContainer}>
              <Ionicons name="call" size={14} color="#4F83FF" />
              <Text style={styles.callId}>{conversation.callId}</Text>
            </View>
            <Text style={styles.phoneNumber}>{conversation.phone}</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{conversation.customerName}</Text>
            <View style={styles.orderInfo}>
              <Ionicons name="receipt-outline" size={12} color="#10B981" />
              <Text style={styles.orderTotal}>{conversation.orderTotal}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, styles.completedBadge]}>
            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
            <Text style={styles.statusText}>Completed</Text>
          </View>
          <Text style={styles.callDate}>{conversation.date}</Text>
          <Text style={styles.duration}>{conversation.duration}</Text>
        </View>
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        {conversation.messages.map((message, index) => (
          <View key={index} style={styles.messageRow}>
            <View 
              style={[
                styles.messageAvatar,
                message.type === 'ai' ? styles.aiAvatar : styles.customerAvatar
              ]}
            >
              {message.type === 'ai' ? (
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.aiAvatarGradient}
                >
                  <Ionicons name="sparkles" size={14} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={styles.customerAvatarCircle}>
                  <Ionicons name="person" size={14} color="#10B981" />
                </View>
              )}
            </View>
            
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageSender}>
                  {message.type === 'ai' ? 'AI Assistant' : 'Customer'}
                </Text>
                <Text style={styles.messageTime}>{message.time}</Text>
              </View>
              
              <View 
                style={[
                  styles.messageBubble,
                  message.type === 'ai' ? styles.aiBubble : styles.customerBubble
                ]}
              >
                <Text 
                  style={[
                    styles.messageText,
                    message.type === 'ai' ? styles.aiMessageText : styles.customerMessageText
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="chatbubbles" size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Call Transcripts</Text>
                <Text style={styles.headerSubtitle}>
                  {conversations.length} conversations • AI-powered assistance
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.exportButton}>
              <Ionicons name="download-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Call ID, Phone, or Date..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScrollView}
            contentContainerStyle={styles.filtersContainer}
          >
            {filters.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id.toString()}
        style={styles.conversationsList}
        contentContainerStyle={styles.conversationsContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  
  // Enhanced Header Styles
  headerGradient: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search Styles
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    marginRight: 8,
  },

  // Filter Styles
  filtersScrollView: {
    marginBottom: -10,
  },
  filtersContainer: {
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  filterButtonTextActive: {
    color: '#667eea',
  },

  // Conversations List
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    padding: 20,
    paddingTop: 30,
  },
  separator: {
    height: 16,
  },

  // Conversation Card
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },

  // Conversation Header
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  callInfo: {
    marginBottom: 8,
  },
  callIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  callId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F83FF',
    marginLeft: 6,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  completedBadge: {
    backgroundColor: '#f0fdf4',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  callDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },

  // Messages Container
  messagesContainer: {
    padding: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  messageAvatar: {
    marginRight: 12,
  },
  aiAvatar: {
    width: 36,
    height: 36,
  },
  aiAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 36,
    height: 36,
  },
  customerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Message Content
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '90%',
  },
  aiBubble: {
    backgroundColor: '#667eea',
    borderBottomLeftRadius: 4,
  },
  customerBubble: {
    backgroundColor: '#f8f9fa',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiMessageText: {
    color: '#fff',
  },
  customerMessageText: {
    color: '#333',
  },
});

export default TranscriptsScreen;
