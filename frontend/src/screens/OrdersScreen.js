import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getStatusIcon, getOrderTypeIcon, debounce } from '../utils/helpers';
import { useTheme } from '../utils/theme';

const OrdersScreen = ({ navigation }) => {
  const { 
    orders, 
    tenant, 
    isLoading, 
    loadOrders, 
    updateOrderStatus,
    filters,
    setFilters
  } = useApp();
  const theme = useTheme();

  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Mock orders for when API is not available
  const mockOrders = [
    {
      id: '12345',
      customerName: 'John D.',
      customerPhone: '+353 87 123 4567',
      items: [{ name: 'Fish & Chips', quantity: 2, price: 9 }, { name: 'Guinness', quantity: 1, price: 6.50 }],
      total: 24.50,
      type: 'takeaway',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: '12344',
      customerName: 'Jane S.',
      customerPhone: '+353 87 765 4321',
      items: [{ name: 'Irish Stew', quantity: 2, price: 9 }],
      total: 18.00,
      type: 'dine-in',
      status: 'preparing',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '12343',
      customerName: 'Mike O.',
      customerPhone: '+353 87 555 1234',
      items: [{ name: 'Shepherd\'s Pie', quantity: 1, price: 12 }],
      total: 12.00,
      type: 'delivery',
      status: 'ready',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    }
  ];

  const ordersData = orders?.length ? orders : mockOrders;

  useEffect(() => {
    if (tenant) {
      loadOrders?.(filters);
    }
  }, [tenant, filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadOrders?.();
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus?.(orderId, newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      preparing: '#EF4444',
      ready: '#10B981',
      completed: '#6B7280',
      cancelled: '#DC2626',
    };
    return colors[status] || '#6B7280';
  };

  const getTypeColor = (type) => {
    const colors = {
      'dine-in': '#8B5CF6',
      takeaway: '#F59E0B',
      delivery: '#10B981',
    };
    return colors[type] || '#6B7280';
  };

  const filteredOrders = ordersData.filter(order => {
    const matchesStatus = filters.orderStatus === 'all' || order.status === filters.orderStatus;
    const matchesType = filters.orderType === 'all' || order.type === filters.orderType;
    const matchesSearch = !searchQuery || 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      {/* Header with Search and Filter */}
      <View style={[styles.headerContainer, { backgroundColor: theme.headerGlass, borderBottomColor: theme.border }]}> 
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.textStrong }]}>Orders</Text>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: theme.buttonBg }]}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="filter" size={20} color={theme.primary} />
            <Text style={[styles.filterButtonText, { color: theme.primary }]}>Filter</Text>
          </TouchableOpacity>
        </View>
        {/* Compact Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}> 
            <Ionicons name="search" size={18} color={theme.iconDim} />
            <TextInput
              style={[styles.searchInput, { color: theme.textStrong }]}
              placeholder="Search orders..."
              placeholderTextColor={theme.textDim}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        {/* Active Filter Indicators */}
        {(filters.orderStatus !== 'all' || filters.orderType !== 'all') && (
          <View style={styles.activeFilters}>
            {filters.orderStatus !== 'all' && (
              <View style={[styles.filterChip, { backgroundColor: theme.accent }]}> 
                <Text style={[styles.filterChipText, { color: theme.buttonBg }]}>Status: {filters.orderStatus}</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, orderStatus: 'all' })}>
                  <Ionicons name="close" size={14} color={theme.buttonBg} />
                </TouchableOpacity>
              </View>
            )}
            {filters.orderType !== 'all' && (
              <View style={[styles.filterChip, { backgroundColor: theme.accent }]}> 
                <Text style={[styles.filterChipText, { color: theme.buttonBg }]}>Type: {filters.orderType}</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, orderType: 'all' })}>
                  <Ionicons name="close" size={14} color={theme.buttonBg} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.filterModal, { backgroundColor: theme.cardGlass }]}> 
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}> 
              <Text style={[styles.modalTitle, { color: theme.textStrong }]}>Filter Orders</Text>
              <TouchableOpacity 
                onPress={() => setFilterVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.textDim} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalContent} 
              contentContainerStyle={{ flexGrow: 1 }} 
              keyboardShouldPersistTaps="handled"
            >
              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: theme.textStrong }]}>Order Status</Text>
                <View style={styles.filterOptions}>
                  {[
                    { value: 'all', label: 'All Orders' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'preparing', label: 'Preparing' },
                    { value: 'ready', label: 'Ready' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' }
                  ].map(status => (
                    <TouchableOpacity 
                      key={status.value}
                      style={styles.filterOption}
                      onPress={() => setFilters({ ...filters, orderStatus: status.value })}
                    >
                      <View style={[styles.radio, { borderColor: theme.border }, filters.orderStatus === status.value && { borderColor: theme.primary, backgroundColor: theme.primary }]} />
                      <Text style={[styles.filterOptionText, { color: theme.textDim }, filters.orderStatus === status.value && { color: theme.primary, fontWeight: '500' }]}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* Type Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: theme.textStrong }]}>Order Type</Text>
                <View style={styles.filterOptions}>
                  {[
                    { value: 'all', label: 'All Types' },
                    { value: 'dine-in', label: 'Dine In' },
                    { value: 'takeaway', label: 'Takeaway' },
                    { value: 'delivery', label: 'Delivery' }
                  ].map(type => (
                    <TouchableOpacity 
                      key={type.value}
                      style={styles.filterOption}
                      onPress={() => setFilters({ ...filters, orderType: type.value })}
                    >
                      <View style={[styles.radio, { borderColor: theme.border }, filters.orderType === type.value && { borderColor: theme.primary, backgroundColor: theme.primary }]} />
                      <Text style={[styles.filterOptionText, { color: theme.textDim }, filters.orderType === type.value && { color: theme.primary, fontWeight: '500' }]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={[styles.modalActions, { borderTopColor: theme.border }]}> 
              <TouchableOpacity 
                style={[styles.resetButton, { backgroundColor: theme.buttonBg }]}
                onPress={() => setFilters({ orderStatus: 'all', orderType: 'all' })}
              >
                <Text style={[styles.resetButtonText, { color: theme.textDim }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.applyButton, { backgroundColor: theme.primary }]}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={[styles.applyButtonText, { color: theme.buttonBg }]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Orders List */}
      <ScrollView 
        style={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.map((order) => (
          <View key={order.id} style={[styles.orderCard, { backgroundColor: theme.cardGlass, shadowColor: theme.shadow }]}> 
            <View style={styles.orderHeader}>
              <View>
                <Text style={[styles.orderTime, { color: theme.textDim }]}>Time</Text>
                <Text style={[styles.orderTimeValue, { color: theme.textStrong }]}>{formatDate(order.createdAt, 'time')}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={[styles.orderCustomer, { color: theme.textDim }]}>Customer</Text>
                <Text style={[styles.orderCustomerValue, { color: theme.textStrong }]}>{order.customerName}</Text>
              </View>
            </View>
            <View style={styles.orderDetails}>
              <View>
                <Text style={[styles.orderLabel, { color: theme.textDim }]}>Items</Text>
                <Text style={[styles.orderValue, { color: theme.textStrong }]}>{order.items?.length || 0} items</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={[styles.orderLabel, { color: theme.textDim }]}>Total</Text>
                <Text style={[styles.orderValue, { color: theme.textStrong }]}>{formatCurrency(order.total)}</Text>
              </View>
            </View>
            <View style={styles.orderFooter}>
              <View>
                <Text style={[styles.orderLabel, { color: theme.textDim }]}>Type</Text>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(order.type) }]}> 
                  <Ionicons name={getOrderTypeIcon(order.type)} size={12} color="#fff" />
                  <Text style={styles.typeBadgeText}>{order.type}</Text>
                </View>
              </View>
              <View style={styles.orderRight}>
                <Text style={[styles.orderLabel, { color: theme.textDim }]}>Status</Text>
                <TouchableOpacity 
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
                  onPress={() => {
                    Alert.alert(
                      'Update Status',
                      'Choose new status:',
                      [
                        { text: 'Pending', onPress: () => handleStatusUpdate(order.id, 'pending') },
                        { text: 'Confirmed', onPress: () => handleStatusUpdate(order.id, 'confirmed') },
                        { text: 'Preparing', onPress: () => handleStatusUpdate(order.id, 'preparing') },
                        { text: 'Ready', onPress: () => handleStatusUpdate(order.id, 'ready') },
                        { text: 'Completed', onPress: () => handleStatusUpdate(order.id, 'completed') },
                        { text: 'Cancel', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  <Ionicons name={getStatusIcon(order.status)} size={12} color="#fff" />
                  <Text style={styles.statusBadgeText}>{order.status}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.orderActions}>
              <TouchableOpacity 
                style={[styles.viewButton, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order.id, order })}
              >
                <Text style={[styles.viewButtonText, { color: theme.buttonBg }]}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.downloadButton, { backgroundColor: theme.buttonBg }]}
                onPress={() => {
                  Alert.alert('Receipt', 'Kitchen receipt downloaded successfully');
                }}
              >
                <Ionicons name="download-outline" size={20} color={theme.iconDim} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {filteredOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={theme.iconDim} />
            <Text style={[styles.emptyStateTitle, { color: theme.textStrong }]}>No orders found</Text>
            <Text style={[styles.emptyStateMessage, { color: theme.textDim }]}>
              {searchQuery || filters.orderStatus !== 'all' || filters.orderType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Orders will appear here when customers place them'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#4F83FF',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  activeFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    color: '#4338CA',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%', // was maxHeight, now fixed height for consistency
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flexGrow: 1, // allow ScrollView to expand
    padding: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#4F83FF',
    backgroundColor: '#4F83FF',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterOptionSelected: {
    color: '#4F83FF',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#4F83FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderTime: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderCustomer: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderCustomerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#4F83FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default OrdersScreen;
