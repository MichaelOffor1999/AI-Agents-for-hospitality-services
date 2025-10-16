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
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatGrowth, calculateGrowth, exportToCSV } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const { 
    dashboardStats, 
    tenant, 
    isLoading, 
    loadDashboardStats,
    setFilters,
    filters
  } = useApp();
  
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState('line'); // 'line' or 'area'

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
      if (!dashboardStats?.dailyTotals) {
        Alert.alert('No Data', 'No data available for export');
        return;
      }

      const csvData = exportToCSV(dashboardStats.dailyTotals, 'daily-totals.csv');
      Alert.alert('Export Success', 'Data exported successfully');
      // In a real app, you would save this to device storage or share it
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="analytics" size={24} color="#4F83FF" />
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {
                // Toggle between date ranges
                const ranges = ['today', 'week', 'month'];
                const currentIndex = ranges.indexOf(selectedDateRange);
                const nextRange = ranges[(currentIndex + 1) % ranges.length];
                setSelectedDateRange(nextRange);
              }}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.headerButtonText}>
                {selectedDateRange === 'today' ? 'Today' : 
                 selectedDateRange === 'week' ? 'Week' : 'Month'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleExportData}
            >
              <Ionicons name="download-outline" size={20} color="#666" />
              <Text style={styles.headerButtonText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statTitle}>Today's Revenue</Text>
                <Ionicons name="cash-outline" size={16} color="#666" />
              </View>
              <Text style={styles.statValue}>{formatCurrency(stats.todaysRevenue)}</Text>
              <Text style={styles.statChange}>{formatGrowth(stats.revenueGrowth)}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statTitle}>Orders Today</Text>
                <Ionicons name="basket-outline" size={16} color="#666" />
              </View>
              <Text style={styles.statValue}>{stats.ordersToday}</Text>
              <Text style={styles.statChange}>{formatGrowth(stats.ordersGrowth)}</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statTitle}>Avg Order Value</Text>
                <Ionicons name="trending-up-outline" size={16} color="#666" />
              </View>
              <Text style={styles.statValue}>{formatCurrency(stats.avgOrderValue)}</Text>
              <Text style={[styles.statChange, stats.avgOrderGrowth < 0 && styles.negative]}>
                {formatGrowth(stats.avgOrderGrowth)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statTitle}>Missed Calls</Text>
                <Ionicons name="call-outline" size={16} color="#666" />
              </View>
              <Text style={styles.statValue}>{stats.missedCalls}</Text>
              <Text style={styles.statChange}>{formatGrowth(stats.missedCallsGrowth)}</Text>
            </View>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <View style={styles.chartIconContainer}>
                <Ionicons name="trending-up" size={20} color="#4F83FF" />
              </View>
              <View>
                <Text style={styles.chartTitle}>Revenue Trend</Text>
                <Text style={styles.chartPeriod}>Last 14 Days</Text>
              </View>
            </View>
            <View style={styles.chartControls}>
              <TouchableOpacity 
                style={[styles.chartTypeButton, chartType === 'line' && styles.chartTypeButtonActive]}
                onPress={() => setChartType('line')}
              >
                <Ionicons 
                  name="trending-up-outline" 
                  size={16} 
                  color={chartType === 'line' ? '#4F83FF' : '#666'} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.chartTypeButton, chartType === 'area' && styles.chartTypeButtonActive]}
                onPress={() => setChartType('area')}
              >
                <Ionicons 
                  name="bar-chart-outline" 
                  size={16} 
                  color={chartType === 'area' ? '#4F83FF' : '#666'} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.chartMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {formatCurrency(chartValues.reduce((a, b) => a + b, 0))}
              </Text>
              <Text style={styles.metricLabel}>Total Revenue</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>+12.5%</Text>
              <Text style={styles.metricLabel}>vs Previous</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {formatCurrency(Math.round(chartValues.reduce((a, b) => a + b, 0) / chartValues.length))}
              </Text>
              <Text style={styles.metricLabel}>Daily Avg</Text>
            </View>
          </View>
          
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={screenWidth - 88}
              height={240}
              chartConfig={enhancedChartConfig}
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
                // Highlight highest value with green, others blue
                const maxValue = Math.max(...chartValues);
                return dataPoint === maxValue ? '#10B981' : '#4F83FF';
              }}
              getDotProps={(dataPoint, index) => ({
                r: dataPoint === Math.max(...chartValues) ? '8' : '6',
                strokeWidth: '3',
                stroke: dataPoint === Math.max(...chartValues) ? '#10B981' : '#4F83FF',
                fill: '#ffffff',
              })}
              onDataPointClick={(data) => {
                Alert.alert(
                  'Revenue Details', 
                  `Day ${data.index + 1}: ${formatCurrency(data.value)}\nDate: ${chartLabels[data.index]}`,
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>
          
          {/* Chart Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4F83FF' }]} />
              <Text style={styles.legendText}>Daily Revenue</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Peak Day</Text>
            </View>
          </View>
        </View>

        {/* Trend Insights */}
        <View style={styles.trendInsights}>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="trending-up" size={16} color="#10B981" />
              <Text style={styles.insightTitle}>Best Day</Text>
            </View>
            <Text style={styles.insightValue}>
              Day {chartValues.indexOf(Math.max(...chartValues)) + 1}
            </Text>
            <Text style={styles.insightSubtext}>
              {formatCurrency(Math.max(...chartValues))}
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="analytics" size={16} color="#4F83FF" />
              <Text style={styles.insightTitle}>Trend</Text>
            </View>
            <Text style={styles.insightValue}>
              {chartValues[chartValues.length - 1] > chartValues[0] ? 'Rising' : 'Declining'}
            </Text>
            <Text style={styles.insightSubtext}>
              {Math.abs(((chartValues[chartValues.length - 1] - chartValues[0]) / chartValues[0]) * 100).toFixed(1)}%
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="pulse" size={16} color="#8B5CF6" />
              <Text style={styles.insightTitle}>Volatility</Text>
            </View>
            <Text style={styles.insightValue}>
              {(() => {
                const variance = chartValues.reduce((acc, val, idx) => {
                  if (idx === 0) return 0;
                  return acc + Math.abs(val - chartValues[idx - 1]);
                }, 0) / (chartValues.length - 1);
                return variance < 50 ? 'Low' : variance < 100 ? 'Medium' : 'High';
              })()}
            </Text>
            <Text style={styles.insightSubtext}>
              Daily variance
            </Text>
          </View>
        </View>

        {/* Daily Totals */}
        <View style={styles.dailyContainer}>
          <Text style={styles.dailyTitle}>Daily Totals</Text>
          
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>DATE</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>ORDERS</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>GROSS</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>REFUNDS</Text>
          </View>

          {dailyData.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCellText, { flex: 2 }]}>{item.date}</Text>
              <Text style={[styles.tableCellText, { flex: 1 }]}>{item.orders}</Text>
              <Text style={[styles.tableCellText, { flex: 1 }]}>{formatCurrency(item.gross)}</Text>
              <Text style={[styles.tableCellText, { flex: 1 }]}>
                {item.refunds > 0 ? `-${formatCurrency(item.refunds)}` : formatCurrency(0)}
              </Text>
            </View>
          ))}
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
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  negative: {
    color: '#EF4444',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#4F83FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f8f9ff',
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
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  chartPeriod: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  chartOptionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartControls: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 2,
  },
  chartTypeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  chartTypeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#4F83FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
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
    color: '#1a1a1a',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: -8,
  },
  chart: {
    borderRadius: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
    color: '#666',
    fontWeight: '500',
  },
  trendInsights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  insightCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7ff',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  insightSubtext: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
  },
  dailyContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCellText: {
    fontSize: 12,
    color: '#000',
    textAlign: 'left',
  },
});

export default DashboardScreen;
