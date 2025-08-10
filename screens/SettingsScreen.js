import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import notificationTriggers from '../lib/notificationTriggers';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const displayName = user?.name || user?.user_metadata?.name || 'naam van profiel';
  const profilePhotoUrl = user?.user_metadata?.profile_photo_url;

  // Track user activity when settings screen loads
  useEffect(() => {
    if (user) {
      notificationTriggers.trackUserActivity();
    }
  }, [user]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 0 }}>
        {/* Profiel header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.background }]}>
          {profilePhotoUrl ? (
            <Image source={{ uri: profilePhotoUrl }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileCircle, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.profileInitial, { color: colors.primary }]}>
                {displayName[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text style={[styles.profileName, { color: colors.text }]}>
            {`"${displayName}"`}
          </Text>
        </View>
        {/* Profiel bewerken knop */}
        <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={[styles.editProfileText, { color: colors.success }]}>Profiel bewerken</Text>
        </TouchableOpacity>

        {/* ALGEMEEN */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ALGEMEEN</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          {/* Profiel bewerken */}
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={[styles.rowText, { color: colors.text }]}>Profiel bewerken</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          {/* Thema toggle */}
          <View style={styles.row}>
            <Text style={[styles.rowText, { color: colors.text }]}>Thema</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.rowText, { color: colors.textSecondary, marginRight: 8 }]}>
                {isDarkMode ? 'donker' : 'licht'}
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.switchTrack, true: colors.switchActive }}
                thumbColor={colors.switchThumb}
                ios_backgroundColor={colors.switchTrack}
              />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          {/* Verwijderd: Taal keuze */}
          {/* Extra opties als placeholder */}
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('NotificationSettings')}>
            <Text style={[styles.rowText, { color: colors.text }]}>Notificaties beheren</Text>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Feedback')}>
            <Text style={[styles.rowText, { color: colors.text }]}>Feedback geven</Text>
            <MaterialCommunityIcons name="message-outline" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HelpSupport')}>
            <Text style={[styles.rowText, { color: colors.text }]}>Help & Support</Text>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('About')}>
            <Text style={[styles.rowText, { color: colors.text }]}>Over deze app..</Text>
            <MaterialCommunityIcons name="information-outline" size={24} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Uitloggen knop onderaan */}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <TouchableOpacity style={styles.row} onPress={signOut}>
            <Text style={[styles.rowText, { color: colors.error }]}>Uitloggen</Text>
            <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
        {/* LIJSTEN */}
        {/* Verwijderd: alle opties onder LIJSTEN */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  profileCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionLabel: {
    marginLeft: 24,
    marginTop: 16,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  sectionCard: {
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
  rowSubText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  rowHint: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 20,
  },
  editProfileButton: {
    alignItems: 'center',
    marginBottom: 8,
  },
  editProfileText: {
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
}); 