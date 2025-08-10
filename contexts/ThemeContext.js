import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Laad opgeslagen thema voorkeur bij app start
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.log('Fout bij laden thema voorkeur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Functie om thema te wisselen
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Fout bij opslaan thema voorkeur:', error);
    }
  };

  // Thema kleuren
  const theme = {
    isDarkMode,
    toggleTheme,
    isLoading,
    colors: {
      // Achtergronden
      background: isDarkMode ? '#121212' : '#f7f7f7',
      surface: isDarkMode ? '#1e1e1e' : '#ffffff',
      card: isDarkMode ? '#2d2d2d' : '#ffffff',
      
      // Tekst
      text: isDarkMode ? '#ffffff' : '#222222',
      textSecondary: isDarkMode ? '#b0b0b0' : '#888888',
      textTertiary: isDarkMode ? '#666666' : '#bbbbbb',
      
      // Accent kleuren
      primary: isDarkMode ? '#37af29' : '#37af29',
      primaryLight: isDarkMode ? '#e8f5e8' : '#e8f5e8',
      
      // Borders en dividers
      // In dark mode gelijk aan 'surface' gezet zodat dunne lijnen niet opvallen
      border: isDarkMode ? '#1e1e1e' : '#f0f0f0',
      divider: isDarkMode ? '#1e1e1e' : '#f0f0f0',
      
      // Status kleuren
      success: isDarkMode ? '#37af29' : '#37af29',
      error: isDarkMode ? '#f44336' : '#e53935',
      warning: isDarkMode ? '#ff9800' : '#ff9800',
      
      // Switch kleuren
      switchTrack: isDarkMode ? '#666666' : '#e0e0e0',
      switchThumb: isDarkMode ? '#ffffff' : '#ffffff',
      switchActive: isDarkMode ? '#37af29' : '#37af29',
      
      // Button kleuren
      buttonText: isDarkMode ? '#ffffff' : '#ffffff',
    }
  };

  const value = {
    ...theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 