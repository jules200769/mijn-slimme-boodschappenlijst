import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sharedLists } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function JoinListModal({ visible, onClose, onJoinSuccess }) {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinList = async () => {
    if (!joinCode.trim() || !user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await sharedLists.joinSharedList(joinCode.trim(), user.id);
      
      if (error) {
        console.error('Fout bij joinen lijst:', error);
        Alert.alert('Fout', 'Kon niet deelnemen aan de lijst. Controleer de code en probeer het opnieuw.');
        return;
      }
      
      Alert.alert('Succes', 'Je bent toegevoegd aan de lijst!');
      setJoinCode('');
      onJoinSuccess?.();
      onClose();
    } catch (error) {
      console.error('Fout bij joinen lijst:', error);
      Alert.alert('Fout', 'Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Join lijst</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.description}>
              Voer de deelcode in om deel te nemen aan een lijst
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="Voer code in..."
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
                maxLength={6}
                autoFocus
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.joinButton,
                (!joinCode.trim() || isLoading) && styles.joinButtonDisabled
              ]}
              onPress={handleJoinList}
              disabled={!joinCode.trim() || isLoading}
            >
              <Text style={styles.joinButtonText}>
                {isLoading ? 'Deelnemen...' : 'Deelnemen'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  content: {
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  codeInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  joinButtonDisabled: {
    backgroundColor: '#bdbdbd',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 