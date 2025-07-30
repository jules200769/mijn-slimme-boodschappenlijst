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
import { supabase } from '../lib/supabase';
import { getAutoLoginEnabled, setAutoLoginEnabled } from '../lib/autoLogin';
import { Switch } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, autoLoginActive } = useAuth();
  const [autoLogin, setAutoLogin] = useState(false);

  useEffect(() => {
    // Laad voorkeur bij openen scherm
    (async () => {
      const enabled = await getAutoLoginEnabled();
      setAutoLogin(enabled);
    })();
  }, []);

  useEffect(() => {
    // Als user en autoLoginActive, navigeer direct naar hoofdscherm
    if (user && autoLoginActive) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Groceries' }],
      });
    }
  }, [user, autoLoginActive]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);
      await setAutoLoginEnabled(autoLogin); // Sla voorkeur op
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Welcome Back</Title>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            {/* Automatisch inloggen switch */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
              <Switch
                value={autoLogin}
                onValueChange={setAutoLogin}
                trackColor={{ true: '#4caf50', false: '#ccc' }}
                thumbColor={autoLogin ? '#4caf50' : '#fff'}
              />
              <Text style={{ marginLeft: 12, fontSize: 16 }}>Automatisch inloggen</Text>
            </View>

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Sign In
            </Button>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                style={styles.linkButton}
              >
                Sign Up
              </Button>
            </View>
            
            <View style={styles.skipContainer}>
              <Button
                mode="text"
                onPress={handleForgotPassword}
                style={styles.skipButton}
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
    backgroundColor: '#fafafa',
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
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
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
    borderColor: '#4285f4',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
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