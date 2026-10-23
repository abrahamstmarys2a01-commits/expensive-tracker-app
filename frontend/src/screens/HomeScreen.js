import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, User } from 'lucide-react-native';
import { getExpenses } from '../utils/api';
import { calculateThisMonthTotal, calculateTodayTotal, getExpensesByCategory } from '../utils/calculations';
import SummaryCard from '../components/SummaryCard';
import ExpenseCard from '../components/ExpenseCard';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, logout } = useAuth();
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
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: insets.top > 0 ? insets.top + 8 : 16 }
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting()}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {user?.name ? `Welcome, ${user.name}` : 'Your spending overview'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={[styles.candidateAvatar, { borderColor: colors.primary, backgroundColor: colors.surface }]}
            activeOpacity={0.8}
          >
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                <User size={22} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
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
        <Plus color={colors.background} size={20} strokeWidth={2.5} />
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  candidateAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  }
});

export default HomeScreen;
