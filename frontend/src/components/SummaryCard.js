import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SummaryCard = ({ title, amount, subtitle, isPrimary }) => {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.card, 
      { backgroundColor: colors.surface, shadowColor: colors.cardShadow },
      isPrimary && { backgroundColor: colors.primary }
    ]}>
      <Text style={[
        styles.title, 
        { color: colors.textSecondary },
        isPrimary && { color: colors.background }
      ]}>{title}</Text>
      
      <Text style={[
        styles.amount, 
        { color: isPrimary ? colors.background : colors.text }
      ]}>
        ₹{typeof amount === 'number' ? amount.toFixed(2) : amount}
      </Text>
      
      {subtitle && (
        <Text style={[
          styles.subtitle, 
          { color: colors.textSecondary },
          isPrimary && { color: colors.background }
        ]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    flex: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
});

export default SummaryCard;
