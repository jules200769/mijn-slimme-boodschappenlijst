import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const [profileImage, setProfileImage] = useState(null);

  // Laad de profielfoto bij het openen van het scherm
  useEffect(() => {
    loadProfilePhoto();
  }, []);

  const loadProfilePhoto = async () => {
    if (!user) return;
    
    // Haal profielfoto URL uit user metadata
    const photoUrl = user?.user_metadata?.profile_photo_url;
    if (photoUrl) {
      setProfileImage(photoUrl);
    }
  };

  // Profielfoto wijzigen is uitgeschakeld
  const handleDeleteAccount = async () => {
    if (!user) return;
    Alert.alert(
      'Account verwijderen',
      'Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen', style: 'destructive', onPress: async () => {
            try {
              // Voeg verzoek toe aan Supabase-tabel
              const { error } = await supabase.from('delete_requests').insert([
                {
                  user_id: user.id,
                  email: user.email,
                  requested_at: new Date().toISOString(),
                },
              ]);
              if (error) throw error;
              Alert.alert('Verzoek verzonden', 'Uw verzoek is verzonden. Uw account wordt binnen enkele dagen verwijderd.');
              await signOut();
            } catch (error) {
              let msg = 'Kon verzoek niet verzenden';
              if (error.message) {
                msg += `: ${error.message}`;
              }
              Alert.alert('Fout', msg);
            }
          }
        }
      ]
    );
  };

  const displayName = user?.name || user?.user_metadata?.name || 'naam van profiel';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 0 }}>
        {/* Header met terugknop en titel */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Account</Text>
          <View style={{ width: 28 }} />
        </View>
        {/* Profielcirkel en naam */}
        <View style={[styles.profileHeader, { backgroundColor: colors.background }]}>
          <View 
            style={styles.profileImageContainer}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileCircle, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.profileInitial, { color: colors.primary }]}>
                  {displayName[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {`"${displayName}"`}
          </Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EditName')}>
            <Text style={[styles.rowText, { color: colors.text }]}>Naam bewerken</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EditEmail')}>
            <Text style={[styles.rowText, { color: colors.text }]}>Wijzig e-mailadres</Text>
            <Text style={[styles.currentEmail, { color: colors.textSecondary }]}>{user?.email || ''}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EditPassword')}>
            <Text style={[styles.rowText, { color: colors.text }]}>Wijzig wachtwoord</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <TouchableOpacity style={styles.row} onPress={signOut}>
            <Text style={[styles.rowText, { color: colors.error }]}>Uitloggen</Text>
            <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.deleteAccount} onPress={handleDeleteAccount}>
          <Text style={[styles.deleteAccountText, { color: colors.textSecondary }]}>verwijder account</Text>
        </TouchableOpacity>
      </ScrollView>
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
  profileHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 0,
    paddingVertical: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  rowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginLeft: 20,
  },
  deleteAccount: {
    alignItems: 'flex-start',
    marginLeft: 24,
    marginTop: 16,
  },
  deleteAccountText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  currentEmail: {
    fontSize: 13,
    marginRight: 8,
    marginLeft: 8,
    flexShrink: 1,
    maxWidth: 120,
    textAlign: 'right',
  },
}); 