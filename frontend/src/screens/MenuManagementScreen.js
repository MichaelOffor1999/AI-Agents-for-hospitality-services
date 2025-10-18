import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { useTheme } from '../utils/theme';

const { width: screenWidth } = Dimensions.get('window');

const MenuManagementScreen = () => {
  const theme = useTheme();
  const { menuItems, tenant, loadMenuItems, updateMenuItem, isLoading } = useApp();
  
  const [refreshing, setRefreshing] = useState(false);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Main',
    description: '',
    available: true,
  });
  
  // Local state for mock menu items to allow toggle functionality
  const [localMenuItems, setLocalMenuItems] = useState([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  
  // Animation values
  const slideAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  // Enhanced mock menu items with more details
  const mockMenuItems = [
    {
      id: 1,
      name: 'Truffle Risotto',
      price: 28.50,
      category: 'Main',
      description: 'Creamy arborio rice with black truffle and parmesan',
      available: true,
      image: '🍚',
      prepTime: '25 min',
      isPopular: true,
      dietary: ['vegetarian'],
    },
    {
      id: 2,
      name: 'Grilled Salmon',
      price: 32.00,
      category: 'Main',
      description: 'Atlantic salmon with lemon herb butter and seasonal vegetables',
      available: true,
      image: '🐟',
      prepTime: '20 min',
      isPopular: false,
      dietary: ['gluten-free'],
    },
    {
      id: 3,
      name: 'Wagyu Beef Steak',
      price: 65.00,
      category: 'Main',
      description: 'Premium wagyu beef with garlic mashed potatoes',
      available: true,
      image: '🥩',
      prepTime: '30 min',
      isPopular: true,
      dietary: ['gluten-free'],
    },
    {
      id: 4,
      name: 'Lobster Bisque',
      price: 18.50,
      category: 'Appetizers',
      description: 'Rich and creamy lobster soup with cognac',
      available: true,
      image: '🦞',
      prepTime: '15 min',
      isPopular: false,
      dietary: ['gluten-free'],
    },
    {
      id: 5,
      name: 'Burrata Salad',
      price: 22.00,
      category: 'Appetizers',
      description: 'Fresh burrata with heirloom tomatoes and basil',
      available: true,
      image: '🥗',
      prepTime: '10 min',
      isPopular: true,
      dietary: ['vegetarian'],
    },
    {
      id: 6,
      name: 'Chocolate Soufflé',
      price: 16.00,
      category: 'Desserts',
      description: 'Warm chocolate soufflé with vanilla ice cream',
      available: false,
      image: '🍫',
      prepTime: '35 min',
      isPopular: true,
      dietary: ['vegetarian'],
    },
    {
      id: 7,
      name: 'Craft Cocktail',
      price: 15.00,
      category: 'Drinks',
      description: 'House special with premium spirits',
      available: true,
      image: '🍸',
      prepTime: '5 min',
      isPopular: false,
      dietary: [],
    },
    {
      id: 8,
      name: 'Artisan Pizza',
      price: 24.00,
      category: 'Specials',
      description: 'Wood-fired pizza with seasonal toppings',
      available: true,
      image: '🍕',
      prepTime: '18 min',
      isPopular: true,
      dietary: ['vegetarian'],
    },
  ];

  // Initialize local menu items with mock data
  useEffect(() => {
    if (menuItems.length === 0 && localMenuItems.length === 0) {
      setLocalMenuItems(mockMenuItems);
    } else if (menuItems.length > 0) {
      setLocalMenuItems(menuItems);
    }
  }, [menuItems]);

  const menuData = localMenuItems;

  useEffect(() => {
    if (tenant) {
      loadMenuItems();
    }
  }, [tenant]);

  const onRefresh = async () => {
    if (!tenant) return;
    
    setRefreshing(true);
    try {
      await loadMenuItems();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleAvailability = (itemId) => {
    console.log('=== TOGGLE START ===');
    console.log('Item ID:', itemId);
    console.log('Current localMenuItems:', localMenuItems.length);
    
    // Find the current item
    const currentItem = localMenuItems.find(item => item.id === itemId);
    console.log('Found item:', currentItem);
    
    if (!currentItem) {
      console.log('ERROR: Item not found with ID:', itemId);
      Alert.alert('Error', 'Menu item not found');
      return;
    }
    
    const newAvailability = !currentItem.available;
    console.log(`Toggling from ${currentItem.available} to ${newAvailability}`);
    
    // Update local state immediately
    setLocalMenuItems(prevItems => {
      console.log('Previous items count:', prevItems.length);
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, available: newAvailability };
          console.log('Updated item:', updatedItem);
          return updatedItem;
        }
        return item;
      });
      console.log('New items count:', updatedItems.length);
      console.log('=== TOGGLE END ===');
      return updatedItems;
    });

    // Force re-render by updating counter
    setUpdateCounter(prev => prev + 1);

    // Show feedback to user
    const itemName = currentItem.name;
    const message = newAvailability ? 
      `${itemName} is now available` : 
      `${itemName} is now unavailable`;
    
    // You could add a toast here instead of alert for better UX
    console.log(message);
  };

  const handleSaveItem = async () => {
    if (!newItem.name.trim() || !newItem.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // In a real app, you would call createMenuItem API
      Alert.alert('Success', 'Menu item saved successfully');
      setAddItemModalVisible(false);
      setNewItem({ name: '', price: '', category: 'Main', description: '', available: true });
    } catch (error) {
      Alert.alert('Error', 'Failed to save menu item');
    }
  };

  const categories = ['All', 'Main', 'Appetizers', 'Desserts', 'Drinks', 'Specials'];

  // Filter menu items based on search and category
  const filteredMenuData = menuData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Debug logging
  console.log('MenuData length:', menuData.length);
  console.log('FilteredMenuData length:', filteredMenuData.length);
  if (filteredMenuData.length > 0) {
    console.log('First item availability:', filteredMenuData[0].available);
  }

  // Group items by category for display
  const groupedItems = categories.slice(1).reduce((acc, category) => {
    acc[category] = filteredMenuData.filter(item => item.category === category);
    return acc;
  }, {});

  const animateAddButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderMenuItem = ({ item }) => (
    <Animated.View style={[styles.menuItemCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.menuItemContentWrapper}>
        <TouchableOpacity
          style={styles.menuItemContent}
          onPress={() => setEditingItem(item)}
          activeOpacity={0.95}
        >
          {/* Item Header */}
          <View style={styles.itemHeader}>
            <View style={[styles.itemImageContainer, { backgroundColor: theme.chartIconBg }]}> {/* Use theme.chartIconBg */}
              <Text style={styles.itemEmoji}>{item.image}</Text>
              {item.isPopular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="flame" size={12} color="#FF6B35" />
                </View>
              )}
            </View>
            
            <View style={styles.itemInfo}>
              <View style={styles.itemTitleRow}>
                <Text style={[styles.itemName, { color: theme.textStrong }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: theme.success }]}>{formatCurrency(item.price)}</Text>
              </View>
              
              <Text style={[styles.itemDescription, { color: theme.textDim }]} numberOfLines={2}>
                {item.description}
              </Text>
              
              <View style={styles.itemMeta}>
                <View style={[styles.metaBadge, { backgroundColor: theme.bg }]}> {/* Use theme.bg */}
                  <Ionicons name="time-outline" size={12} color={theme.textDim} />
                  <Text style={[styles.metaText, { color: theme.textDim }]}>{item.prepTime}</Text>
                </View>
                
                {item.dietary.length > 0 && (
                  <View style={[styles.metaBadge, { backgroundColor: theme.bg }]}> {/* Use theme.bg */}
                    <Ionicons name="leaf-outline" size={12} color={theme.success} />
                    <Text style={[styles.metaText, { color: theme.success }]}>
                      {item.dietary[0]}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Item Controls (edit + toggle) - ONLY ONCE! */}
          <View style={styles.itemControls}>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: theme.chartIconBg }]}
              onPress={(e) => {
                e.stopPropagation();
                setEditingItem(item);
                setAddItemModalVisible(true);
              }}
            >
              <Ionicons name="create-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.availabilityToggle, 
                item.available ? styles.toggleActive : styles.toggleInactive
              ]}
              onPress={(e) => {
                e.stopPropagation();
                toggleAvailability(item.id);
              }}
              activeOpacity={0.8}
            >
              <View style={[
                styles.toggleIndicator, 
                { 
                  backgroundColor: theme.buttonBg, shadowColor: theme.primary },
                  { 
                    transform: [{ 
                      translateX: item.available ? 26 : 2 
                    }] 
                  }
              ]}>
                <Ionicons 
                  name={item.available ? "checkmark" : "close"} 
                  size={12} 
                  color={item.available ? theme.success : theme.danger} 
                />
              </View>
              
              {/* Toggle Track Labels */}
              <View style={styles.toggleTrack}>
                <Text style={[styles.toggleLabel, styles.toggleLabelLeft, { color: theme.textDim }]}>OFF</Text>
                <Text style={[styles.toggleLabel, styles.toggleLabelRight, { color: theme.success }]}>ON</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        {/* Overlay only covers content, not controls */}
        {!item.available && (
          <View style={[styles.unavailableOverlay, { backgroundColor: theme.bg, borderColor: theme.border }]} pointerEvents="none">
            <Text style={[styles.unavailableText, { color: theme.textDim }]}>Currently Unavailable</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> {/* Use theme.bg */}
      {/* Enhanced Header */}
      <LinearGradient
        colors={[theme.primary, theme.accent]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconContainer, { backgroundColor: theme.buttonBg }]}> {/* Use theme.buttonBg */}
                <Ionicons name="restaurant" size={24} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: theme.textStrong }]}>Menu Management</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textDim }]}>
                  {filteredMenuData.length} items • {filteredMenuData.filter(i => i.available).length} available
                </Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              {/* Removed view toggle button with Ionicons list/grid icon */}
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: theme.buttonBg }]}> {/* Use theme.buttonBg */}
              <Ionicons name="search" size={20} color={theme.textDim} />
              <TextInput
                style={[styles.searchInput, { color: theme.textStrong }]}
                placeholder="Search menu items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.textDim}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={theme.iconDim} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScrollView}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((category, idx) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  { backgroundColor: selectedCategory === category ? theme.buttonBg : 'transparent', borderColor: theme.border },
                  selectedCategory === category && { backgroundColor: theme.primary },
                  idx === 0 && styles.categoryButtonFirst,
                  idx === categories.length - 1 && styles.categoryButtonLast
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  { color: selectedCategory === category ? '#fff' : theme.textDim },
                  selectedCategory === category && { color: '#fff' }
                ]}>
                  {category}
                  {category !== 'All' && ` (${groupedItems[category]?.length || 0})`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <FlatList
        data={filteredMenuData}
        renderItem={renderMenuItem}
        keyExtractor={(item) => `${item.id}-${item.available}`}
        extraData={[localMenuItems, updateCounter]}
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        numColumns={viewMode === 'grid' ? 1 : 1}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant" size={64} color={theme.iconDim} />
            <Text style={[styles.emptyStateTitle, { color: theme.textDim }]}>No items found</Text>
            <Text style={[styles.emptyStateText, { color: theme.textDim }]}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first menu item'}
            </Text>
          </View>
        )}
      />

      {/* Floating Add Button */}
      <Animated.View style={[styles.floatingButton, { transform: [{ scale: scaleAnim }] }]}> {/* unchanged */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            animateAddButton();
            setEditingItem(null);
            setAddItemModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.success, theme.primary]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Enhanced Add/Edit Item Modal */}
      <Modal
        visible={addItemModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddItemModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.bg }]}> {/* Use theme.bg */}
          {/* Modal Header */}
          <LinearGradient
            colors={[theme.primary, theme.accent]}
            style={styles.modalHeaderGradient}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={[styles.modalCloseButton, { backgroundColor: theme.buttonBg }]}
                onPress={() => setAddItemModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={theme.primary} />
              </TouchableOpacity>
              <View style={styles.modalTitleContainer}>
                <Text style={[styles.modalTitle, { color: theme.textStrong }]}>
                  {editingItem ? 'Edit Menu Item' : 'Add New Item'}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textDim }]}>
                  {editingItem ? 'Update item details' : 'Create a delicious new dish'}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.modalSaveButton, { backgroundColor: theme.success }]}
                onPress={handleSaveItem}
              >
                <Text style={[styles.modalSaveText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Item Image/Emoji Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textStrong }]}>Item Icon</Text>
              <View style={styles.emojiSelector}>
                {['🍚', '🐟', '🥩', '🦞', '🥗', '🍫', '🍸', '🍕'].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      newItem.image === emoji && { borderColor: theme.primary, backgroundColor: theme.cardGlass }
                    ]}
                    onPress={() => setNewItem({ ...newItem, image: emoji })}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Item Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textStrong }]}>Item Name *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.buttonBg, borderColor: theme.border }]}> {/* Use theme.buttonBg */}
                <Ionicons name="restaurant-outline" size={20} color={theme.textDim} />
                <TextInput
                  style={[styles.textInput, { color: theme.textStrong }]}
                  value={newItem.name}
                  onChangeText={(text) => setNewItem({ ...newItem, name: text })}
                  placeholder="Enter item name"
                  placeholderTextColor={theme.textDim}
                />
              </View>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textStrong }]}>Price *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.buttonBg, borderColor: theme.border }]}> {/* Use theme.buttonBg */}
                <Text style={[styles.currencySymbol, { color: theme.success }]}>€</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.textStrong }]}
                  value={newItem.price}
                  onChangeText={(text) => setNewItem({ ...newItem, price: text })}
                  placeholder="0.00"
                  placeholderTextColor={theme.textDim}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textStrong }]}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScrollContainer}
              >
                <View style={styles.categorySelector}>
                  {categories.slice(1).map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        newItem.category === category && { backgroundColor: theme.primary, borderColor: theme.primary }
                      ]}
                      onPress={() => setNewItem({ ...newItem, category })}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        newItem.category === category && { color: '#fff' }
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textStrong }]}>Description</Text>
              <View style={[styles.textAreaWrapper, { backgroundColor: theme.buttonBg, borderColor: theme.border }]}> {/* Use theme.buttonBg */}
                <TextInput
                  style={[styles.textAreaInput, { color: theme.textStrong }]}
                  value={newItem.description}
                  onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                  placeholder="Describe this delicious item..."
                  placeholderTextColor={theme.textDim}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Preparation Time */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textStrong }]}>Prep Time</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.buttonBg, borderColor: theme.border }]}> {/* Use theme.buttonBg */}
                <Ionicons name="time-outline" size={20} color={theme.textDim} />
                <TextInput
                  style={[styles.textInput, { color: theme.textStrong }]}
                  value={newItem.prepTime || ''}
                  onChangeText={(text) => setNewItem({ ...newItem, prepTime: text })}
                  placeholder="e.g., 15 min"
                  placeholderTextColor={theme.textDim}
                />
              </View>
            </View>

            {/* Dietary Options */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textStrong }]}>Dietary Information</Text>
              <View style={styles.dietaryOptions}>
                {['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].map((diet) => (
                  <TouchableOpacity
                    key={diet}
                    style={[
                      styles.dietaryChip,
                      newItem.dietary?.includes(diet) && { backgroundColor: theme.success, borderColor: theme.success }
                    ]}
                    onPress={() => {
                      const dietary = newItem.dietary || [];
                      const updatedDietary = dietary.includes(diet)
                        ? dietary.filter(d => d !== diet)
                        : [...dietary, diet];
                      setNewItem({ ...newItem, dietary: updatedDietary });
                    }}
                  >
                    <Ionicons 
                      name="leaf-outline" 
                      size={16} 
                      color={newItem.dietary?.includes(diet) ? '#fff' : theme.textDim} 
                    />
                    <Text style={[
                      styles.dietaryChipText,
                      newItem.dietary?.includes(diet) && { color: '#fff' }
                    ]}>
                      {diet}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Popular Item Toggle */}
            <View style={styles.inputGroup}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={[styles.inputLabel, { color: theme.textStrong }]}>Mark as Popular</Text>
                  <Text style={[styles.toggleDescription, { color: theme.textDim }]}>Show flame icon and highlight this item</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.popularToggle,
                    newItem.isPopular && { backgroundColor: theme.accent }
                  ]}
                  onPress={() => setNewItem({ ...newItem, isPopular: !newItem.isPopular })}
                >
                  <Animated.View style={[
                    styles.popularToggleIndicator,
                    { transform: [{ translateX: newItem.isPopular ? 20 : 0 }] }
                  ]}>
                    <Ionicons 
                      name={newItem.isPopular ? "flame" : "flame-outline"} 
                      size={16} 
                      color={newItem.isPopular ? theme.primary : theme.textDim} 
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f8f9ff',
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
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    // color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    // color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    // backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    // color: '#333',
    marginLeft: 12,
    marginRight: 8,
  },

  // Category Filter Styles
  categoryScrollView: {
    maxHeight: 72, // increased for more space
    minHeight: 56, // ensure enough height
    marginTop: 8,
    marginBottom: 8,
    paddingTop: 8,
    paddingBottom: 8, // add bottom padding
  },
  categoryContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: 48, // ensure enough height for touch
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10, // slightly increased
    borderRadius: 22,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
    borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 80, // ensure button is not too small
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonFirst: {
    marginLeft: 8, // extra space at start
  },
  categoryButtonLast: {
    marginRight: 20, // extra space at end
  },
  categoryButtonActive: {
    // backgroundColor: '#fff',
    // borderColor: '#fff',
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    // color: 'rgba(255, 255, 255, 0.92)',
  },
  categoryButtonTextActive: {
    // color: '#4F83FF',
  },

  // Menu List Styles
  menuList: {
    padding: 20,
    paddingTop: 40,
  },
  itemSeparator: {
    height: 16,
  },

  // Enhanced Menu Item Card
  menuItemCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    // borderColor, backgroundColor, shadowColor must be set inline using theme
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
    ...(Platform.OS !== 'android' ? { backdropFilter: 'blur(8px)' } : {}),
  },
  menuItemContent: {
    padding: 20,
  },
  menuItemContentWrapper: {
    position: 'relative',
  },
  itemHeader: {
    marginBottom: 16,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  itemEmoji: {
    fontSize: 28,
  },
  popularBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    // backgroundColor, borderColor must be set inline using theme
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    // color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    // color: '#10B981',
  },
  itemDescription: {
    fontSize: 14,
    // color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  metaText: {
    fontSize: 12,
    // color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },

  // Item Controls
  itemControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    // borderTopColor: '#f0f0f0',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor must be set inline using theme
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityToggle: {
    width: 56,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  toggleActive: {
    // backgroundColor: '#10B981',
  },
  toggleInactive: {
    // backgroundColor: '#E5E7EB',
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    // backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    position: 'absolute',
    zIndex: 2,
  },
  toggleTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    zIndex: 1,
  },
  toggleLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleLabelLeft: {
    // color: '#9CA3AF',
  },
  toggleLabelRight: {
    // color: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Unavailable Overlay
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // covers only content, not controls
    // backgroundColor, borderColor must be set inline using theme
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderRadius: 20,
    borderWidth: 1,
    ...(Platform.OS !== 'android' ? { backdropFilter: 'blur(2px)' } : {}),
  },
  unavailableText: {
    // color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    // backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 8,
  },

  // Floating Add Button
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    // shadowColor must be set inline using theme
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    // color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    // color: '#999',
    textAlign: 'center',
  },

  // Modal and Form Styles
  modalContainer: {
    flex: 1,
    // backgroundColor: '#f8f9ff',
  },
  modalHeaderGradient: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    // color: '#fff',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    // color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  modalSaveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    // color: '#fff',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  
  // Form Input Styles
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    // color: '#333',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor must be set inline using theme
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    // borderColor must be set inline using theme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    // color: '#333',
    marginLeft: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    // color: '#10B981',
  },
  textAreaWrapper: {
    // backgroundColor must be set inline using theme
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    // borderColor must be set inline using theme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textAreaInput: {
    fontSize: 16,
    // color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
  },

  // Emoji Selector
  emojiSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emojiOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // backgroundColor, borderColor must be set inline using theme
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  emojiOptionSelected: {
    // borderColor: '#4F83FF',
    // backgroundColor: '#f0f4ff',
  },
  emojiText: {
    fontSize: 24,
  },

  // Category Chips
  categoryScrollContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categorySelector: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    // backgroundColor, borderColor must be set inline using theme
    marginRight: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipSelected: {
    // backgroundColor: '#4F83FF',
    // borderColor: '#4F83FF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    // color: '#666',
  },
  categoryChipTextSelected: {
    // color: '#fff',
  },

  // Dietary Options
  dietaryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    // backgroundColor, borderColor must be set inline using theme
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  dietaryChipSelected: {
    // backgroundColor: '#f0fdf4',
    // borderColor: '#10B981',
  },
  dietaryChipText: {
    fontSize: 14,
    fontWeight: '500',
    // color: '#666',
    marginLeft: 6,
  },
  dietaryChipTextSelected: {
    // color: '#10B981',
  },

  // Popular Toggle
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleDescription: {
    fontSize: 14,
    // color: '#666',
    marginTop: 4,
  },
  popularToggle: {
    width: 60,
    height: 32,
    borderRadius: 16,
    // backgroundColor must be set inline using theme
    padding: 2,
    justifyContent: 'center',
  },
  popularToggleActive: {
    // backgroundColor: '#FFF4E6',
  },
  popularToggleIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor must be set inline using theme
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  // Legacy modal styles (keep existing ones that might still be referenced)
  cancelButton: {
    fontSize: 16,
    // color: '#6B7280',
  },
  categoryOption: {
    // backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    // borderColor: '#E5E7EB',
  },
  selectedCategory: {
    // backgroundColor: '#EBF4FF',
    // borderColor: '#4F83FF',
  },
  categoryText: {
    fontSize: 14,
    // color: '#374151',
  },
  selectedCategoryText: {
    // color: '#4F83FF',
    fontWeight: '500',
  },
});

export default MenuManagementScreen;
