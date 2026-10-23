import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlusCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const EmptyState = ({ onAddPress }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✨</Text>
      <Text style={[styles.title, { color: colors.text }]}>No expenses yet</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Start tracking your spending by adding your first expense.
      </Text>
      
      {onAddPress && (
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={onAddPress}>
          <PlusCircle color={colors.background} size={20} />
          <Text style={[styles.buttonText, { color: colors.background }]}>Add Expense</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default EmptyState;
