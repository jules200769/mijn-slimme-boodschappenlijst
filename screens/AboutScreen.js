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

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Over deze app</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* App Icon/Logo */}
          <View style={styles.appIconContainer}>
            <View style={styles.appIcon}>
              <MaterialCommunityIcons name="cart" size={48} color="#37af29" />
            </View>
            <Text style={styles.appName}>Mijn slimme Boodschappenlijst</Text>
            <Text style={styles.appVersion}>v1.0.0</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Welkom bij Mijn slimme Boodschappenlijst</Text>
            <Text style={styles.bodyText}>
              De slimme manier om jouw boodschappen te organiseren en samen te werken. Of je nu alleen boodschappen doet of samenwerkt met familie, huisgenoten of vrienden: deze app helpt je om altijd overzicht te houden.
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Wat maakt deze app bijzonder?</Text>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>Real-time samenwerking</Text>
              <Text style={styles.bodyText}>
                Met real-time synchronisatie beheer je eenvoudig je boodschappenlijst, waar je ook bent. Voeg producten toe, vink ze af, en zie direct wat anderen hebben bijgewerkt.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>Altijd bereikbaar</Text>
              <Text style={styles.bodyText}>
                Dankzij handige pushmeldingen blijf je altijd op de hoogte. Ook offline werkt de app gewoon door, zodat je nooit iets vergeet – zelfs zonder internetverbinding.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>Slim delen</Text>
              <Text style={styles.bodyText}>
                Je kunt lijsten delen met anderen en samenwerken als team. Zo maak je samen boodschappen doen niet alleen makkelijker, maar ook efficiënter.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>Gebruiksvriendelijk</Text>
              <Text style={styles.bodyText}>
                Alles gebeurt in een moderne, intuïtieve omgeving die ontworpen is met oog voor eenvoud en comfort. Geen ingewikkelde menu's, gewoon doen wat je wilt.
              </Text>
            </View>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Onze missie</Text>
            <Text style={styles.bodyText}>
              Deze app is ontwikkeld door <Text style={styles.boldText}>Team JuNiX</Text> met als doel jouw dagelijkse boodschappenplanning slimmer te maken – zonder gedoe. We geloven dat technologie het leven eenvoudiger moet maken, niet ingewikkelder.
            </Text>
          </View>

          {/* Perfect For Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Perfect voor:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Individuele boodschappers</Text>
              <Text style={styles.bulletItem}>• Gezinnen en huisgenoten</Text>
              <Text style={styles.bulletItem}>• Studentenhuizen</Text>
              <Text style={styles.bulletItem}>• Vriendengroepen</Text>
              <Text style={styles.bulletItem}>• Iedereen die overzicht wil houden</Text>
            </View>
          </View>

          {/* Closing */}
          <View style={styles.section}>
            <Text style={styles.bodyText}>
              We hopen dat je er net zo blij van wordt als wij. Veel winkelplezier!
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>Versie: v1.0.0</Text>
            <Text style={styles.footerText}>Platformen: iOS & Android</Text>
            <Text style={styles.footerText}>Ontwikkeld door: Team JuNiX</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
            color: '#37af29',
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 22,
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
    color: '#888',
    textAlign: 'center',
    marginBottom: 4,
  },
}); 