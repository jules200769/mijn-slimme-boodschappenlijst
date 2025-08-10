import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../lib/notifications';
import notificationTriggers from '../lib/notificationTriggers';

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // State management
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [settings, setSettings] = useState({
    shoppingReminders: true,
    itemAdded: false, // Standaard uit voor nieuwe gebruikers
    listShared: true,
    weeklyReminders: false,
    inactivityReminders: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllSettings();
  }, []);

  // Load all notification settings from AsyncStorage
  const loadAllSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load app-level notification setting
      const appNotificationEnabled = await AsyncStorage.getItem('appNotificationEnabled');
      const appEnabled = appNotificationEnabled !== null ? JSON.parse(appNotificationEnabled) : false;
      setIsEnabled(appEnabled);
      
      // Load specific notification settings
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        
        // Force notificationTriggers to reload settings
        await notificationTriggers.forceReloadSettings();
      }
      
      // Check permissions
      await checkNotificationPermissions();
      
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save notification settings and update notificationTriggers
  const saveNotificationSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      
      // Force notificationTriggers to reload with new settings
      await notificationTriggers.forceReloadSettings();
      
      console.log('Notification settings saved:', newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  // Save app-level notification setting
  const saveAppNotificationSetting = async (enabled) => {
    try {
      await AsyncStorage.setItem('appNotificationEnabled', JSON.stringify(enabled));
      setIsEnabled(enabled);
      
      // Force notificationTriggers to reload settings
      await notificationTriggers.forceReloadSettings();
      
      console.log('App notification setting saved:', enabled);
    } catch (error) {
      console.error('Error saving app notification setting:', error);
    }
  };

  // Check notification permissions
  const checkNotificationPermissions = async () => {
    try {
      const permissions = await notificationService.getNotificationPermissions();
      setHasPermissions(permissions.status === 'granted');
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  // Toggle main notification switch - NIEUWE IMPLEMENTATIE
  const toggleMainNotification = async () => {
    if (isEnabled) {
      // Turn off main notifications - disable all specific settings
      const newSettings = {
        shoppingReminders: false,
        itemAdded: false,
        listShared: false,
        weeklyReminders: false,
        inactivityReminders: false,
      };
      
      await saveNotificationSettings(newSettings);
      await saveAppNotificationSetting(false);
      
      Alert.alert(
        'Alle Notificaties Uitgeschakeld',
        'Alle notificaties zijn nu uitgeschakeld.'
      );
    } else {
      // Turn on main notifications - request permissions and enable all settings EXCEPT itemAdded
      const token = await notificationService.registerForPushNotificationsAsync();
      if (token) {
        setHasPermissions(true);
        
        // Enable all notification settings EXCEPT itemAdded (keep it false for new users)
        const newSettings = {
          shoppingReminders: true,
          itemAdded: false, // Blijft uit voor nieuwe gebruikers
          listShared: true,
          weeklyReminders: true,
          inactivityReminders: true,
        };
        
        await saveNotificationSettings(newSettings);
        await saveAppNotificationSetting(true);
        
        Alert.alert(
          'Alle Notificaties Ingeschakeld',
          'Alle notificaties zijn nu ingeschakeld! (Items Toegevoegd blijft uit)'
        );
      } else {
        Alert.alert(
          'Toestemming Geweigerd',
          'Je kunt notificaties later inschakelen in je telefoon instellingen.'
        );
      }
    }
  };

  // Toggle individual notification setting - NIEUWE IMPLEMENTATIE
  const toggleSetting = async (key) => {
    // Only allow toggling if app-level notifications are enabled
    if (!isEnabled) {
      Alert.alert(
        'Notificaties Uitgeschakeld',
        'Schakel eerst "Alle Notificaties" in om deze instelling te wijzigen.'
      );
      return;
    }
    
    const newSettings = { ...settings, [key]: !settings[key] };
    await saveNotificationSettings(newSettings);
    
    // Geen automatische test meer
    
    console.log(`Toggled ${key} to: ${newSettings[key]}`);
  };

  // Verwijderd: test notificatie functies en UI

  // Open system settings
  const openSystemSettings = () => {
    Alert.alert(
      'Instellingen Openen',
      'Ga naar je telefoon instellingen om notificatie permissies te beheren.',
      [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Instellingen', onPress: () => {
          // Hier zou je de system settings kunnen openen
          // Voor nu tonen we alleen een alert
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 0 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notificaties</Text>
          <View style={{ width: 24 }} />
        </View>

        {isLoading ? (
          <View style={[styles.section, { backgroundColor: colors.surface, alignItems: 'center', padding: 40 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Instellingen laden...</Text>
          </View>
        ) : (
          <>
            {/* Combined Permissions and Notification Types Section */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Toestemmingen</Text>
              
              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <MaterialCommunityIcons name="bell" size={24} color={colors.primary} />
                  <View style={styles.textContainer}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>Alle Notificaties</Text>
                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                      {isEnabled ? 'Alle notificaties aan' : 'Alle notificaties uit'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={toggleMainNotification}
                  trackColor={{ false: colors.switchTrack, true: colors.switchActive }}
                  thumbColor={colors.switchThumb}
                  ios_backgroundColor={colors.switchTrack}
                />
              </View>

              {!isEnabled && (
                <View style={styles.disabledMessage}>
                  <Text style={[styles.disabledMessageText, { color: colors.textSecondary }]}>
                    Alle notificaties uitgeschakeld
                  </Text>
                </View>
              )}

              {!hasPermissions && isEnabled && (
                <View style={styles.disabledMessage}>
                  <Text style={[styles.disabledMessageText, { color: colors.warning }]}>
                    Toestemming vereist - tik op de switch om toestemming te vragen
                  </Text>
                </View>
              )}

              {!hasPermissions && (
                <TouchableOpacity style={styles.settingsButton} onPress={openSystemSettings}>
                  <Text style={[styles.settingsButtonText, { color: colors.primary }]}>
                    Open Instellingen
                  </Text>
                </TouchableOpacity>
              )}

              <View style={[styles.divider, { backgroundColor: colors.divider, marginTop: 16 }]} />

              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>Soorten Notificaties</Text>
              
              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <MaterialCommunityIcons name="cart" size={24} color={colors.success} />
                  <View style={styles.textContainer}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>Boodschappen Herinneringen</Text>
                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                      Herinneringen voor je boodschappenlijsten
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.shoppingReminders}
                  onValueChange={() => toggleSetting('shoppingReminders')}
                  trackColor={{ false: colors.switchTrack, true: colors.switchActive }}
                  thumbColor={colors.switchThumb}
                  ios_backgroundColor={colors.switchTrack}
                  disabled={!isEnabled}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <MaterialCommunityIcons name="plus-circle" size={24} color={colors.info} />
                  <View style={styles.textContainer}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>Items Toegevoegd</Text>
                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                      Wanneer iemand een item toevoegt
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.itemAdded}
                  onValueChange={() => toggleSetting('itemAdded')}
                  trackColor={{ false: colors.switchTrack, true: colors.switchActive }}
                  thumbColor={colors.switchThumb}
                  ios_backgroundColor={colors.switchTrack}
                  disabled={!isEnabled}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <MaterialCommunityIcons name="share-variant" size={24} color={colors.warning} />
                  <View style={styles.textContainer}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>Lijsten Gedeeld</Text>
                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                      Wanneer iemand een lijst met je deelt
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.listShared}
                  onValueChange={() => toggleSetting('listShared')}
                  trackColor={{ false: colors.switchTrack, true: colors.switchActive }}
                  thumbColor={colors.switchThumb}
                  ios_backgroundColor={colors.switchTrack}
                  disabled={!isEnabled}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <MaterialCommunityIcons name="calendar-week" size={24} color={colors.secondary} />
                  <View style={styles.textContainer}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>Wekelijkse Herinneringen</Text>
                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                      Wekelijkse herinneringen voor boodschappen
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.weeklyReminders}
                  onValueChange={() => toggleSetting('weeklyReminders')}
                  trackColor={{ false: colors.switchTrack, true: colors.switchActive }}
                  thumbColor={colors.switchThumb}
                  ios_backgroundColor={colors.switchTrack}
                  disabled={!isEnabled}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color={colors.error} />
                  <View style={styles.textContainer}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>Inactiviteit Herinneringen</Text>
                    <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                      Herinnering na 1 week geen activiteit
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.inactivityReminders}
                  onValueChange={() => toggleSetting('inactivityReminders')}
                  trackColor={{ false: colors.switchTrack, true: colors.switchActive }}
                  thumbColor={colors.switchThumb}
                  ios_backgroundColor={colors.switchTrack}
                  disabled={!isEnabled}
                />
              </View>
            </View>

            {/* Testsectie verwijderd */}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  settingsButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledMessage: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  disabledMessageText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
}); 