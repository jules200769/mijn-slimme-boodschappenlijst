import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  Title,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, autoLoginActive, clearAuthData } = useAuth();
  const { colors, isDarkMode } = useTheme();
  // Automatische inlog is altijd aan

  useEffect(() => {
    // Als user en autoLoginActive, navigeer direct naar hoofdscherm
    if (user && autoLoginActive) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Groceries' }],
      });
    }
  }, [user, autoLoginActive, navigation]);

  // Functie om auth data op te schonen bij refresh token errors
  const handleAuthError = async () => {
    try {
      await clearAuthData();
      Alert.alert('Sessie verlopen', 'Je sessie is verlopen. Log opnieuw in.');
    } catch (error) {
      console.log('Error clearing auth data:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        // Login succesvol - de AuthContext zal automatisch de user state updaten
        // De app zal automatisch naar de main navigator switchen
      } else {
        Alert.alert('Login mislukt', result.error || 'Onbekende fout');
      }
    } catch (error) {
      Alert.alert('Fout', 'Netwerkfout. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  // Voeg deze functie toe binnen LoginScreen
  const handleForgotPassword = async () => {
    let targetEmail = email;
    if (!targetEmail) {
      Alert.prompt(
        'Wachtwoord vergeten',
        'Vul je e-mailadres in om een reset-link te ontvangen.',
        [
          {
            text: 'Annuleren',
            style: 'cancel',
          },
          {
            text: 'Verstuur',
            onPress: async (inputEmail) => {
              if (!inputEmail || !inputEmail.includes('@')) {
                Alert.alert('Fout', 'Vul een geldig e-mailadres in.');
                return;
              }
              await sendReset(inputEmail);
            },
          },
        ],
        'plain-text'
      );
      return;
    }
    await sendReset(targetEmail);
  };

  const sendReset = async (targetEmail) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail);
      if (error) throw error;
      Alert.alert('Succes', 'Je ontvangt een e-mail met instructies om je wachtwoord te resetten.');
    } catch (error) {
      Alert.alert('Fout', error.message || 'Kon geen reset-link versturen.');
    }
  };


  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Title style={[styles.title, { color: colors.text }]}>Welcome Back</Title>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to your account</Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              keyboardAppearance={isDarkMode ? 'dark' : 'light'}
              theme={{ 
                colors: { 
                  primary: colors.primary,
                  background: colors.surface,
                  surface: colors.surface,
                  text: colors.text,
                  placeholder: colors.textSecondary,
                  onSurface: colors.text
                } 
              }}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              keyboardAppearance={isDarkMode ? 'dark' : 'light'}
              theme={{ 
                colors: { 
                  primary: colors.primary,
                  background: colors.surface,
                  surface: colors.surface,
                  text: colors.text,
                  placeholder: colors.textSecondary,
                  onSurface: colors.text
                } 
              }}
            />
            {/* Automatische inlog is altijd ingeschakeld */}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: colors.primary }]}
              labelStyle={{ color: colors.buttonText }}
            >
              Sign In
            </Button>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                style={styles.linkButton}
                labelStyle={{ color: colors.primary }}
              >
                Sign Up
              </Button>
            </View>
            
            <View style={styles.skipContainer}>
              <Button
                mode="text"
                onPress={handleForgotPassword}
                style={styles.skipButton}
                labelStyle={{ color: colors.primary }}
              >
                Wachtwoord vergeten?
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 8,
  },
  googleButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  linkButton: {
    margin: 0,
    padding: 0,
  },
  skipContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  skipButton: {
    margin: 0,
    padding: 0,
  },
});

export default LoginScreen; 