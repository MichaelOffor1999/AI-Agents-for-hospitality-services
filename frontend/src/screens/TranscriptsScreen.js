import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/theme';
import { useRoute } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const TranscriptsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showOnlyOrder, setShowOnlyOrder] = useState(false); // NEW
  const theme = useTheme();
  const route = useRoute();
  const orderId = route.params?.orderId;
  const conversations = [
    {
      id: '12345',
      callId: 'CALL-001',
      phone: '+1 (555) 123-4567',
      date: 'Oct 15, 2025',
      duration: '2m 15s',
      status: 'completed',
      customerName: 'John Doe',
      orderTotal: '$18.50',
      messages: [
        {
          type: 'customer',
          text: "Hello, I'd like to place an order for pickup.",
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
          text: "I'll have two fish and chips...",
          time: '10:33 AM',
          avatar: 'customer-1',
        },
      ],
    },
    {
      id: '12346',
      callId: 'CALL-002',
      phone: '+1 (555) 987-6543',
      date: 'Oct 14, 2025',
      duration: '3m 05s',
      status: 'completed',
      customerName: 'Jane Smith',
      orderTotal: '$24.00',
      messages: [
        {
          type: 'customer',
          text: 'Hi, do you have any vegan options?',
          time: '11:10 AM',
          avatar: 'customer-2',
        },
        {
          type: 'ai',
          text: 'Yes, we have a vegan burger and salad. Would you like to order?',
          time: '11:11 AM',
          avatar: 'ai',
        },
        {
          type: 'customer',
          text: "I'll take the vegan burger and a lemonade.",
          time: '11:12 AM',
          avatar: 'customer-2',
        },
      ],
    },
    {
      id: '12347',
      callId: 'CALL-003',
      phone: '+1 (555) 222-3333',
      date: 'Oct 13, 2025',
      duration: '1m 45s',
      status: 'pending',
      customerName: 'Carlos Rivera',
      orderTotal: '$12.75',
      messages: [
        {
          type: 'customer',
          text: 'Can I get a chicken wrap for delivery?',
          time: '1:05 PM',
          avatar: 'customer-3',
        },
        {
          type: 'ai',
          text: 'Absolutely! May I have your address, please?',
          time: '1:06 PM',
          avatar: 'ai',
        },
        {
          type: 'customer',
          text: '123 Main St, Apt 4B.',
          time: '1:06 PM',
          avatar: 'customer-3',
        },
      ],
    },
    {
      id: '12348',
      callId: 'CALL-004',
      phone: '+1 (555) 444-5555',
      date: 'Oct 12, 2025',
      duration: '2m 30s',
      status: 'completed',
      customerName: 'Emily Chen',
      orderTotal: '$30.00',
      messages: [
        {
          type: 'customer',
          text: 'I want to place a large group order for 5 people.',
          time: '6:20 PM',
          avatar: 'customer-4',
        },
        {
          type: 'ai',
          text: 'Great! What would you like to order for your group?',
          time: '6:21 PM',
          avatar: 'ai',
        },
        {
          type: 'customer',
          text: '3 burgers, 2 salads, and 5 drinks.',
          time: '6:22 PM',
          avatar: 'customer-4',
        },
      ],
    },
    {
      id: '12349',
      callId: 'CALL-005',
      phone: '+1 (555) 666-7777',
      date: 'Oct 11, 2025',
      duration: '1m 10s',
      status: 'completed',
      customerName: 'Fatima Al-Farsi',
      orderTotal: '$9.99',
      messages: [
        {
          type: 'customer',
          text: 'Do you have gluten-free pizza?',
          time: '3:15 PM',
          avatar: 'customer-5',
        },
        {
          type: 'ai',
          text: 'Yes, we do! Would you like to order one?',
          time: '3:16 PM',
          avatar: 'ai',
        },
        {
          type: 'customer',
          text: 'Yes, please. One gluten-free margherita.',
          time: '3:16 PM',
          avatar: 'customer-5',
        },
      ],
    },
  ];
  const filters = ['All', 'Today', 'This Week', 'Completed', 'Pending'];
  let filteredConversations = conversations;
  // Only filter by orderId if showOnlyOrder is true
  if (orderId && showOnlyOrder) {
    filteredConversations = conversations.filter(c => c.id.toString() === orderId.toString());
  }
  if (searchQuery) {
    filteredConversations = filteredConversations.filter(c =>
      c.callId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (selectedFilter !== 'All') {
    filteredConversations = filteredConversations.filter(c => c.status === selectedFilter.toLowerCase());
  }

  const renderConversation = ({ item: conversation }) => (
    <View style={[styles.conversationCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}> 
      <View style={[styles.conversationHeaderRedesigned, { backgroundColor: theme.headerGlass, borderBottomColor: theme.border }]}> 
        <View style={styles.headerLeftCol}> 
          <View style={styles.callIdPhoneRow}> 
            <Ionicons name="call" size={16} color="#4F83FF" style={{marginRight: 6}} />
            <Text style={styles.callIdRedesigned}>{conversation.callId}</Text>
          </View>
          <Text style={styles.phoneNumberRedesigned}>{conversation.phone}</Text>
          <View style={styles.customerNameOrderRow}>
            <Text style={[styles.customerNameRedesigned, { color: theme.textStrong }]} numberOfLines={2} ellipsizeMode="tail">{conversation.customerName}</Text>
            <View style={styles.orderInfoRedesigned}>
              <Ionicons name="receipt-outline" size={14} color="#10B981" />
              <Text style={styles.orderTotalRedesigned}>{conversation.orderTotal}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRightCol}>
          <View style={[styles.statusBadge, styles.completedBadge, {alignSelf: 'flex-end'}]}>
            <Ionicons name="checkmark-circle" size={13} color="#10B981" />
            <Text style={[styles.statusText, { color: theme.textStrong }]}>Completed</Text>
          </View>
          <Text style={styles.callDateRedesigned}>{conversation.date}</Text>
          <Text style={styles.durationRedesigned}>{conversation.duration}</Text>
        </View>
      </View>
      <View style={[styles.messagesContainerRedesigned, { backgroundColor: theme.bg }]}> 
        {conversation.messages.map((message, index) => {
          const isAI = message.type === 'ai';
          return (
            <View
              key={index}
              style={[
                styles.messageRowRedesigned,
                isAI ? styles.messageRowAI : styles.messageRowCustomer,
              ]}
            >
              {isAI && (
                <View style={styles.messageAvatarRedesigned}>
                  <LinearGradient
                    colors={theme.primary === '#4F83FF' ? ["#667eea", "#764ba2"] : [theme.primary, theme.accent]}
                    style={styles.aiAvatarGradient}
                  >
                    <Ionicons name="sparkles" size={16} color="#fff" />
                  </LinearGradient>
                </View>
              )}
              <View style={styles.messageContentRedesigned}>
                <View
                  style={[
                    styles.messageBubbleRedesigned,
                    isAI
                      ? { backgroundColor: theme.primary, borderBottomLeftRadius: 4 }
                      : { backgroundColor: theme.buttonBg, borderColor: theme.border, borderWidth: 1, borderBottomRightRadius: 4 },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageTextRedesigned,
                      isAI ? { color: '#fff' } : { color: theme.textStrong },
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
                <View style={styles.messageMetaRow}>
                  <Text style={[styles.messageSenderRedesigned, { color: theme.textDim }]}> 
                    {isAI ? 'AI Assistant' : conversation.customerName || 'Customer'}
                  </Text>
                  <Text style={[styles.messageTimeRedesigned, { color: theme.textDim }]}>{message.time}</Text>
                </View>
              </View>
              {!isAI && (
                <View style={styles.messageAvatarRedesigned}>
                  <View style={[styles.customerAvatarCircle, { backgroundColor: theme.cardGlass }]}> 
                    <Ionicons name="person" size={16} color={theme.success} />
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg, flex: 1 }]}> 
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Ionicons name="chatbubble-ellipses" size={32} color={theme.primary} style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.textStrong }}>Call Transcripts</Text>
            <Text style={{ fontSize: 13, color: theme.textDim, marginTop: 2 }}>{filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} · AI-powered assistance</Text>
          </View>
        </View>
        {/* Show toggle if navigated with orderId */}
        {orderId && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 2 }}>
            <TouchableOpacity
              style={{
                backgroundColor: showOnlyOrder ? theme.primary : theme.buttonBg,
                borderRadius: 18,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderWidth: 1,
                borderColor: theme.border,
                marginRight: 10,
              }}
              onPress={() => setShowOnlyOrder(v => !v)}
              activeOpacity={0.85}
            >
              <Text style={{ color: showOnlyOrder ? '#fff' : theme.primary, fontWeight: '600', fontSize: 14 }}>
                {showOnlyOrder ? 'Showing This Order Only' : 'Show Only This Order'}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: theme.textDim, fontSize: 13 }}>
              {showOnlyOrder ? 'Filtered by order' : 'Showing all transcripts'}
            </Text>
          </View>
        )}
        <View style={{ marginTop: 8 }}>
          <View style={{
            backgroundColor: theme.buttonBg,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOpacity: 0.03,
            shadowRadius: 4,
          }}>
            <Ionicons name="search" size={20} color={theme.textDim} style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, color: theme.textStrong, fontSize: 15 }}
              placeholder="Search by Call ID, Phone, or Name..."
              placeholderTextColor={theme.textDim}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginLeft: 8 }}>
                <Ionicons name="close-circle" size={20} color={theme.iconDim} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-start', paddingHorizontal: 2 }} style={{ marginTop: 18 }}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={{
                backgroundColor: selectedFilter === filter ? theme.primary : theme.buttonBg,
                borderRadius: 22,
                paddingHorizontal: 18,
                paddingVertical: 7,
                borderWidth: 0,
                shadowColor: '#000',
                shadowOpacity: selectedFilter === filter ? 0.08 : 0,
                shadowRadius: 4,
                marginRight: 8,
              }}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.85}
            >
              <Text style={{ color: selectedFilter === filter ? '#fff' : theme.primary, fontWeight: '600', fontSize: 14 }}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id.toString()}
        style={styles.conversationsList}
        contentContainerStyle={styles.conversationsContent}
        showsVerticalScrollIndicator={true}
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
  conversationHeaderRedesigned: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8fafd',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  headerLeftCol: {
    flex: 1.5,
    minWidth: 0,
    marginRight: 10,
  },
  callIdPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  callIdRedesigned: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F83FF',
    marginRight: 8,
    flexShrink: 0,
  },
  phoneNumberRedesigned: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    marginBottom: 6,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  customerNameOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
    gap: 8,
  },
  customerNameRedesigned: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: '70%',
  },
  orderInfoRedesigned: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 4,
  },
  orderTotalRedesigned: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 4,
  },
  headerRightCol: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 80,
    gap: 2,
  },
  callDateRedesigned: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    marginBottom: 0,
    fontWeight: '500',
    textAlign: 'right',
  },
  durationRedesigned: {
    fontSize: 13,
    color: '#bbb',
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 0,
  },

  // Messages Container
  messagesContainerRedesigned: {
    paddingHorizontal: 12,
    paddingVertical: 18,
    backgroundColor: '#f6f8fa',
    borderRadius: 14,
    margin: 12,
    marginTop: 0,
  },
  messageRowRedesigned: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18,
    minHeight: 44,
  },
  messageRowAI: {
    justifyContent: 'flex-start',
  },
  messageRowCustomer: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  messageAvatarRedesigned: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 4,
  },
  messageContentRedesigned: {
    maxWidth: '80%',
    flexShrink: 1,
  },
  messageBubbleRedesigned: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  aiBubbleRedesigned: {
    backgroundColor: '#667eea',
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  customerBubbleRedesigned: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageTextRedesigned: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageSenderRedesigned: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginRight: 8,
  },
  messageTimeRedesigned: {
    fontSize: 11,
    color: '#bbb',
    fontWeight: '400',
  },
  messageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
    gap: 8,
  },
  transcriptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#667eea',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    maxWidth: screenWidth - 24,
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  amountTag: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    alignSelf: 'flex-end',
    maxWidth: 80,
  },
  amountText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default TranscriptsScreen;
