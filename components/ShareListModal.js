import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Clipboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ShareListModal({ visible, onClose, listData }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [shareCode, setShareCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (visible && listData) {
      generateShareCode();
    }
  }, [visible, listData]);

  const generateShareCode = async () => {
    if (!listData || !user) return;

    setIsGenerating(true);
    try {
      // Genereer een unieke code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Sla de gedeelde lijst op in Supabase
      const { error } = await supabase
        .from('shared_lists')
        .upsert({
          list_code: code,
          list_id: listData.id,
          user_id: user.id,
          is_owner: true,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating shared list:', error);
        Alert.alert('Fout', 'Kon lijst niet delen.');
        return;
      }

      setShareCode(code);
    } catch (error) {
      console.error('Error generating share code:', error);
      Alert.alert('Fout', 'Kon geen deelcode genereren.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setString(shareCode);
      Alert.alert('Gekopieerd!', 'Deelcode is gekopieerd naar je klembord.');
    } catch (error) {
      Alert.alert('Fout', 'Kon code niet kopiëren.');
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Deel lijst</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Deel deze code met anderen om ze uit te nodigen voor je lijst:
            </Text>

            <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.shareCode, { color: colors.text }]}>
                {isGenerating ? 'Genereren...' : shareCode}
              </Text>
              <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                <MaterialCommunityIcons name="content-copy" size={20} color={colors.success} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.instructions, { color: colors.textSecondary }]}>
              Anderen kunnen deze code gebruiken om je lijst te joinen via de "JOIN LIJST" knop.
            </Text>
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
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  shareCode: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 