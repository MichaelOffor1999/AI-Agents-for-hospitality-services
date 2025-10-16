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

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{orderDetails.id}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{orderDetails.status}</Text>
          </View>
        </View>
        
        <Text style={styles.orderDate}>{orderDetails.date}</Text>

        {/* Customer Info */}
        <View style={styles.section}>
          <View style={styles.customerInfo}>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{orderDetails.customer.name}</Text>
              <Text style={styles.customerType}>{orderDetails.customer.type}</Text>
              <Text style={styles.customerPhone}>{orderDetails.customer.phone}</Text>
            </View>
            <TouchableOpacity style={styles.phoneButton}>
              <Ionicons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          
          {orderDetails.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                {item.notes && (
                  <Text style={styles.itemNotes}>Notes: {item.notes}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>€{item.price.toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>€{orderDetails.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>Download Kitchen Receipt (PDF)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reprintButton}>
            <Text style={styles.reprintButtonText}>Reprint</Text>
          </TouchableOpacity>
        </View>

        {/* Transcript Preview */}
        <View style={styles.transcriptSection}>
          <Text style={styles.transcriptTitle}>Transcript Preview</Text>
          <Text style={styles.transcriptText}>{orderDetails.transcript.preview}</Text>
          
          <TouchableOpacity 
            style={styles.fullTranscriptButton}
            onPress={() => navigation.navigate('Transcripts')}
          >
            <Text style={styles.fullTranscriptText}>View Full Transcript</Text>
            <Ionicons name="arrow-forward" size={16} color="#4F83FF" />
          </TouchableOpacity>
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
    color: '#000',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    marginBottom: 20,
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
    color: '#000',
    marginBottom: 4,
  },
  customerType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  phoneButton: {
    backgroundColor: '#4F83FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
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
    color: '#000',
    marginBottom: 2,
  },
  itemNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F83FF',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  downloadButton: {
    backgroundColor: '#4F83FF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reprintButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  reprintButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  transcriptText: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#4F83FF',
    fontWeight: '500',
    marginRight: 5,
  },
});

export default OrderDetailsScreen;
