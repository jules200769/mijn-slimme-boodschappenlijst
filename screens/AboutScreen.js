import React from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Over deze app</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Content */}
        <View style={styles.content}>
          {/* App Icon/Logo */}
          <View style={styles.appIconContainer}>
            <View style={[styles.appIcon, { backgroundColor: colors.background }]}>
              <MaterialCommunityIcons name="cart" size={48} color="#37af29" />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>check it!</Text>
            <Text style={[styles.appVersion, { color: colors.textSecondary }]}>v1.0.0</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#37af29' }]}>Welkom bij check it!</Text>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              De slimme manier om jouw boodschappen te organiseren en samen te werken. Of je nu alleen boodschappen doet of samenwerkt met familie, huisgenoten of vrienden: deze app helpt je om altijd overzicht te houden.
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#37af29' }]}>✨ Wat maakt deze app bijzonder?</Text>
            
            <View style={styles.featureItem}>
              <Text style={[styles.featureTitle, { color: '#37af29' }]}>Real-time samenwerking</Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>
                Met real-time synchronisatie beheer je eenvoudig je boodschappenlijst, waar je ook bent. Voeg producten toe, vink ze af, en zie direct wat anderen hebben bijgewerkt.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={[styles.featureTitle, { color: '#37af29' }]}>Altijd bereikbaar</Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>
                Dankzij handige pushmeldingen blijf je altijd op de hoogte. Ook offline werkt de app gewoon door, zodat je nooit iets vergeet – zelfs zonder internetverbinding.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={[styles.featureTitle, { color: '#37af29' }]}>Slim delen</Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>
                Je kunt lijsten delen met anderen en samenwerken als team. Zo maak je samen boodschappen doen niet alleen makkelijker, maar ook efficiënter.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={[styles.featureTitle, { color: '#37af29' }]}>Gebruiksvriendelijk</Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>
                Alles gebeurt in een moderne, intuïtieve omgeving die ontworpen is met oog voor eenvoud en comfort. Geen ingewikkelde menu's, gewoon doen wat je wilt.
              </Text>
            </View>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#37af29' }]}>🎯 Onze missie</Text>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              Deze app is ontwikkeld door <Text style={[styles.boldText, { color: '#37af29' }]}>Team JuNiX</Text> met als doel jouw dagelijkse boodschappenplanning slimmer te maken – zonder gedoe. We geloven dat technologie het leven eenvoudiger moet maken, niet ingewikkelder.
            </Text>
          </View>

          {/* Perfect For Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#37af29' }]}>💡 Perfect voor:</Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: colors.text }]}>• Individuele boodschappers</Text>
              <Text style={[styles.bulletItem, { color: colors.text }]}>• Gezinnen en huisgenoten</Text>
              <Text style={[styles.bulletItem, { color: colors.text }]}>• Studentenhuizen</Text>
              <Text style={[styles.bulletItem, { color: colors.text }]}>• Vriendengroepen</Text>
              <Text style={[styles.bulletItem, { color: colors.text }]}>• Iedereen die overzicht wil houden</Text>
            </View>
          </View>

          {/* Closing */}
          <View style={styles.section}>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              We hopen dat je er net zo blij van wordt als wij. Veel winkelplezier!
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.footerDivider, { backgroundColor: colors.divider }]} />
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>Versie: v1.0.0</Text>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>Platformen: iOS & Android</Text>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>Ontwikkeld door: Team JuNiX</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  appIconContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    letterSpacing: -0.5,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.5,
            color: '#37af29',
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.5,
    color: '#555',
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: 'bold',
    letterSpacing: -0.5,
    color: '#333',
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.5,
    color: '#555',
    marginBottom: 4,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 13,
    letterSpacing: -0.5,
    color: '#888',
    textAlign: 'center',
    marginBottom: 4,
  },
}); 