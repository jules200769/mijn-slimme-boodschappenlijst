import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import AuthNavigator from './navigation/AuthNavigator';
import MainNavigator from './navigation/MainNavigator';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>Laden...</Text>
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
          {user ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  );
}
