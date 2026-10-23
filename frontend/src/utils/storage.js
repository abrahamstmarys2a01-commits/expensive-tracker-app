import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_KEY = '@spendwise_expenses';
const SETTINGS_KEY = '@spendwise_settings';

export const getExpenses = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(EXPENSES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error getting expenses', e);
    return [];
  }
};

export const addExpense = async (expense) => {
  try {
    const expenses = await getExpenses();
    const newExpense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
    };
    const newExpenses = [newExpense, ...expenses];
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(newExpenses));
    return newExpense;
  } catch (e) {
    console.error('Error adding expense', e);
    throw e;
  }
};

export const updateExpense = async (updatedExpense) => {
  try {
    const expenses = await getExpenses();
    const newExpenses = expenses.map((exp) =>
      exp.id === updatedExpense.id ? { ...exp, ...updatedExpense } : exp
    );
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(newExpenses));
    return updatedExpense;
  } catch (e) {
    console.error('Error updating expense', e);
    throw e;
  }
};

export const deleteExpense = async (id) => {
  try {
    const expenses = await getExpenses();
    const newExpenses = expenses.filter((exp) => exp.id !== id);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(newExpenses));
  } catch (e) {
    console.error('Error deleting expense', e);
    throw e;
  }
};

export const clearAllExpenses = async () => {
  try {
    await AsyncStorage.removeItem(EXPENSES_KEY);
  } catch (e) {
    console.error('Error clearing expenses', e);
    throw e;
  }
};

export const getSettings = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : { currency: '₹', isDarkMode: false };
  } catch (e) {
    console.error('Error getting settings', e);
    return { currency: '₹', isDarkMode: false };
  }
};

export const updateSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error updating settings', e);
    throw e;
  }
};
