import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ScrollView, Image, SectionList } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, Filter, Calendar } from 'lucide-react-native';
import { CATEGORIES } from '../constants/categories';
import { getExpenses, deleteExpense } from '../utils/api';
import ExpenseCard from '../components/ExpenseCard';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const TIME_FILTERS = ['All Time', 'Today', 'This Week', 'This Month'];

const ExpensesScreen = () => {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [isOldestFirst, setIsOldestFirst] = useState(false);

  const loadData = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
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
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(id);
          loadData();
        }
      }
    ]);
  };

  const handleEdit = (expense) => {
    navigation.navigate('AddExpense', { expense });
  };

  // Filter and Sort Logic
  let filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? exp.category === selectedCategory : true;
    
    let matchesTime = true;
    if (timeFilter !== 'All Time') {
      const expDateStr = exp.date; // e.g., "2026-08-28"
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      if (timeFilter === 'Today') {
        matchesTime = expDateStr === todayStr;
      } else if (timeFilter === 'This Week') {
        const today = new Date();
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - today.getDay()); // Sunday
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6); // Saturday
        
        const firstDayStr = firstDay.toISOString().split('T')[0];
        const lastDayStr = lastDay.toISOString().split('T')[0];
        
        matchesTime = expDateStr >= firstDayStr && expDateStr <= lastDayStr;
      } else if (timeFilter === 'This Month') {
        const thisMonthStr = todayStr.substring(0, 7); // "YYYY-MM"
        matchesTime = expDateStr.startsWith(thisMonthStr);
      }
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  filteredExpenses = filteredExpenses.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return isOldestFirst ? dateA - dateB : dateB - dateA;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Group by date for SectionList
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});

  const sections = Object.keys(groupedExpenses).map(date => {
    const data = groupedExpenses[date];
    const total = data.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    return { title: date, data, total };
  });

  // Sort sections
  sections.sort((a, b) => {
    const dateA = new Date(a.title).getTime();
    const dateB = new Date(b.title).getTime();
    return isOldestFirst ? dateA - dateB : dateB - dateA;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Search color={colors.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Time Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Calendar color={colors.textSecondary} size={16} style={{ marginRight: 12, marginTop: 10 }} />
            {TIME_FILTERS.map(tf => (
              <TouchableOpacity 
                key={tf}
                style={[
                  styles.filterChip, 
                  { backgroundColor: colors.background, borderColor: colors.border },
                  timeFilter === tf && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setTimeFilter(tf)}
              >
                <Text style={[
                  styles.filterChipText, 
                  { color: colors.textSecondary },
                  timeFilter === tf && { color: colors.background }
                ]}>
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Filter color={colors.textSecondary} size={16} style={{ marginRight: 12, marginTop: 10 }} />
            <TouchableOpacity 
              style={[
                styles.filterChip, 
                { backgroundColor: colors.background, borderColor: colors.border },
                !selectedCategory && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.filterChipText, 
                { color: colors.textSecondary },
                !selectedCategory && { color: colors.background }
              ]}>All</Text>
            </TouchableOpacity>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat.id}
                style={[
                  styles.filterChip, 
                  styles.categoryChip,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  selectedCategory === cat.name && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <Image source={cat.image} style={styles.chipImage} />
                <Text style={[
                  styles.filterChipText, 
                  { color: colors.textSecondary },
                  selectedCategory === cat.name && { color: colors.background }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.totalText, { color: colors.textSecondary }]}>
            Total: <Text style={[styles.totalAmount, { color: colors.text }]}>₹{totalFilteredAmount.toFixed(2)}</Text>
          </Text>
          <TouchableOpacity 
            style={[styles.sortButton, { backgroundColor: colors.primaryLight }]} 
            onPress={() => setIsOldestFirst(!isOldestFirst)}
          >
            <Filter color={colors.primary} size={16} />
            <Text style={[styles.sortText, { color: colors.primary }]}>{isOldestFirst ? 'Oldest' : 'Newest'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ExpenseCard 
            expense={item} 
            onEdit={handleEdit}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        renderSectionHeader={({ section: { title, total } }) => (
          <View style={[styles.sectionHeaderContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionHeaderDate, { color: colors.textSecondary }]}>{title}</Text>
            <Text style={[styles.sectionHeaderTotal, { color: colors.text }]}>Total: ₹{total.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState />
        }
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  chipImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  filterChipText: {
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sortText: {
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  sectionHeaderDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeaderTotal: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ExpensesScreen;
