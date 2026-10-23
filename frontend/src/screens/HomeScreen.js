import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { getExpenses } from '../utils/api';
import { calculateThisMonthTotal, calculateTodayTotal, getExpensesByCategory } from '../utils/calculations';
import SummaryCard from '../components/SummaryCard';
import ExpenseCard from '../components/ExpenseCard';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayExpensesCount, setTodayExpensesCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Simple splash screen fade animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const loadData = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
      setThisMonthTotal(calculateThisMonthTotal(data));
      setTodayTotal(calculateTodayTotal(data));
      
      const today = new Date().toISOString().split('T')[0];
      setTodayExpensesCount(data.filter(e => e.date === today).length);
    } catch (error) {
      console.error(error);
      if (error.message === 'UNAUTHORIZED') {
        logout();
      }
    } finally {
      if (!isReady) {
        setIsReady(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!isReady) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.splashTitle, { color: colors.primary }]}>Expensive Tracker</Text>
        <Text style={[styles.splashSubtitle, { color: colors.textSecondary }]}>Track your money. Control your spending.</Text>
      </View>
    );
  }

  const recentExpenses = expenses.slice(0, 5);
  const categorySummary = getExpensesByCategory(expenses).slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon ☀️';
    if (hour < 21) return 'Good Evening 🌇';
    return 'Good Night 🌙';
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting()}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your spending overview</Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard 
            title="This Month" 
            amount={thisMonthTotal} 
            isPrimary={true}
          />
          <View style={{ width: 16 }} />
          <SummaryCard 
            title="Today" 
            amount={todayTotal} 
            subtitle={`${todayExpensesCount} Expenses`}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentExpenses.length > 0 ? (
          recentExpenses.map(exp => (
            <ExpenseCard key={exp.id} expense={exp} />
          ))
        ) : (
          <EmptyState onAddPress={() => navigation.navigate('AddExpense')} />
        )}

        {categorySummary.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
            </View>
            <View style={[styles.categorySummaryCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
              {categorySummary.map((cat, index) => (
                <View key={cat.category} style={[styles.categoryRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{cat.category}</Text>
                  <Text style={[styles.categoryAmount, { color: colors.text }]}>₹{cat.total.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        
        {/* Extra padding for bottom float button */}
        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
        onPress={() => navigation.navigate('AddExpense')}
        activeOpacity={0.8}
      >
        <Plus color={colors.background} size={24} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  categorySummaryCard: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  categoryName: {
    fontSize: 16,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  }
});

export default HomeScreen;
