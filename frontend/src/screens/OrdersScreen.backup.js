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
      type: 'delivery',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '12343',
      customerName: 'Mike R.',
      customerPhone: '+353 87 456 1234',
      items: [{ name: 'Fish & Chips', quantity: 3, price: 9 }, { name: 'Guinness Pie', quantity: 2, price: 9.10 }],
      total: 45.20,
      type: 'takeaway',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
  ];

  const ordersData = orders.length > 0 ? orders : mockOrders;

  useEffect(() => {
    if (tenant) {
      loadOrders(filters);
    }
  }, [tenant, filters]);

  const debouncedSearch = debounce((query) => {
    setFilters({ ...filters, search: query });
  }, 500);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const onRefresh = async () => {
    if (!tenant) return;
    
    setRefreshing(true);
    try {
      await loadOrders(filters);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      Alert.alert('Success', 'Order status updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#10B981',
      preparing: '#3B82F6',
      ready: '#8B5CF6',
      completed: '#6B7280',
      cancelled: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const getTypeColor = (type) => {
    const colors = {
      takeaway: '#4F83FF',
      delivery: '#8B5CF6',
      'dine-in': '#10B981',
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
    <SafeAreaView style={styles.container}>
      {/* Header with Search and Filter */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="filter" size={20} color="#4F83FF" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
        
        {/* Compact Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Active Filter Indicators */}
        {(filters.orderStatus !== 'all' || filters.orderType !== 'all') && (
          <View style={styles.activeFilters}>
            {filters.orderStatus !== 'all' && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Status: {filters.orderStatus}</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, orderStatus: 'all' })}>
                  <Ionicons name="close" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            {filters.orderType !== 'all' && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Type: {filters.orderType}</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, orderType: 'all' })}>
                  <Ionicons name="close" size={14} color="#666" />
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
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Orders</Text>
              <TouchableOpacity 
                onPress={() => setFilterVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Order Status</Text>
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
                      <View style={[styles.radio, filters.orderStatus === status.value && styles.radioSelected]} />
                      <Text style={[styles.filterOptionText, filters.orderStatus === status.value && styles.filterOptionSelected]}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Type Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Order Type</Text>
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
                      <View style={[styles.radio, filters.orderType === type.value && styles.radioSelected]} />
                      <Text style={[styles.filterOptionText, filters.orderType === type.value && styles.filterOptionSelected]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => setFilters({ orderStatus: 'all', orderType: 'all' })}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
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
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderTime}>Time</Text>
                <Text style={styles.orderTimeValue}>{formatDate(order.createdAt, 'time')}</Text>
              </View>
              <View>
                <Text style={styles.orderCustomer}>Customer</Text>
                <Text style={styles.orderCustomerValue}>{order.customerName}</Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View>
                <Text style={styles.orderLabel}>Items</Text>
                <Text style={styles.orderValue}>{order.items?.length || 0} items</Text>
              </View>
              <View>
                <Text style={styles.orderLabel}>Total</Text>
                <Text style={styles.orderValue}>{formatCurrency(order.total)}</Text>
              </View>
            </View>

            <View style={styles.orderFooter}>
              <View>
                <Text style={styles.orderLabel}>Type</Text>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(order.type) }]}>
                  <Ionicons name={getOrderTypeIcon(order.type)} size={12} color="#fff" />
                  <Text style={styles.typeBadgeText}>{order.type}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.orderLabel}>Status</Text>
                <TouchableOpacity 
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
                  onPress={() => {
                    // Show status options
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
                style={styles.viewButton}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order.id, order })}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => {
                  Alert.alert('Receipt', 'Kitchen receipt downloaded successfully');
                }}
              >
                <Ionicons name="download-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    paddingVertical: 10,
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
    maxHeight: '80%',
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
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterOptions: {
    gap: 12,
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
    paddingTop: 10,
  },
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterDropdownText: {
    fontSize: 16,
    color: '#000',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#4F83FF',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
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
  orderTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderCustomer: {
    fontSize: 12,
    color: '#666',
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
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  orderLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#4F83FF',
    borderRadius: 8,
    paddingVertical: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
});

export default OrdersScreen;
