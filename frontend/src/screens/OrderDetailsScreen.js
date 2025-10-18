import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  const theme = useTheme();

  const orderDetails = {
    id: '12345',
    date: '12/03/2024 18:30',
    status: 'Completed',
    customer: {
      name: 'John Doe',
      type: 'Takeaway',
      phone: '+353 87 123 4567',
    },
    items: [
      {
        name: 'Fish & Chips',
        quantity: 2,
        price: 18.00,
        notes: 'extra salt',
      },
      {
        name: 'Guinness',
        quantity: 1,
        price: 7.50,
        notes: null,
      },
    ],
    total: 25.50,
    transcript: {
      preview: '"Hi, I\'d like to place an order for takeaway..."\n"I\'ll have two fish and chips..."',
    },
  };

  // Glassmorphism style for cards/sections
  const glassStyle = {
    backgroundColor: theme.cardGlass,
    borderRadius: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.border,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <Text style={[styles.orderId, { color: theme.textStrong }]}>Order #{orderDetails.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: theme.statusBg }]}> 
            <Text style={[styles.statusText, { color: '#fff' }]}>{orderDetails.status}</Text>
          </View>
        </View>
        <Text style={[styles.orderDate, { color: theme.textDim }]}>{orderDetails.date}</Text>
        {/* Customer Info */}
        <View style={[styles.section, glassStyle]}>
          <View style={styles.customerInfo}>
            <View style={styles.customerDetails}>
              <Text style={[styles.customerName, { color: theme.textStrong }]}>{orderDetails.customer.name}</Text>
              <Text style={[styles.customerType, { color: theme.textDim }]}>{orderDetails.customer.type}</Text>
              <Text style={[styles.customerPhone, { color: theme.textDim }]}>{orderDetails.customer.phone}</Text>
            </View>
            <TouchableOpacity style={[styles.phoneButton, { backgroundColor: theme.primary }]}> 
              <Ionicons name="call" size={20} color={theme.iconOnAccent} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Order Items */}
        <View style={[styles.section, glassStyle]}>
          <Text style={[styles.sectionTitle, { color: theme.textStrong }]}>Order Items</Text>
          {orderDetails.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.textStrong }]}>{item.quantity}x {item.name}</Text>
                {item.notes && (
                  <Text style={[styles.itemNotes, { color: theme.textDim }]}>Notes: {item.notes}</Text>
                )}
              </View>
              <Text style={[styles.itemPrice, { color: theme.textStrong }]}>€{item.price.toFixed(2)}</Text>
            </View>
          ))}
          <View style={[styles.totalSection, { borderTopColor: theme.border }]}>
            <Text style={[styles.totalLabel, { color: theme.textStrong }]}>Total</Text>
            <Text style={[styles.totalAmount, { color: theme.primary }]}>€{orderDetails.total.toFixed(2)}</Text>
          </View>
        </View>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.downloadButton, { backgroundColor: theme.primary }]}> 
            <Text style={[styles.downloadButtonText, { color: theme.buttonText }]}>Download Kitchen Receipt (PDF)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.reprintButton, { backgroundColor: theme.buttonBg }]}> 
            <Text style={[styles.reprintButtonText, { color: theme.textDim }]}>Reprint</Text>
          </TouchableOpacity>
        </View>
        {/* Transcript Preview */}
        <View style={[styles.transcriptSection, glassStyle]}>
          <Text style={[styles.transcriptTitle, { color: theme.textStrong }]}>Transcript Preview</Text>
          <Text style={[styles.transcriptText, { color: theme.textDim }]}>{orderDetails.transcript.preview}</Text>
          <TouchableOpacity 
            style={styles.fullTranscriptButton}
            onPress={() => navigation.navigate('Transcripts', { orderId: orderDetails.id })}
          >
            <Text style={[styles.fullTranscriptText, { color: theme.primary }]}>View Full Transcript</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 5,
  },
  orderId: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerType: {
    fontSize: 14,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
  },
  phoneButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    marginTop: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  downloadButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reprintButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  reprintButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  transcriptText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 15,
  },
  fullTranscriptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullTranscriptText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
});

export default OrderDetailsScreen;
