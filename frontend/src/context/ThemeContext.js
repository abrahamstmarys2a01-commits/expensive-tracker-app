import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../utils/storage';

export const lightColors = {
  primary: '#10b981', // Emerald green
  primaryLight: '#d1fae5',
  background: '#ffffff',
  surface: '#f9fafb', // Soft light-gray cards
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  cardShadow: 'rgba(0, 0, 0, 0.05)',
};

export const darkColors = {
  primary: '#10b981',
  primaryLight: '#064e3b',
  background: '#111827',
  surface: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const settings = await getSettings();
      if (settings && settings.isDarkMode !== undefined) {
        setIsDark(settings.isDarkMode);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async (value) => {
    setIsDark(value);
    const settings = await getSettings();
    await updateSettings({ ...settings, isDarkMode: value });
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
