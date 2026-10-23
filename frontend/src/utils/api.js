import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

// Backend API URL on Render
const API_URL = 'https://expensive-tracker-app.onrender.com/api';

const getAuthToken = async () => {
  try {
    const userData = await AsyncStorage.getItem('@spendwise_user');
    if (userData) {
      const { token } = JSON.parse(userData);
      return token;
    }
  } catch (error) {
    console.error('Error getting token', error);
  }
  return null;
};

const authHeader = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Expenses API

export const getExpenses = async () => {
  try {
    const headers = await authHeader();
    if (!headers.Authorization) return []; // Not logged in

    const response = await fetch(`${API_URL}/expenses`, { headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Fetch failed. URL: ${API_URL}/expenses, Status: ${response.status}, Error: ${errorText}`);
      if (response.status === 401 || response.status === 500) { // also catch 500 for missing user just in case
        throw new Error('UNAUTHORIZED');
      }
      throw new Error('Failed to fetch expenses');
    }
    
    return await response.json();
  } catch (e) {
    console.error('Error getting expenses', e);
    throw e;
  }
};

export const addExpense = async (expense) => {
  try {
    const headers = await authHeader();
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(expense),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add expense');
    }
    
    return await response.json();
  } catch (e) {
    console.error('Error adding expense', e);
    throw e;
  }
};

export const updateExpense = async (updatedExpense) => {
  try {
    const headers = await authHeader();
    const response = await fetch(`${API_URL}/expenses/${updatedExpense.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatedExpense),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update expense');
    }
    
    return await response.json();
  } catch (e) {
    console.error('Error updating expense', e);
    throw e;
  }
};

export const deleteExpense = async (id) => {
  try {
    const headers = await authHeader();
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }
  } catch (e) {
    console.error('Error deleting expense', e);
    throw e;
  }
};

// Auth API

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to login');
  }
  
  return data;
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to register');
  }
  
  return data;
};

export const updateProfile = async (profileData) => {
  try {
    const headers = await authHeader();
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    return await response.json();
  } catch (e) {
    console.error('Error updating profile', e);
    throw e;
  }
};
