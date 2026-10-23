import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getCategoryByName } from '../constants/categories';
import { Edit2, Trash2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const ExpenseCard = ({ expense, onPress, onEdit, onDelete }) => {
  const { colors } = useTheme();
  const category = getCategoryByName(expense.category);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
        <Image source={category.image} style={styles.categoryImage} />
      </View>
      
      <View style={styles.details}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{expense.title}</Text>
        <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{category.name} • {new Date(expense.date).toLocaleDateString()}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: colors.text }]}>₹{parseFloat(expense.amount).toFixed(2)}</Text>
        
        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={() => onEdit(expense)} style={styles.actionButton}>
                <Edit2 size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={() => onDelete(expense.id)} style={styles.actionButton}>
                <Trash2 size={16} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  categoryImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  details: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ExpenseCard;
