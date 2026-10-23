import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Image, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CATEGORIES } from '../constants/categories';
import { addExpense, updateExpense } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const AddExpenseScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const editingExpense = route.params?.expense;

  const [title, setTitle] = useState(editingExpense?.title || '');
  const [amount, setAmount] = useState(editingExpense?.amount?.toString() || '');
  const [category, setCategory] = useState(editingExpense?.category || CATEGORIES[0].name);
  const [date, setDate] = useState(editingExpense?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(editingExpense?.note || '');
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title.');
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0.');
      return;
    }
    if (!category) {
      Alert.alert('Validation Error', 'Please select a category.');
      return;
    }

    const expenseData = {
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      note: note.trim(),
    };

    try {
      if (editingExpense) {
        await updateExpense({ ...expenseData, id: editingExpense.id, createdAt: editingExpense.createdAt });
      } else {
        await addExpense(expenseData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not save the expense.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: colors.text }]}>Title</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="e.g. Lunch with friends"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.text }]}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      
      <TouchableOpacity 
        style={[styles.input, styles.dropdownButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setCategoryModalVisible(true)}
      >
        <View style={styles.selectedCategoryContainer}>
          {category ? (
            <>
              <Image source={CATEGORIES.find(c => c.name === category)?.image || CATEGORIES[0].image} style={styles.categoryChipImage} />
              <Text style={[styles.dropdownButtonText, { color: colors.text }]}>{category}</Text>
            </>
          ) : (
            <Text style={{ color: colors.textSecondary }}>Select a category</Text>
          )}
        </View>
        <Text style={{ color: colors.textSecondary }}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text, borderBottomColor: colors.border }]}>Select Category</Text>
            <ScrollView style={styles.modalScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.modalCategoryItem,
                    { borderBottomColor: colors.border },
                    category === cat.name && { backgroundColor: cat.color + '15' }
                  ]}
                  onPress={() => {
                    setCategory(cat.name);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Image source={cat.image} style={styles.modalCategoryImage} />
                  <Text style={[
                    styles.modalCategoryText, 
                    { color: colors.text },
                    category === cat.name && { color: cat.color, fontWeight: 'bold' }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={[styles.modalCloseButton, { backgroundColor: colors.border }]}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={[styles.label, { color: colors.text }]}>Note (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
        placeholder="Add details..."
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        placeholderTextColor={colors.textSecondary}
      />

      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleSave}>
        <Text style={[styles.saveButtonText, { color: colors.background }]}>Save Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  selectedCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalCategoryImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 16,
  },
  modalCategoryText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddExpenseScreen;
