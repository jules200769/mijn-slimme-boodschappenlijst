import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

export default function ViewMembersModal({ visible, onClose, listCode, isOwner }) {
  const { colors } = useTheme();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && listCode) {
      loadMembers();
    }
  }, [visible, listCode]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      
      // Haal leden op van de gedeelde lijst
      const { data, error } = await supabase
        .from('shared_lists')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email
          )
        `)
        .eq('list_code', listCode);

      if (error) {
        console.error('Error loading members:', error);
        return;
      }

      // Verwerk de data
      const processedMembers = data.map(item => ({
        id: item.user_id,
        name: item.profiles?.full_name || 'Onbekende gebruiker',
        email: item.profiles?.email || 'Geen email',
        joinedAt: item.created_at,
        isOwner: item.is_owner || false
      }));

      setMembers(processedMembers);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId) => {
    if (!isOwner) {
      Alert.alert('Geen rechten', 'Alleen de eigenaar kan leden verwijderen.');
      return;
    }

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
              const { error } = await supabase
                .from('shared_lists')
                .delete()
                .eq('list_code', listCode)
                .eq('user_id', memberId);

              if (error) {
                console.error('Error removing member:', error);
                Alert.alert('Fout', 'Kon lid niet verwijderen.');
                return;
              }

              // Herlaad leden
              loadMembers();
              Alert.alert('Succes', 'Lid is verwijderd.');
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Fout', 'Kon lid niet verwijderen.');
            }
          }
        }
      ]
    );
  };

  const renderMember = ({ item }) => (
    <View style={[styles.memberRow, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: colors.text }]}>
          {item.name} {item.isOwner && '(Eigenaar)'}
        </Text>
        <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>
          {item.email}
        </Text>
      </View>
      {isOwner && !item.isOwner && (
        <TouchableOpacity
          onPress={() => removeMember(item.id)}
          style={styles.removeButton}
        >
          <MaterialCommunityIcons name="delete" size={20} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );

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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Leden van de lijst</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Leden laden...</Text>
            </View>
          ) : members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nog geen leden</Text>
            </View>
          ) : (
            <FlatList
              data={members}
              renderItem={renderMember}
              keyExtractor={item => item.id}
              style={styles.membersList}
            />
          )}
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
    maxHeight: '80%',
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  membersList: {
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
}); 