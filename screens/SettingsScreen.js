import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { signOut, user } = useAuth();
  // Voeg hier states toe voor switches als je die wilt gebruiken
  // Voorbeeld: const [openLastList, setOpenLastList] = React.useState(false);
  const displayName = user?.name || user?.user_metadata?.name || 'naam van profiel';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <ScrollView contentContainerStyle={{ padding: 0 }}>
        {/* Profiel header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>
              {displayName[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {`"${displayName}"`}
          </Text>
        </View>
        {/* Profiel bewerken knop */}
        <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editProfileText}>Profiel bewerken</Text>
        </TouchableOpacity>

        {/* ALGEMEEN */}
        <Text style={styles.sectionLabel}>ALGEMEEN</Text>
        <View style={styles.sectionCard}>
          {/* Profiel bewerken */}
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.rowText}>Profiel bewerken</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#bbb" />
          </TouchableOpacity>
          <View style={styles.divider} />
          {/* Verwijderd: Taal keuze */}
          {/* Extra opties als placeholder */}
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Notificaties beheren</Text>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#bbb" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Privacy-instellingen</Text>
            <MaterialCommunityIcons name="shield-outline" size={24} color="#bbb" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Feedback geven</Text>
            <MaterialCommunityIcons name="message-outline" size={24} color="#bbb" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Help & Support</Text>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#bbb" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Over deze app</Text>
            <MaterialCommunityIcons name="information-outline" size={24} color="#bbb" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Tutorial!</Text>
            <MaterialCommunityIcons name="school-outline" size={24} color="#bbb" />
          </TouchableOpacity>
          {/* Uitloggen knop onderaan */}
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={signOut}>
            <Text style={[styles.rowText, { color: '#e53935' }]}>Uitloggen</Text>
            <MaterialCommunityIcons name="logout" size={24} color="#e53935" />
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
    backgroundColor: '#f7f7f7',
  },
  profileCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c4dff',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionLabel: {
    marginLeft: 24,
    marginTop: 16,
    marginBottom: 4,
    fontSize: 13,
    color: '#888',
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  sectionCard: {
    backgroundColor: '#fff',
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
    color: '#222',
    fontWeight: 'bold',
  },
  rowSubText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  rowHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 20,
  },
  editProfileButton: {
    alignItems: 'center',
    marginBottom: 8,
  },
  editProfileText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
}); 