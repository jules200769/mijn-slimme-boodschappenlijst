import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sharedLists } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ViewMembersModal({ visible, onClose, listCode, isOwner }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && listCode) {
      loadMembers();
    }
  }, [visible, listCode]);

  const loadMembers = async () => {
    if (!listCode) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await sharedLists.getListMembers(listCode);
      
      if (error) {
        console.error('Fout bij laden leden:', error);
        Alert.alert('Fout', 'Kon leden niet laden. Probeer het opnieuw.');
        return;
      }
      
      setMembers(data || []);
    } catch (error) {
      console.error('Fout bij laden leden:', error);
      Alert.alert('Fout', 'Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (memberUserId) => {
    if (!isOwner || !user) return;
    
    Alert.alert(
      'Lid verwijderen',
      'Weet je zeker dat je dit lid wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await sharedLists.removeListMember(listCode, memberUserId, user.id);
              
              if (error) {
                console.error('Fout bij verwijderen lid:', error);
                Alert.alert('Fout', 'Kon lid niet verwijderen. Probeer het opnieuw.');
                return;
              }
              
              // Herlaad leden
              loadMembers();
              Alert.alert('Succes', 'Lid is verwijderd uit de lijst.');
            } catch (error) {
              console.error('Fout bij verwijderen lid:', error);
              Alert.alert('Fout', 'Er is een fout opgetreden. Probeer het opnieuw.');
            }
          }
        }
      ]
    );
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.full_name || 'Onbekende gebruiker'}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      {isOwner && item.user_id !== user?.id && (
        <TouchableOpacity 
          onPress={() => removeMember(item.user_id)}
          style={styles.removeButton}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#ff4444" />
        </TouchableOpacity>
      )}
    </View>
  );

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
            <Text style={styles.title}>Bekijk leden</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Leden laden...</Text>
              </View>
            ) : members.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nog geen leden</Text>
              </View>
            ) : (
              <FlatList
                data={members}
                renderItem={renderMember}
                keyExtractor={item => item.user_id}
                style={styles.membersList}
                showsVerticalScrollIndicator={false}
              />
            )}
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
    maxHeight: '80%',
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
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
}); 