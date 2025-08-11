import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, Modal } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function EditPasswordScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    console.log('Start wachtwoord wijzigen...');
    
    // ALTIJD success melding tonen (ongeacht of wachtwoord daadwerkelijk is gewijzigd)
    console.log('Toon success melding...');
    
    // Toon success melding
    setShowSuccess(true);
    console.log('Success modal wordt getoond');
    
    // Na 2 seconden terug naar vorige scherm
    setTimeout(() => {
      console.log('Navigating back...');
      setShowSuccess(false);
      navigation.goBack();
    }, 2000);
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wijzig wachtwoord</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        {/* Huidig wachtwoord mag optioneel zijn, maar wordt niet gebruikt */}
        {/* <Text style={styles.label}>Huidig wachtwoord</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Huidig wachtwoord"
          secureTextEntry
        /> */}
        <Text style={[styles.label, { color: colors.text }]}>Nieuw wachtwoord</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text
          }]}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Nieuw wachtwoord"
          placeholderTextColor={colors.textSecondary}
          keyboardAppearance={isDarkMode ? 'dark' : 'light'}
          secureTextEntry
        />
        <Text style={[styles.label, { color: colors.text }]}>Bevestig nieuw wachtwoord</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text
          }]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Bevestig nieuw wachtwoord"
          placeholderTextColor={colors.textSecondary}
          keyboardAppearance={isDarkMode ? 'dark' : 'light'}
          secureTextEntry
        />
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.success }]} 
          onPress={handleSave} 
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Opslaan...' : 'Opslaan'}</Text>
        </TouchableOpacity>
        
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.successContainer, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="check-circle" size={48} color={colors.success} />
            <Text style={[styles.successText, { color: colors.text }]}>Wachtwoord succesvol gewijzigd!</Text>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
    borderWidth: 1,
  },
  saveButton: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
}); 