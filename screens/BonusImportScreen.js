import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  TextInput,
  FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { bonusService } from '../lib/bonusService';
import BonusBadge from '../components/BonusBadge';

export default function BonusImportScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [bonusData, setBonusData] = useState([]);
  const [jsonInput, setJsonInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    loadBonusData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = bonusData.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(bonusData);
    }
  }, [searchTerm, bonusData]);

  const loadBonusData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await bonusService.getBonusData(user.id);
      if (error) {
        Alert.alert('Fout', 'Kon bonusdata niet laden');
        return;
      }
      setBonusData(data || []);
    } catch (error) {
      Alert.alert('Fout', 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const importBonusData = async () => {
    if (!jsonInput.trim()) {
      Alert.alert('Fout', 'Voer eerst JSON data in');
      return;
    }

    setImporting(true);
    try {
      const parsedData = bonusService.parseBonusData(jsonInput);
      
      if (parsedData.length === 0) {
        Alert.alert('Fout', 'Geen geldige bonusdata gevonden');
        return;
      }

      const { error } = await bonusService.saveBonusData(user.id, parsedData);
      
      if (error) {
        Alert.alert('Fout', 'Kon bonusdata niet opslaan');
        return;
      }

      Alert.alert(
        'Succes', 
        `${parsedData.length} bonusproducten geïmporteerd!`,
        [{ text: 'OK', onPress: () => {
          setJsonInput('');
          loadBonusData();
        }}]
      );
    } catch (error) {
      Alert.alert('Fout', 'Ongeldige JSON data');
    } finally {
      setImporting(false);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Bevestig',
      'Weet je zeker dat je alle bonusdata wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Verwijderen', style: 'destructive', onPress: () => {
          // Implement clear functionality
          setBonusData([]);
        }}
      ]
    );
  };

  const renderBonusItem = ({ item }) => (
    <View style={[styles.bonusItem, { backgroundColor: colors.card }]}>
      <View style={styles.itemHeader}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <BonusBadge bonus={item} />
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={[styles.category, { color: colors.textSecondary }]}>
          {item.category}
        </Text>
        <Text style={[styles.week, { color: colors.textSecondary }]}>
          Week {item.week}
        </Text>
      </View>
      
      {item.price && (
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>
            €{item.price.toFixed(2)}
          </Text>
          {item.original_price && item.original_price !== item.price && (
            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
              €{item.original_price.toFixed(2)}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Bonus Import</Text>
        <TouchableOpacity onPress={clearAllData} style={styles.clearButton}>
          <MaterialCommunityIcons name="delete" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Import Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Importeer Bonus Data
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Plak hier je JSON bonusdata van Albert Heijn
          </Text>
          
          <TextInput
            style={[styles.jsonInput, { 
              backgroundColor: colors.background, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            multiline
            numberOfLines={8}
            placeholder="Plak hier je JSON data..."
            placeholderTextColor={colors.textSecondary}
            value={jsonInput}
            onChangeText={setJsonInput}
          />
          
          <TouchableOpacity
            style={[styles.importButton, { backgroundColor: colors.primary }]}
            onPress={importBonusData}
            disabled={importing}
          >
            {importing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={[styles.importButtonText, { color: colors.white }]}>
                Importeer Data
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Bonus Producten ({filteredData.length})
          </Text>
          
          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: colors.background, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder="Zoek in bonusproducten..."
            placeholderTextColor={colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Bonus List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Laden...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderBonusItem}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  jsonInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  importButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  bonusItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
  },
  week: {
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
});
