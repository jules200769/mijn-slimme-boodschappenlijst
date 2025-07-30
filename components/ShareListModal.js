import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sharedLists } from '../lib/supabase';
import { lists } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ShareListModal({ visible, onClose, listData }) {
  const { user } = useAuth();
  const [shareCode, setShareCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && listData) {
      generateShareCode();
    }
  }, [visible, listData]);

  const generateShareCode = async () => {
    if (!listData || !user) return;
    
    setIsLoading(true);
    try {
      // Zorg dat er altijd een naam wordt meegestuurd
      const listName = listData.naam || listData.name || 'Gedeelde lijst';
      const items = listData.items || [];
      const { data, error } = await sharedLists.createSharedList({ name: listName, items }, user.id);
      
      if (error) {
        console.error('Fout bij genereren code:', error);
        Alert.alert('Fout', 'Kon geen deelcode genereren. Probeer het opnieuw.');
        return;
      }
      
      setShareCode(data.code);
      // Verwijder de persoonlijke lijst na succesvol delen
      if (listData.id) {
        await lists.deleteList(listData.id);
      }
    } catch (error) {
      console.error('Fout bij genereren code:', error);
      Alert.alert('Fout', 'Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    // In een echte app zou je hier de clipboard API gebruiken
    Alert.alert('Code gekopieerd!', `Code: ${shareCode}`);
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
            <Text style={styles.title}>Deel lijst</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.description}>
              Voeg leden toe aan jouw lijst
            </Text>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Code genereren...</Text>
              </View>
            ) : shareCode ? (
              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Deelcode:</Text>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{shareCode}</Text>
                  <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                    <MaterialCommunityIcons name="content-copy" size={20} color="#4caf50" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeInfo}>
                  Deze code blijft actief zolang dit scherm open is
                </Text>
              </View>
            ) : null}
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  codeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minWidth: 200,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  codeInfo: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
}); 