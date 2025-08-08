import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function EditNameScreen({ navigation }) {
  const { user, updateUserContext } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Haal de huidige naam op bij het laden van het scherm
  useEffect(() => {
    const getCurrentName = async () => {
      try {
        // Probeer eerst de naam uit het profiel te halen
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (!error && profile?.full_name) {
          setName(profile.full_name);
        } else {
          // Fallback naar user metadata
          const currentName = user?.user_metadata?.name || user?.user_metadata?.full_name || '';
          setName(currentName);
        }
      } catch (error) {
        console.log('Error getting current name:', error);
        // Fallback naar user metadata
        const currentName = user?.user_metadata?.name || user?.user_metadata?.full_name || '';
        setName(currentName);
      }
    };

    if (user?.id) {
      getCurrentName();
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Fout', 'Naam mag niet leeg zijn');
      return;
    }
    setLoading(true);
    try {
      console.log('DEBUG: Starting name update...');
      console.log('DEBUG: User ID:', user.id);
      console.log('DEBUG: New name:', name.trim());

      // Skip auth update for now and only update profiles table
      console.log('DEBUG: Skipping auth update, updating profiles table directly...');
      
      // Update profiles.full_name
      console.log('DEBUG: Updating profiles table...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: name.trim() })
        .eq('id', user.id)
        .select();
      console.log('DEBUG: Profile response - data:', profileData);
      console.log('DEBUG: Profile response - error:', profileError);
      
      if (profileError) {
        console.log('DEBUG: Profile error:', profileError);
        throw profileError;
      }
      console.log('DEBUG: Profile update successful:', profileData);

      // Update de user context
      console.log('DEBUG: Updating user context...');
      await updateUserContext();
      console.log('DEBUG: User context updated');
      
      // Force a manual refresh of the user data
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.full_name) {
            // Update the user context with the new name
            const updatedUser = {
              ...session.user,
              user_metadata: {
                ...session.user.user_metadata,
                name: profile.full_name
              }
            };
            // Force a re-render by updating the context
            updateUserContext();
          }
        }
      } catch (error) {
        console.log('DEBUG: Manual refresh error:', error);
      }
      
      Alert.alert('Succes', 'Naam is bijgewerkt', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log('DEBUG: Error updating name:', error);
      console.log('DEBUG: Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      let msg = 'Kon naam niet wijzigen';
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Naam bewerken</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.label, { color: colors.text }]}>Nieuwe naam</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text
          }]}
          value={name}
          onChangeText={setName}
          placeholder="Voer je naam in"
          placeholderTextColor={colors.textSecondary}
          keyboardAppearance={isDarkMode ? 'dark' : 'light'}
          autoFocus
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