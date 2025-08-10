import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function EditEmailScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert('Fout', 'E-mailadres mag niet leeg zijn');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Fout', 'Voer een geldig e-mailadres in');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      Alert.alert('Succes', 'Je ontvangt een bevestigingsmail op het nieuwe adres. Klik op de link in die mail om je wijziging te voltooien.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      let msg = 'Kon e-mailadres niet wijzigen';
      if (error.message) {
        msg += `: ${error.message}`;
      }
      Alert.alert('Fout', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wijzig e-mailadres</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.label, { color: colors.text }]}>Nieuw e-mailadres</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text
          }]}
          value={email}
          onChangeText={setEmail}
          placeholder="Voer je e-mailadres in"
          placeholderTextColor={colors.textSecondary}
          keyboardAppearance={isDarkMode ? 'dark' : 'light'}
          autoFocus
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.success }]} 
          onPress={handleSave} 
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Opslaan...' : 'Opslaan'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  container: {
    margin: 24,
    borderRadius: 18,
    padding: 24,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 