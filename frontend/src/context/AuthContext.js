import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored session on startup
    const loadSession = async () => {
      try {
        const userData = await AsyncStorage.getItem('@spendwise_user');
        if (userData) {
          setUser(JSON.parse(userData).user);
          setIsLoggedIn(true);
        }
      } catch (e) {
        // ignore
      }
    };
    loadSession();
  }, []);

  const login = async (userData) => {
    setUser(userData.user);
    setIsLoggedIn(true);
    await AsyncStorage.setItem('@spendwise_user', JSON.stringify(userData));
  };
  
  const updateUser = async (updatedUserData) => {
    setUser(updatedUserData.user);
    await AsyncStorage.setItem('@spendwise_user', JSON.stringify(updatedUserData));
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem('@spendwise_user');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
