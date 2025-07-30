import React, { useState } from 'react';
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

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Fout', 'Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Fout', 'Wachtwoord moet minimaal 6 karakters zijn');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password, name);
      
      if (result.success) {
        Alert.alert(
          'Registratie succesvol', 
          'Controleer je email voor verificatie en log dan in.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Registratie mislukt', result.error || 'Onbekende fout');
      }
    } catch (error) {
      Alert.alert('Fout', 'Netwerkfout. Probeer opnieuw.');
    } finally {
      setLoading(false);
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
            <Title style={styles.title}>Create Account</Title>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

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

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Create Account
            </Button>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.linkButton}
              >
                Sign In
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
});

export default RegisterScreen; 