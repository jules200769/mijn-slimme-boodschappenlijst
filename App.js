import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
  const { colors, isLoading: themeLoading } = useTheme();

  useEffect(() => {
    // Initialize notification service
    const initializeNotifications = async () => {
      try {
        // Set up notification listeners
        notificationService.setupNotificationListeners();
        
        // Register for push notifications if user is logged in
        if (user) {
          await notificationService.registerForPushNotificationsAsync();
          
          // Schedule weekly reminder if enabled
          await notificationTriggers.scheduleWeeklyReminder();
          
          // Schedule inactivity check
          await notificationTriggers.scheduleInactivityCheck();
          
          // Track user activity when app opens
          await notificationTriggers.trackUserActivity();
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

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
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
