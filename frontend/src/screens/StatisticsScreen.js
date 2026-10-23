import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getExpenses } from '../utils/api';
import { 
  calculateThisMonthTotal, 
  getHighestSpendingCategory, 
  calculateAverageDailySpending,
  getExpensesByCategory 
} from '../utils/calculations';
import { getCategoryByName } from '../constants/categories';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const screenWidth = Dimensions.get('window').width;

const StatisticsScreen = () => {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [highestCategory, setHighestCategory] = useState('');
  const [avgDaily, setAvgDaily] = useState(0);
  const [categoryData, setCategoryData] = useState([]);

  const loadData = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
      setThisMonthTotal(calculateThisMonthTotal(data));
      setHighestCategory(getHighestSpendingCategory(data));
      setAvgDaily(calculateAverageDailySpending(data));

      const byCategory = getExpensesByCategory(data);
      const pieData = byCategory.map((item) => {
        const catConfig = getCategoryByName(item.category);
          
        return {
          name: item.category,
          originalName: item.category,
          population: item.total,
          color: catConfig.color,
          legendFontColor: colors.textSecondary,
          legendFontSize: 11,
        };
      });
      setCategoryData(pieData);
    } catch (error) {
      console.error(error);
      if (error.message === 'UNAUTHORIZED') {
        logout();
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [colors.textSecondary])
  );

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => colors.textSecondary,
  };

  // Group by last 6 months for Bar Chart
  const getMonthlyData = () => {
    const data = [0, 0, 0, 0, 0, 0];
    const labels = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
      
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear();
      });
      
      data[5 - i] = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    }
    
    return {
      labels,
      datasets: [{ data: data.length > 0 ? data : [0,0,0,0,0,0] }]
    };
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Overview</Text>

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Month</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>₹{thisMonthTotal.toFixed(2)}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Transactions</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{expenses.length}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Daily</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>₹{avgDaily.toFixed(2)}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highest Category</Text>
          <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>{highestCategory}</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending by Category</Text>
      <View style={[styles.chartContainer, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        {categoryData.length > 0 ? (
          <View style={{ alignItems: 'center', width: '100%' }}>
            <PieChart
              data={categoryData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft={screenWidth / 4 - 20}
              hasLegend={false}
              absolute
            />
            <View style={styles.customLegendContainer}>
              {categoryData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                  <View style={styles.legendTextContainer}>
                    <Text style={[styles.legendName, { color: colors.textSecondary }]}>
                      {item.originalName}
                    </Text>
                    <Text style={[styles.legendValue, { color: colors.text }]}>
                      ₹{item.population.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={[styles.noDataText, { color: colors.textSecondary }]}>No data for categories</Text>
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Trend</Text>
      <View style={[styles.chartContainer, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <BarChart
          data={getMonthlyData()}
          width={screenWidth - 70}
          height={220}
          yAxisLabel="₹"
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero
          style={styles.barChart}
        />
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  barChart: {
    borderRadius: 16,
  },
  noDataText: {
    padding: 40,
  },
  customLegendContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '45%', // Two columns
    marginBottom: 12,
    marginHorizontal: '2.5%',
  },
  legendColorBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginTop: 2,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: 12,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default StatisticsScreen;
