import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AuthNavigator from './navigation/AuthNavigator';
import MainNavigator from './navigation/MainNavigator';
import notificationService from './lib/notifications';
import notificationTriggers from './lib/notificationTriggers';

function AppContent() {
  const { user, loading } = useAuth();
  const { colors, isLoading: themeLoading, isDarkMode } = useTheme();

  useEffect(() => {
    // Initialize notification service
    const initializeNotifications = async () => {
      try {
        // Set up notification listeners
        notificationService.setupNotificationListeners();
        
        // Register for push notifications if user is logged in
        if (user) {
          await notificationService.registerForPushNotificationsAsync();
          
          // Only track user activity when app opens (don't schedule notifications here)
          await notificationTriggers.trackUserActivity();
          
          // Note: Weekly reminders and inactivity checks are now only scheduled
          // when the user explicitly enables them in the notification settings
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    // Cleanup function
    return () => {
      notificationService.cleanup();
    };
  }, [user]);

  if (loading || themeLoading) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer>
            <View style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: colors.background 
            }}>
              <Text style={{ color: colors.text }}>Laden...</Text>
            </View>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  // Stel een navigation theme in dat aansluit op ons ThemeContext,
  // met name: background en card gelijk aan surface voor consistente donkere onderbalk
  const baseNavTheme = isDarkMode ? NavigationDarkTheme : NavigationDefaultTheme;
  const navTheme = {
    ...baseNavTheme,
    dark: isDarkMode,
    colors: {
      ...baseNavTheme.colors,
      primary: colors.success,
      background: colors.surface,
      card: colors.surface,
      text: colors.text,
      border: colors.divider,
      notification: colors.success,
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="auto" />
          {user ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
