import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function EditEmailScreen({ navigation }) {
  const { user } = useAuth();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wijzig e-mailadres</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Nieuw e-mailadres</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Voer je e-mailadres in"
          autoFocus
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
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
    backgroundColor: '#f7f7f7',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  container: {
    backgroundColor: '#fff',
    margin: 24,
    borderRadius: 18,
    padding: 24,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#4caf50',
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