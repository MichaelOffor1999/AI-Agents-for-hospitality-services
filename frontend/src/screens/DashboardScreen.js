import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatGrowth, calculateGrowth, exportToCSV } from '../utils/helpers';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const themeRaw = useTheme();
  const fallbackTheme = {
    bg: '#f8f9fa',
    headerGlass: '#fff',
    border: '#e0e0e0',
    shadow: '#000',
    primary: '#4F83FF',
    textStrong: '#222',
    textDim: '#666',
    cardGlass: '#fff',
    buttonBg: '#fff',
    icon: '#4F83FF',
    iconDim: '#888',
    success: '#10B981',
    danger: '#EF4444',
    accent: '#F59E42',
    chartIconBg: '#f0f4ff',
    chartGradientFrom: '#f8f9fa',
    chartGradientTo: '#fff',
    primaryRGBA: (opacity = 1) => `rgba(79, 131, 255, ${opacity})`,
    textDimRGBA: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    tableHeaderBg: '#f0f0f0',
    tableRowBg: '#fff',
    tableRowAltBg: '#f8f9fa',
  };
  let theme = themeRaw && typeof themeRaw === 'object' ? themeRaw : fallbackTheme;
  if (!theme || typeof theme !== 'object') {
    console.warn('Theme is not an object, using fallbackTheme');
    theme = fallbackTheme;
  }
  // Debug: confirm render and theme
  console.log('DashboardScreen mounted! theme:', theme);
  
  const {
    dashboardStats,
    tenant,
    isLoading,
    loadDashboardStats,
    setFilters,
    filters,
    darkMode // get darkMode from context
  } = useApp();
  const navigation = useNavigation();
  
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState('line'); // 'line' or 'area'
  
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

  useEffect(() => {
    if (tenant) {
      loadDashboardStats({ dateRange: selectedDateRange });
    }
  }, [tenant, selectedDateRange]);

  const onRefresh = useCallback(async () => {
    if (!tenant) return;
    
    setRefreshing(true);
    try {
      await loadDashboardStats({ dateRange: selectedDateRange });
    } finally {
      setRefreshing(false);
    }
  }, [tenant, selectedDateRange, loadDashboardStats]);

  const handleExportData = async () => {
    try {
      const exportData = dashboardStats?.dailyTotals || mockStats.dailyTotals;
      if (!exportData || exportData.length === 0) {
        Alert.alert('No Data', 'No data available for export');
        return;
      }
      // Convert to CSV
      const header = Object.keys(exportData[0]).join(',');
      const rows = exportData.map(row => Object.values(row).join(','));
      const csv = [header, ...rows].join('\n');
      // Save to file
      const fileUri = FileSystem.cacheDirectory + 'daily-totals.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      // Share the file using expo-sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        Alert.alert('Export Success', 'Data exported and ready to share!');
      } else {
        Alert.alert('Export Failed', 'Sharing is not available on this device.');
      }
    } catch (error) {
      Alert.alert('Export Failed', error.message);
    }
  };

  // Mock data for when API is not available
  const mockStats = {
    todaysRevenue: 1250.50,
    ordersToday: 82,
    avgOrderValue: 15.25,
    missedCalls: 5,
    revenueGrowth: 5.2,
    ordersGrowth: 8.0,
    avgOrderGrowth: -1.5,
    missedCallsGrowth: 10,
    revenueByDay: [450, 680, 520, 480, 780, 320, 620, 890, 445, 667, 523, 789, 445, 1250],
    dailyTotals: [
      { date: 'Oct 26, 2023', orders: 22, gross: 450.50, refunds: 0, net: 450.50 },
      { date: 'Oct 25, 2023', orders: 18, gross: 380.20, refunds: 15, net: 365.20 },
      { date: 'Oct 24, 2023', orders: 25, gross: 512.80, refunds: 0, net: 512.80 },
      { date: 'Oct 23, 2023', orders: 20, gross: 410.00, refunds: 25.50, net: 384.50 },
      { date: 'Oct 22, 2023', orders: 30, gross: 620.00, refunds: 0, net: 620.00 },
    ],
  };

  const stats = dashboardStats || mockStats;
  
  // Generate realistic revenue data with proper labels
  const generateRevenueData = () => {
    const today = new Date();
    const data = [];
    const labels = [];
    const revenueData = stats.revenueByDay?.slice(-14) || 
      [420, 380, 650, 580, 720, 480, 820, 650, 890, 520, 760, 680, 920, 780];
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Format labels for different ranges
      const day = date.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      
      labels.push(`${day}`);
      data.push(revenueData[13-i] || Math.floor(Math.random() * 400) + 400);
    }
    
    return { labels, data };
  };

  const { labels: chartLabels, data: chartValues } = generateRevenueData();
  
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        strokeWidth: 4,
        color: (opacity = 1) => `rgba(79, 131, 255, ${opacity})`,
      },
    ],
  };

  // Enhanced chart configuration with gradients and animations
  const enhancedChartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#ffffff', 
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 131, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    strokeWidth: 4,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '7',
      strokeWidth: '3',
      stroke: '#4F83FF',
      fill: '#ffffff',
      fillOpacity: 1,
    },
    propsForBackgroundLines: {
      strokeDasharray: '5,5',
      stroke: '#e5e7eb',
      strokeWidth: 1,
      strokeOpacity: 0.5,
    },
    fillShadowGradient: '#4F83FF',
    fillShadowGradientOpacity: 0.15,
    propsForLabels: {
      fontSize: 11,
      fontWeight: '500',
    },
  };

  const dailyData = stats.dailyTotals || [];

  // Fallback UI for loading or missing data
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: theme.danger, fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            Dashboard Loading...
          </Text>
          <Text style={{ color: theme.textDim, fontSize: 16, marginBottom: 8 }}>
            If you see this for more than 10 seconds, check your API or context setup.
          </Text>
          <Ionicons name="analytics" size={48} color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}> 
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.headerBar, styles.glassEffect, { backgroundColor: theme.headerGlass, borderBottomColor: theme.border, marginBottom: 18, shadowColor: theme.shadow, shadowOpacity: 0.18, shadowRadius: 12, elevation: 8 }]}> 
          <Ionicons name="restaurant" size={28} color={theme.primary} style={{marginRight: 10}} />
          <Text style={[styles.brandTitle, { color: theme.primary }]}>My Restaurant Dashboard</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')} activeOpacity={0.8}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}> 
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="analytics" size={24} color={theme.primary} />
            <Text style={[styles.headerTitle, { color: theme.textStrong }]}>Dashboard</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: theme.buttonBg, borderColor: theme.border }, styles.touchable]}
              onPress={() => {
                // Toggle between date ranges
                const ranges = ['today', 'week', 'month'];
                const currentIndex = ranges.indexOf(selectedDateRange);
                const nextRange = ranges[(currentIndex + 1) % ranges.length];
                setSelectedDateRange(nextRange);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.icon} />
              <Text style={[styles.headerButtonText, { color: theme.textDim }]}>
                {selectedDateRange === 'today' ? 'Today' : 
                 selectedDateRange === 'week' ? 'Week' : 'Month'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: theme.buttonBg, borderColor: theme.border }, styles.touchable]}
              onPress={handleExportData}
              activeOpacity={0.85}
            >
              <Ionicons name="download-outline" size={20} color={theme.icon} />
              <Text style={[styles.headerButtonText, { color: theme.textDim }]}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.glassEffect, styles.accentCard, { backgroundColor: theme.cardGlass, borderLeftColor: theme.success }]}> 
              <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: theme.textDim }]}>Today's Revenue</Text>
                <Ionicons name="cash-outline" size={16} color={theme.icon} />
              </View>
              <Text style={[styles.statValue, { color: theme.textStrong }]}>{formatCurrency(stats.todaysRevenue)}</Text>
              <Text style={[styles.statChange, { color: theme.success }]}>{formatGrowth(stats.revenueGrowth)}</Text>
            </View>
            <View style={[styles.statCard, styles.glassEffect, { backgroundColor: theme.cardGlass }]}> 
              <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: theme.textDim }]}>Orders Today</Text>
                <Ionicons name="basket-outline" size={16} color={theme.icon} />
              </View>
              <Text style={[styles.statValue, { color: theme.textStrong }]}>{stats.ordersToday}</Text>
              <Text style={[styles.statChange, { color: theme.success }]}>{formatGrowth(stats.ordersGrowth)}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.glassEffect, { backgroundColor: theme.cardGlass }]}> 
              <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: theme.textDim }]}>Avg Order Value</Text>
                <Ionicons name="trending-up-outline" size={16} color={theme.icon} />
              </View>
              <Text style={[styles.statValue, { color: theme.textStrong }]}>{formatCurrency(stats.avgOrderValue)}</Text>
              <Text style={[styles.statChange, stats.avgOrderGrowth < 0 && styles.negative, { color: stats.avgOrderGrowth < 0 ? theme.danger : theme.success }]}>
                {formatGrowth(stats.avgOrderGrowth)}
              </Text>
            </View>
            <View style={[styles.statCard, styles.glassEffect, { backgroundColor: theme.cardGlass }]}> 
              <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: theme.textDim }]}>Missed Calls</Text>
                <Ionicons name="call-outline" size={16} color={theme.icon} />
              </View>
              <Text style={[styles.statValue, { color: theme.textStrong }]}>{stats.missedCalls}</Text>
              <Text style={[styles.statChange, { color: theme.success }]}>{formatGrowth(stats.missedCallsGrowth)}</Text>
            </View>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={[styles.chartContainer, styles.glassEffect, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}> 
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <View style={[styles.chartIconContainer, { backgroundColor: theme.chartIconBg }]}> 
                <Ionicons name="trending-up" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.chartTitle, { color: theme.textStrong }]}>Revenue Trend</Text>
                <Text style={[styles.chartPeriod, { color: theme.textDim }]}>Last 14 Days</Text>
              </View>
            </View>
            <View style={styles.chartControls}>
              <TouchableOpacity
                style={[styles.chartTypeButton, chartType === 'line' && styles.chartTypeButtonActive]}
                onPress={() => setChartType('line')}
                activeOpacity={0.8}
              >
                <View style={chartType === 'line' ? styles.selectedChartIcon : styles.unselectedChartIcon}>
                  <Ionicons
                    name="trending-up-outline"
                    size={22}
                    color={chartType === 'line' ? theme.primary : theme.iconDim}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chartTypeButton, chartType === 'area' && styles.chartTypeButtonActive]}
                onPress={() => setChartType('area')}
                activeOpacity={0.8}
              >
                <View style={chartType === 'area' ? styles.selectedChartIcon : styles.unselectedChartIcon}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={22}
                    color={chartType === 'area' ? theme.primary : theme.iconDim}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chartMetrics}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.textStrong }]}>
                {formatCurrency(chartValues.reduce((a, b) => a + b, 0))}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textDim }]}>Total Revenue</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.success }]}>+12.5%</Text>
              <Text style={[styles.metricLabel, { color: theme.textDim }]}>vs Previous</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.textStrong }]}> 
                {formatCurrency(Math.round(chartValues.reduce((a, b) => a + b, 0) / chartValues.length))}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textDim }]}>Daily Avg</Text>
            </View>
          </View>
          <View style={styles.chartWrapper}>
            {chartType === 'line' ? (
              <LineChart
                data={chartData}
                width={screenWidth - 88}
                height={240}
                chartConfig={{
                  ...enhancedChartConfig,
                  backgroundGradientFrom: theme.chartGradientFrom,
                  backgroundGradientTo: theme.chartGradientTo,
                  color: (opacity = 1) => theme.primaryRGBA(opacity),
                  labelColor: (opacity = 1) => theme.textDimRGBA(opacity),
                  fillShadowGradient: theme.primary,
                  fillShadowGradientOpacity: 0.15,
                  propsForBackgroundLines: {
                    strokeDasharray: '5,5',
                    stroke: theme.border,
                    strokeWidth: 1,
                    strokeOpacity: 0.5,
                  },
                  propsForLabels: {
                    fontSize: 11,
                    fontWeight: '500',
                  },
                }}
                bezier
                style={styles.chart}
                withDots={true}
                withShadow={true}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                segments={4}
                fromZero={false}
                yLabelsOffset={15}
                xLabelsOffset={-5}
                formatYLabel={(value) => `€${Math.round(value)}`}
                getDotColor={(dataPoint, dataPointIndex) => {
                  const maxValue = Math.max(...chartValues);
                  return dataPoint === maxValue ? theme.success : theme.primary;
                }}
                getDotProps={(dataPoint, index) => ({
                  r: dataPoint === Math.max(...chartValues) ? '8' : '6',
                  strokeWidth: '3',
                  stroke: dataPoint === Math.max(...chartValues) ? theme.success : theme.primary,
                  fill: theme.bg,
                })}
                onDataPointClick={(data) => {
                  Alert.alert(
                    'Revenue Details', 
                    `Day ${data.index + 1}: ${formatCurrency(data.value)}\nDate: ${chartLabels[data.index]}`,
                    [{ text: 'OK' }]
                  );
                }}
              />
            ) : (
              <BarChart
                data={chartData}
                width={screenWidth - 88}
                height={240}
                chartConfig={{
                  ...enhancedChartConfig,
                  backgroundGradientFrom: theme.chartGradientFrom,
                  backgroundGradientTo: theme.chartGradientTo,
                  fillShadowGradient: theme.primary,
                  fillShadowGradientOpacity: 0.35,
                  barPercentage: 0.55,
                  color: (opacity = 1) => theme.primaryRGBA(opacity),
                  labelColor: (opacity = 1) => theme.textDimRGBA(opacity),
                  propsForBackgroundLines: {
                    strokeDasharray: '4,4',
                    stroke: theme.border,
                    strokeWidth: 1,
                    strokeOpacity: 0.5,
                  },
                  propsForLabels: {
                    fontSize: 13,
                    fontWeight: '600',
                  },
                }}
                style={[styles.chart, styles.barChart]}
                fromZero={false}
                showValuesOnTopOfBars={true}
                segments={4}
                yLabelsOffset={15}
                xLabelsOffset={-5}
                formatYLabel={(value) => `€${Math.round(value)}`}
              />
            )}
          </View>
          {/* Chart Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.legendText, { color: theme.textDim }]}>Daily Revenue</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.legendText, { color: theme.textDim }]}>Peak Day</Text>
            </View>
          </View>
        </View>

        {/* Trend Insights */}
        <View style={styles.trendInsights}>
          <View style={[styles.insightCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}> 
            <View style={styles.insightHeader}>
              <Ionicons name="trending-up" size={16} color={theme.success} />
              <Text style={[styles.insightTitle, { color: theme.textDim }]}>Best Day</Text>
            </View>
            <Text style={[styles.insightValue, { color: theme.textStrong }]}> 
              Day {chartValues.indexOf(Math.max(...chartValues)) + 1}
            </Text>
            <Text style={[styles.insightSubtext, { color: theme.textDim }]}> 
              {formatCurrency(Math.max(...chartValues))}
            </Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}> 
            <View style={styles.insightHeader}>
              <Ionicons name="analytics" size={16} color={theme.primary} />
              <Text style={[styles.insightTitle, { color: theme.textDim }]}>Trend</Text>
            </View>
            <Text style={[styles.insightValue, { color: theme.textStrong }]}> 
              {chartValues[chartValues.length - 1] > chartValues[0] ? 'Rising' : 'Declining'}
            </Text>
            <Text style={[styles.insightSubtext, { color: theme.textDim }]}> 
              {Math.abs(((chartValues[chartValues.length - 1] - chartValues[0]) / chartValues[0]) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}> 
            <View style={styles.insightHeader}>
              <Ionicons name="pulse" size={16} color={theme.accent} />
              <Text style={[styles.insightTitle, { color: theme.textDim }]}>Volatility</Text>
            </View>
            <Text style={[styles.insightValue, { color: theme.textStrong }]}> 
              {(() => {
                const variance = chartValues.reduce((acc, val, idx) => {
                  if (idx === 0) return 0;
                  return acc + Math.abs(val - chartValues[idx - 1]);
                }, 0) / (chartValues.length - 1);
                return variance < 50 ? 'Low' : variance < 100 ? 'Medium' : 'High';
              })()}
            </Text>
            <Text style={[styles.insightSubtext, { color: theme.textDim }]}>Daily variance</Text>
          </View>
        </View>

        {/* Daily Totals */}
        <View style={[styles.dailyContainer, { backgroundColor: theme.cardGlass, borderColor: theme.border, shadowColor: theme.shadow, shadowOpacity: 0.12, shadowRadius: 8 }]}> 
          <Text style={[styles.dailyTitle, { color: theme.textStrong }]}>Daily Totals</Text>
          <View style={[styles.tableHeader, { backgroundColor: theme.tableHeaderBg, borderBottomColor: theme.border }]}> 
            <Text style={[styles.tableHeaderText, { flex: 0.7, color: theme.textDim }]}>#</Text>
            <Text style={[styles.tableHeaderText, { flex: 2, color: theme.textDim }]}>DATE</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.2, color: theme.textDim }]}>DAY</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, color: theme.textDim }]}>ORDERS</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, color: theme.textDim }]}>GROSS</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, color: theme.textDim }]}>REFUNDS</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, color: theme.textDim }]}>NET</Text>
          </View>
          {dailyData.map((item, index) => {
            let dayOfWeek = '-';
            try {
              const d = new Date(item.date);
              dayOfWeek = d.toLocaleDateString(undefined, { weekday: 'short' });
            } catch {}
            return (
              <View
                key={index}
                style={[styles.tableRow, {
                  backgroundColor: index % 2 === 0 ? theme.tableRowBg : theme.tableRowAltBg,
                  borderBottomColor: theme.border,
                  shadowColor: theme.shadow,
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  borderRadius: 8,
                  marginVertical: 2,
                }]}
              >
                <Text style={[styles.tableCellText, { flex: 0.7, color: theme.textStrong }]}>{index + 1}</Text>
                <Text style={[styles.tableCellText, { flex: 2, color: theme.textStrong }]}>{item.date}</Text>
                <Text style={[styles.tableCellText, { flex: 1.2, color: theme.textDim }]}>{dayOfWeek}</Text>
                <Text style={[styles.tableCellText, { flex: 1, color: theme.textStrong }]}>{item.orders}</Text>
                <Text style={[styles.tableCellText, { flex: 1, color: theme.textStrong }]}>{formatCurrency(item.gross)}</Text>
                <Text style={[styles.tableCellText, { flex: 1, color: item.refunds > 0 ? theme.danger : theme.textStrong, fontWeight: item.refunds > 0 ? '700' : '500' }]}> 
                  {item.refunds > 0 ? `-${formatCurrency(item.refunds)}` : formatCurrency(0)}
                </Text>
                <Text style={[styles.tableCellText, { flex: 1, color: theme.textStrong }]}>{formatCurrency(item.net)}</Text>
              </View>
            );
          })}
          {/* Totals Row */}
          <View style={[styles.tableRow, { backgroundColor: theme.tableHeaderBg, borderTopWidth: 2, borderTopColor: theme.primary, marginTop: 8 }]}> 
            <Text style={[styles.tableCellText, { flex: 0.7, color: theme.primary, fontWeight: 'bold' }]}> </Text>
            <Text style={[styles.tableCellText, { flex: 2, color: theme.primary, fontWeight: 'bold' }]}>TOTAL</Text>
            <Text style={[styles.tableCellText, { flex: 1.2, color: theme.primary, fontWeight: 'bold' }]}></Text>
            <Text style={[styles.tableCellText, { flex: 1, color: theme.primary, fontWeight: 'bold' }]}> 
              {dailyData.reduce((sum, item) => sum + (item.orders || 0), 0)}
            </Text>
            <Text style={[styles.tableCellText, { flex: 1, color: theme.primary, fontWeight: 'bold' }]}> 
              {formatCurrency(dailyData.reduce((sum, item) => sum + (item.gross || 0), 0))}
            </Text>
            <Text style={[styles.tableCellText, { flex: 1, color: theme.primary, fontWeight: 'bold' }]}> 
              -{formatCurrency(dailyData.reduce((sum, item) => sum + (item.refunds || 0), 0))}
            </Text>
            <Text style={[styles.tableCellText, { flex: 1, color: theme.primary, fontWeight: 'bold' }]}> 
              {formatCurrency(dailyData.reduce((sum, item) => sum + (item.net || 0), 0))}
            </Text>
          </View>
          {/* Averages Row */}
          <View style={[styles.tableRow, { backgroundColor: theme.tableRowAltBg }]}> 
            <Text style={[styles.tableCellText, { flex: 0.7, color: theme.textDim, fontWeight: '600' }]}></Text>
            <Text style={[styles.tableCellText, { flex: 2, color: theme.textDim, fontWeight: '600' }]}>AVG</Text>
            <Text style={[styles.tableCellText, { flex: 1.2, color: theme.textDim }]}></Text>
            <Text style={[styles.tableCellText, { flex: 1, color: theme.textDim }]}> 
              {dailyData.length ? (dailyData.reduce((sum, item) => sum + (item.orders || 0), 0) / dailyData.length).toFixed(1) : 0}
            </Text>
            <Text style={[styles.tableCellText, { flex: 1, color: theme.textDim }]}> 
              {dailyData.length ? formatCurrency(dailyData.reduce((sum, item) => sum + (item.gross || 0), 0) / dailyData.length) : formatCurrency(0)}
            </Text>
            <Text style={[styles.tableCellText, { flex: 1, color: theme.textDim }]}> 
              -{dailyData.length ? formatCurrency(dailyData.reduce((sum, item) => sum + (item.refunds || 0), 0) / dailyData.length) : formatCurrency(0)}
            </Text>
            <Text style={[styles.tableCellText, { flex: 1, color: theme.textDim }]}> 
              {dailyData.length ? formatCurrency(dailyData.reduce((sum, item) => sum + (item.net || 0), 0) / dailyData.length) : formatCurrency(0)}
            </Text>
          </View>
          {/* Highest/Lowest Net Day */}
          {dailyData.length > 0 && (() => {
            const maxNet = Math.max(...dailyData.map(item => item.net || 0));
            const minNet = Math.min(...dailyData.map(item => item.net || 0));
            const maxDay = dailyData.find(item => item.net === maxNet);
            const minDay = dailyData.find(item => item.net === minNet);
            return (
              <>
                <View style={[styles.tableRow, { backgroundColor: theme.tableHeaderBg }]}> 
                  <Text style={[styles.tableCellText, { flex: 0.7 }]}></Text>
                  <Text style={[styles.tableCellText, { flex: 2, color: theme.success, fontWeight: '600' }]}>HIGHEST</Text>
                  <Text style={[styles.tableCellText, { flex: 1.2 }]}></Text>
                  <Text style={[styles.tableCellText, { flex: 3, color: theme.success }]} numberOfLines={1}>
                    {maxDay?.date || '-'} ({formatCurrency(maxNet)})
                  </Text>
                </View>
                <View style={[styles.tableRow, { backgroundColor: theme.tableHeaderBg }]}> 
                  <Text style={[styles.tableCellText, { flex: 0.7 }]}></Text>
                  <Text style={[styles.tableCellText, { flex: 2, color: theme.danger, fontWeight: '600' }]}>LOWEST</Text>
                  <Text style={[styles.tableCellText, { flex: 1.2 }]}></Text>
                  <Text style={[styles.tableCellText, { flex: 3, color: theme.danger }]} numberOfLines={1}>
                    {minDay?.date || '-'} ({formatCurrency(minNet)})
                  </Text>
                </View>
              </>
            );
          })()}
          {/* Refunded Orders Percentage */}
          {dailyData.length > 0 && (
            <View style={[styles.tableRow, { backgroundColor: theme.tableRowAltBg }]}> 
              <Text style={[styles.tableCellText, { flex: 0.7 }]}></Text>
              <Text style={[styles.tableCellText, { flex: 2, color: theme.accent, fontWeight: '600' }]}>% REFUNDED</Text>
              <Text style={[styles.tableCellText, { flex: 1.2 }]}></Text>
              <Text style={[styles.tableCellText, { flex: 3, color: theme.accent }]}> 
                {(() => {
                  const totalOrders = dailyData.reduce((sum, item) => sum + (item.orders || 0), 0);
                  const refundedOrders = dailyData.reduce((sum, item) => sum + ((item.refunds || 0) > 0 ? 1 : 0), 0);
                  return totalOrders ? ((refundedOrders / totalOrders) * 100).toFixed(1) + '%' : '0%';
                })()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// NOTE: All theme usage must be inside the component function. The static styles object below should NOT reference theme at all.
// If you need to style with theme, do it inline in JSX as already done above.
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1, // color set inline
    marginBottom: 18,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1, // color set inline
  },
  touchable: {
    activeOpacity: 0.7,
  },
  headerButtonText: {
    marginLeft: 4,
    fontSize: 12,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  glassEffect: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1, // color set inline
  },
  accentCard: {
    borderLeftWidth: 6, // color set inline
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  negative: {},
  chartContainer: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1, // color set inline
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  chartPeriod: {
    fontSize: 13,
    fontWeight: '500',
  },
  chartOptionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartControls: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 2,
  },
  chartTypeButton: {
    marginHorizontal: 2,
  },
  chartTypeButtonActive: {},
  selectedChartIcon: {
    borderRadius: 50,
    padding: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  unselectedChartIcon: {
    borderRadius: 50,
    padding: 10,
  },
  chartMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 12,
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: -8,
  },
  chart: {
    borderRadius: 12,
  },
  barChart: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1, // color set inline
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendInsights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1, // color set inline
    marginBottom: 16,
  },
  insightCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1, // color set inline
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  insightSubtext: {
    fontSize: 11,
    fontWeight: '500',
  },
  dailyContainer: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1, // color set inline
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1, // color set inline
  },
  tableCellText: {
    fontSize: 12,
    textAlign: 'left',
  },
});

export default DashboardScreen;
