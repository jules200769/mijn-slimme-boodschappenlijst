import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function JoinListModal({ visible, onClose, onJoinSuccess }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Fout', 'Voer een geldige code in.');
      return;
    }

    setIsJoining(true);
    try {
      // Controleer of de lijst bestaat
      const { data: sharedList, error: listError } = await supabase
        .from('shared_lists')
        .select('*')
        .eq('list_code', joinCode.toUpperCase())
        .single();

      if (listError || !sharedList) {
        Alert.alert('Fout', 'Ongeldige code. Controleer de code en probeer opnieuw.');
        return;
      }

      // Controleer of gebruiker al lid is
      const { data: existingMember } = await supabase
        .from('shared_lists')
        .select('*')
        .eq('list_code', joinCode.toUpperCase())
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        Alert.alert('Fout', 'Je bent al lid van deze lijst.');
        return;
      }

      // Voeg gebruiker toe aan de gedeelde lijst
      const { error: joinError } = await supabase
        .from('shared_lists')
        .insert({
          list_code: joinCode.toUpperCase(),
          list_id: sharedList.list_id,
          user_id: user.id,
          is_owner: false,
          created_at: new Date().toISOString()
        });

      if (joinError) {
        console.error('Error joining list:', joinError);
        Alert.alert('Fout', 'Kon niet toetreden tot de lijst. Probeer het opnieuw.');
        return;
      }

      Alert.alert('Succes', 'Je bent succesvol toegetreden tot de lijst!');
      setJoinCode('');
      onClose();
      if (onJoinSuccess) {
        onJoinSuccess();
      }
    } catch (error) {
      console.error('Error joining list:', error);
      Alert.alert('Fout', 'Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Join lijst</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Voer de deelcode in om toe te treden tot een gedeelde lijst:
            </Text>

            <TextInput
              style={[styles.codeInput, { 
                backgroundColor: colors.background, 
                borderColor: colors.divider,
                color: colors.text
              }]}
              placeholder="Voer de 6-cijferige code in"
              placeholderTextColor={colors.textTertiary}
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="characters"
              maxLength={6}
            />

            <TouchableOpacity
              style={[styles.joinButton, { backgroundColor: colors.primary }]}
              onPress={handleJoin}
              disabled={isJoining}
            >
              <Text style={styles.joinButtonText}>
                {isJoining ? 'Toetreden...' : 'Toetreden tot lijst'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  codeInput: {
    fontSize: 18,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2,
  },
  joinButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 