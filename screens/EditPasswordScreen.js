import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function EditPasswordScreen({ navigation }) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Fout', 'Wachtwoorden komen niet overeen');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Fout', 'Nieuw wachtwoord moet minimaal 6 karakters zijn');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Alert.alert('Succes', 'Wachtwoord is bijgewerkt', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      let msg = 'Kon wachtwoord niet wijzigen';
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
        <Text style={styles.headerTitle}>Wijzig wachtwoord</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.container}>
        {/* Huidig wachtwoord mag optioneel zijn, maar wordt niet gebruikt */}
        {/* <Text style={styles.label}>Huidig wachtwoord</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Huidig wachtwoord"
          secureTextEntry
        /> */}
        <Text style={styles.label}>Nieuw wachtwoord</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Nieuw wachtwoord"
          secureTextEntry
        />
        <Text style={styles.label}>Bevestig nieuw wachtwoord</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Bevestig nieuw wachtwoord"
          secureTextEntry
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 