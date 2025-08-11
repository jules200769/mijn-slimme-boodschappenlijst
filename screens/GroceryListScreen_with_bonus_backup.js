import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal, TextInput, FlatList, Alert, KeyboardAvoidingView, Platform, Animated, Share } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { lists, supabase, sharedLists } from '../lib/supabase';
import notificationTriggers from '../lib/notificationTriggers';


// HighlightedText component aanpassen
const HighlightedText = ({ text, highlight, style, showHighlight = true, colors }) => {
  if (!showHighlight || !highlight) {
    return <Text style={style}>{text}</Text>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <Text style={style}>
      {parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={index} style={[style, { backgroundColor: colors?.primaryLight || '#e3f2fd', fontWeight: 'bold' }]}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
};

// Storage keys
const STORAGE_KEY = 'grocery_lists';

const POPULAIRE_PRODUCTEN = [
  'Melk', 'Brood', 'Kaas', 'Eieren', 'Appels', 'Bananen', 'Yoghurt', 'Kipfilet', 'Rijst', 'Pasta',
  'Aardappelen', 'Tomaten', 'Komkommer', 'Paprika', 'Wortels', 'Uien', 'Knoflook', 'Sla', 'Spinazie', 'Courgette',
  'Aubergine', 'Prei', 'Boontjes', 'Bloemkool', 'Broccoli', 'Spruitjes', 'Champignons', 'Avocado', 'Sinaasappels', 'Mandarijnen',
  'Peren', 'Druiven', 'Aardbeien', 'Blauwe bessen', 'Frambozen', 'Watermeloen', 'Citroen', 'Limoen', 'Ananas', 'Mango',
  'Kip', 'Rundergehakt', 'Varkenshaas', 'Zalm', 'Tonijn', 'Garnalen', 'Haring', 'Makreel', 'Kabeljauw', 'Vissticks',
  'Ham', 'Salami', 'Kipfilet (beleg)', 'Rookworst', 'Boter', 'Margarine', 'Roomkaas', 'Hüttenkäse', 'Crème fraîche', 'Slagroom',
  'Chocoladepasta', 'Pindakaas', 'Hagelslag', 'Jam', 'Honing', 'Suiker', 'Bloem', 'Bakpoeder', 'Vanillesuiker', 'Zout',
  'Peper', 'Kruidenmix', 'Olijfolie', 'Zonnebloemolie', 'Azijn', 'Sojasaus', 'Ketchup', 'Mayonaise', 'Mosterd', 'Satésaus',
  'Chips', 'Nootjes', 'Popcorn', 'Koekjes', 'Ontbijtkoek', 'Muesli', 'Cornflakes', 'Crackers', 'Wasa', 'Beschuit',
  'Thee', 'Koffie', 'Frisdrank', 'Sinaasappelsap', 'Appelsap', 'Bier', 'Wijn', 'Water', 'IJs', 'Pizza',
  // Nieuwe producten (100 extra)
  'Kiwi', 'Grapefruit', 'Nectarines', 'Abrikozen', 'Pruimen', 'Kersen', 'Bramen', 'Kruisbessen', 'Vijgen', 'Granaatappel',
  'Lychee', 'Passievrucht', 'Guave', 'Papaya', 'Kokosnoot', 'Dragonfruit', 'Starfruit', 'Rambutan', 'Mangosteen', 'Longan',
  'Asperges', 'Artisjok', 'Bleekselderij', 'Rode bieten', 'Radijs', 'Rettich', 'Paksoi', 'Bok choy', 'Koolrabi', 'Snijbiet',
  'Rucola', 'Waterkers', 'Postelein', 'Veldsla', 'Kropsla', 'Ijsbergsla', 'Romaine sla', 'Endive', 'Witlof', 'Andijvie',
  'Pompoen', 'Butternut squash', 'Patisson', 'Courgette geel', 'Aubergine paars', 'Aubergine wit', 'Tomatillos', 'Okra', 'Bamboescheuten', 'Lotuswortel',
  'Runderlappen', 'Varkenshaas', 'Lamsvlees', 'Kalkoenfilet', 'Eend', 'Gans', 'Konijn', 'Wild zwijn', 'Hertenvlees', 'Kwartel',
  'Forel', 'Heilbot', 'Koolvis', 'Sardines', 'Ansjovis', 'Oesters', 'Mosselen', 'Kreeft', 'Krab', 'Kreeftenstaart',
  'Gouda', 'Edammer', 'Brie', 'Camembert', 'Feta', 'Parmezaan', 'Mozzarella', 'Cheddar', 'Gorgonzola', 'Roquefort',
  'Karnemelk', 'Kefir', 'Kwark', 'Skyr', 'Griekse yoghurt', 'Bulgaarse yoghurt', 'Kokosyoghurt', 'Amandelmelk', 'Havermelk', 'Sojamelk',
  'Cola', 'Sprite', 'Fanta', '7-Up', 'Pepsi', 'Dr Pepper', 'Mountain Dew', 'Red Bull', 'Monster', 'Rockstar',
  'Limonade', 'Ice tea', 'Vruchtensap', 'Groentesap', 'Smoothie', 'Milkshake', 'Hot chocolate', 'Espresso', 'Cappuccino', 'Latte',
  'Bitterballen', 'Kroketten', 'Frikandel', 'Bamischijf', 'Kaassoufflé', 'Nasischijf', 'Loempia', 'Springroll', 'Dim sum', 'Sushi',
  'Marshmallows', 'Liquorice', 'Winegums', 'Toffees', 'Caramels', 'Chocolade', 'M&M\'s', 'Skittles', 'Haribo', 'Stroopwafels',
  'Speculaas', 'Gevulde koek', 'Boterkoek', 'Appeltaart', 'Cheesecake', 'Tiramisu', 'Chocolademousse', 'IJscoupe', 'Sorbet', 'Frozen yoghurt',
  'Basilicum', 'Oregano', 'Tijm', 'Rozemarijn', 'Salie', 'Laurier', 'Kurkuma', 'Gember', 'Kaneel', 'Nootmuskaat',
  'Chilipepers', 'Jalapeños', 'Habanero', 'Poblano', 'Serrano', 'Cayenne', 'Paprika poeder', 'Curry', 'Garam masala', 'Ras el hanout',
  'Kikkererwten', 'Linzen', 'Kidneybonen', 'Zwarte bonen', 'Witte bonen', 'Bruine bonen', 'Spliterwten', 'Kapucijners', 'Doperwten', 'Bonen',
  'Quinoa', 'Bulgur', 'Couscous', 'Farro', 'Freekeh', 'Spelt', 'Haver', 'Gerst', 'Rogge', 'Teff',
  'Pannenkoekenmix', 'Wafelmix', 'Cakemix', 'Brownie mix', 'Muffin mix', 'Pizza mix', 'Bread mix', 'Pasta mix', 'Risotto mix', 'Soep mix',
];

const CATEGORIEEN = [
  { naam: 'ALCOHOLISCHE DRANKEN', emoji: '🍷' },
  { naam: 'BABY', emoji: '🍼' },
  { naam: 'BAKKERIJPRODUCTEN', emoji: '🍞' },
  { naam: 'BAKPRODUCTEN', emoji: '🥧' },
  { naam: 'BLIKJES EN POTJES', emoji: '🥫' },
  { naam: 'DIEPVRIESPRODUCTEN', emoji: '❄️' },
  { naam: 'DRANKEN', emoji: '🥤' },
  { naam: 'DROGE PRODUCTEN', emoji: '🌾' },
  { naam: 'ELEKTRONICA', emoji: '💻' },
  { naam: 'FRUIT EN GROENTEN', emoji: '🍅' },
  { naam: 'GEZONDHEID', emoji: '💖' },
  { naam: 'HUISDIEREN', emoji: '🐾' },
  { naam: 'ZUIVELPRODUCTEN EN EIEREN', emoji: '🧀' },
  // ... meer categorieën ...
];

// Voeg een lijst met categorieën toe voor het grid
const CATEGORIE_GRID = [
  { naam: 'Fruit', emoji: '🍎' },
  { naam: 'Groente', emoji: '🥦' },
  { naam: 'Brood & Bakkerij', emoji: '🍞' },
  { naam: 'Broodbeleg', emoji: '🥪' },
  { naam: 'Vlees', emoji: '🥩' },
  { naam: 'Vis', emoji: '🐟' },
  { naam: 'Zuivel', emoji: '🥛' },
  { naam: 'Vleeswaren', emoji: '🥓' },
  { naam: 'Frisdrank', emoji: '🥤' },
  { naam: 'Alcoholische dranken', emoji: '🍷' },
  { naam: 'Warme dranken', emoji: '☕' },
  { naam: 'Chips & Nootjes', emoji: '🥜' },
  { naam: 'Snoep & Koek', emoji: '🍬' },
  { naam: 'Diepvries', emoji: '🧊' },
  { naam: 'Ontbijtgranen', emoji: '🥣' },
  { naam: 'Kruiden & Sauzen', emoji: '🧂' },
  { naam: 'Droge producten', emoji: '🌾' },
  { naam: 'Conserven', emoji: '🥫' },
  { naam: 'Rijst & Pasta', emoji: '🍚' },
  { naam: 'Overig', emoji: '🛒' },
];

// Voeg bovenaan het bestand een mapping toe van producten naar categorieën:
const PRODUCT_CATEGORIE_MAPPING = {
  'Fruit': [
    'Appels', 'Bananen', 'Sinaasappels', 'Mandarijnen', 'Peren', 'Druiven', 'Aardbeien', 'Blauwe bessen', 'Frambozen', 'Watermeloen', 'Citroen', 'Limoen', 'Ananas', 'Mango',
    'Kiwi', 'Grapefruit', 'Nectarines', 'Abrikozen', 'Pruimen', 'Kersen', 'Bramen', 'Kruisbessen', 'Vijgen', 'Granaatappel',
    'Lychee', 'Passievrucht', 'Guave', 'Papaya', 'Kokosnoot', 'Dragonfruit', 'Starfruit', 'Rambutan', 'Mangosteen', 'Longan',
  ],
  'Groente': [
    'Tomaten', 'Komkommer', 'Paprika', 'Wortels', 'Uien', 'Knoflook', 'Sla', 'Spinazie', 'Courgette', 'Aubergine', 'Prei', 'Boontjes', 'Bloemkool', 'Broccoli', 'Spruitjes', 'Champignons', 'Avocado',
    'Asperges', 'Artisjok', 'Bleekselderij', 'Rode bieten', 'Radijs', 'Rettich', 'Paksoi', 'Bok choy', 'Koolrabi', 'Snijbiet',
    'Rucola', 'Waterkers', 'Postelein', 'Veldsla', 'Kropsla', 'Ijsbergsla', 'Romaine sla', 'Endive', 'Witlof', 'Andijvie',
    'Pompoen', 'Butternut squash', 'Patisson', 'Courgette geel', 'Aubergine paars', 'Aubergine wit', 'Tomatillos', 'Okra', 'Bamboescheuten', 'Lotuswortel',
  ],
  'Brood & Bakkerij': [
    'Brood', 'Ontbijtkoek', 'Crackers', 'Wasa', 'Beschuit',
    'Pannenkoekenmix', 'Wafelmix', 'Cakemix', 'Brownie mix', 'Muffin mix', 'Pizza mix', 'Bread mix', 'Pasta mix', 'Risotto mix', 'Soep mix',
  ],
  'Broodbeleg': [
    'Pindakaas', 'Hagelslag', 'Jam', 'Honing', 'Chocoladepasta', 'Boter', 'Margarine', 'Roomkaas', 'Hüttenkäse', 'Crème fraîche',
  ],
  'Vlees': [
    'Kip', 'Rundergehakt', 'Varkenshaas', 'Runderlappen', 'Lamsvlees', 'Kalkoenfilet', 'Eend', 'Gans', 'Konijn', 'Wild zwijn', 'Hertenvlees', 'Kwartel',
  ],
  'Vis': [
    'Zalm', 'Tonijn', 'Garnalen', 'Haring', 'Makreel', 'Kabeljauw', 'Vissticks', 'Forel', 'Heilbot', 'Koolvis', 'Sardines', 'Ansjovis', 'Oesters', 'Mosselen', 'Kreeft', 'Krab', 'Kreeftenstaart',
  ],
  'Zuivel': [
    'Melk', 'Kaas', 'Eieren', 'Yoghurt', 'Slagroom',
    'Gouda', 'Edammer', 'Brie', 'Camembert', 'Feta', 'Parmezaan', 'Mozzarella', 'Cheddar', 'Gorgonzola', 'Roquefort',
    'Karnemelk', 'Kefir', 'Kwark', 'Skyr', 'Griekse yoghurt', 'Bulgaarse yoghurt', 'Kokosyoghurt', 'Amandelmelk', 'Havermelk', 'Sojamelk',
  ],
  'Vleeswaren': [
    'Ham', 'Salami', 'Kipfilet (beleg)', 'Rookworst',
  ],
  'Frisdrank': [
    'Frisdrank', 'Sinaasappelsap', 'Appelsap', 'Water',
    'Cola', 'Sprite', 'Fanta', '7-Up', 'Pepsi', 'Dr Pepper', 'Mountain Dew', 'Red Bull', 'Monster', 'Rockstar',
    'Limonade', 'Ice tea', 'Vruchtensap', 'Groentesap', 'Smoothie', 'Milkshake',
  ],
  'Alcoholische dranken': [
    'Bier', 'Wijn',
  ],
  'Warme dranken': [
    'Thee', 'Koffie', 'Hot chocolate', 'Espresso', 'Cappuccino', 'Latte',
  ],
  'Chips & Nootjes': [
    'Chips', 'Nootjes', 'Popcorn',
  ],
  'Snoep & Koek': [
    'Koekjes', 'Marshmallows', 'Liquorice', 'Winegums', 'Toffees', 'Caramels', 'Chocolade', 'M&M\'s', 'Skittles', 'Haribo', 'Stroopwafels',
    'Speculaas', 'Gevulde koek', 'Boterkoek', 'Appeltaart', 'Cheesecake', 'Tiramisu', 'Chocolademousse', 'IJscoupe', 'Sorbet', 'Frozen yoghurt',
  ],
  'Diepvries': [
    'IJs', 'Pizza',
  ],
  'Ontbijtgranen': [
    'Muesli', 'Cornflakes',
  ],
  'Kruiden & Sauzen': [
    'Peper', 'Kruidenmix', 'Olijfolie', 'Zonnebloemolie', 'Azijn', 'Sojasaus', 'Ketchup', 'Mayonaise', 'Mosterd', 'Satésaus',
    'Basilicum', 'Oregano', 'Tijm', 'Rozemarijn', 'Salie', 'Laurier', 'Kurkuma', 'Gember', 'Kaneel', 'Nootmuskaat',
    'Chilipepers', 'Jalapeños', 'Habanero', 'Poblano', 'Serrano', 'Cayenne', 'Paprika poeder', 'Curry', 'Garam masala', 'Ras el hanout',
  ],
  'Droge producten': [
    'Bloem', 'Bakpoeder', 'Vanillesuiker', 'Suiker', 'Zout',
    'Quinoa', 'Bulgur', 'Couscous', 'Farro', 'Freekeh', 'Spelt', 'Gerst', 'Rogge', 'Teff',
  ],
  'Conserven': [
    'Kikkererwten', 'Linzen', 'Kidneybonen', 'Zwarte bonen', 'Witte bonen', 'Bruine bonen', 'Spliterwten', 'Kapucijners', 'Doperwten', 'Bonen',
  ],
  'Rijst & Pasta': [
    'Rijst', 'Pasta',
  ],
  'Overig': [
    'Bitterballen', 'Kroketten', 'Frikandel', 'Bamischijf', 'Kaassoufflé', 'Nasischijf', 'Loempia', 'Springroll', 'Dim sum', 'Sushi',
  ],
};

export default function GroceryListScreen() {
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [lijsten, setLijsten] = useState([]);
  const [geselecteerdeLijst, setGeselecteerdeLijst] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toonProductModal, setToonProductModal] = useState(false);
  const [nieuweLijstNaam, setNieuweLijstNaam] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedListIds, setSelectedListIds] = useState([]);
  const [bonusData, setBonusData] = useState([]);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [showBonusModal, setShowBonusModal] = useState(false);
  


    // Laad lijsten bij app start en wanneer gebruiker verandert
  useEffect(() => {
    if (user) {
      loadLijsten();
      loadBonusData();
      setupRealtimeSubscriptions();
      
      // Track user activity when screen loads
      notificationTriggers.trackUserActivity();
    } else {
      setLijsten([]);
      setGeselecteerdeLijst(null);
      setBonusData([]);
    }

    // Cleanup subscriptions when component unmounts or user changes
    return () => {
      cleanupRealtimeSubscriptions();
    };
  }, [user]);

  // Real-time subscriptions setup
  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    console.log('setupRealtimeSubscriptions: Setting up real-time subscriptions');

    // Subscribe to personal lists changes
    const personalListsSubscription = supabase
      .channel('personal-lists')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'lists',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    // Subscribe to bonus products changes
    const bonusProductsSubscription = supabase
      .channel('bonus-products')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bonus_products',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          handleBonusRealtimeUpdate(payload);
        }
      )
      .subscribe();

    setRealtimeSubscriptions([
      personalListsSubscription,
      bonusProductsSubscription
    ]);
  };

  // Cleanup real-time subscriptions
  const cleanupRealtimeSubscriptions = () => {
    console.log('cleanupRealtimeSubscriptions: Cleaning up subscriptions');
    realtimeSubscriptions.forEach(subscription => {
      supabase.removeChannel(subscription);
    });
    setRealtimeSubscriptions([]);
  };



  // Handle real-time updates for lists
  const handleRealtimeUpdate = (payload) => {
    console.log('handleRealtimeUpdate: Processing update:', payload);
    
    if (payload.eventType === 'UPDATE') {
      const updatedList = payload.new;
      
      // Update the lists array
      setLijsten(prevLists => {
        const updatedLists = prevLists.map(list => {
          if (list.id === updatedList.id) {
            return {
              ...list,
              naam: updatedList.name,
              items: updatedList.items || [],
              code: updatedList.code
            };
          }
          return list;
        });
        return updatedLists;
      });

      // Update selected list if it's the one that changed
      if (geselecteerdeLijst && geselecteerdeLijst.id === updatedList.id) {
        const updatedSelectedList = {
          ...geselecteerdeLijst,
          naam: updatedList.name,
          items: updatedList.items || [],
          code: updatedList.code
        };
        setGeselecteerdeLijst(updatedSelectedList);
        console.log('Real-time: Updated selected list with', updatedList.items?.length || 0, 'items');
      }
    }
  };

  // Handle real-time updates for bonus products
  const handleBonusRealtimeUpdate = (payload) => {
    console.log('handleBonusRealtimeUpdate: Processing bonus update:', payload);
    
    // Reload bonus data when there are changes
    loadBonusData();
  };

  // Laad lijsten uit Supabase
  const loadLijsten = async () => {
    try {
      if (!user) {
        console.log('Geen gebruiker ingelogd');
        setIsLoading(false);
        return;
      }

      // Laad persoonlijke lijsten
      const { data: personalLists, error: personalError } = await lists.getLists(user.id);
      if (personalError) {
        console.error('Fout bij laden persoonlijke lijsten:', personalError);
      }



      // Persoonlijke lijsten
      const allLists = [];
      
      // Voeg persoonlijke lijsten toe
      if (personalLists) {
        const personalData = personalLists.map(list => ({
          id: list.id,
          naam: list.name,
          items: list.items || [],
          type: 'personal'
        }));
        allLists.push(...personalData);
      }
      


      console.log('loadLijsten: Loaded', allLists.length, 'lists total');
      setLijsten(allLists);
    } catch (error) {
      console.error('Fout bij laden lijsten:', error);
      setLijsten([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Laad bonus data
  const loadBonusData = async () => {
    try {
      if (!user) return;
      
      console.log('Loading bonus data for user:', user.id);
      const { data, error } = await bonusService.getBonusData(user.id);
      if (error) {
        console.error('Fout bij laden bonus data:', error);
        return;
      }
      
      console.log(`Loaded ${data?.length || 0} bonus products from database`);
      
      // Als er geen bonus data is, importeer automatisch
      if (!data || data.length === 0) {
        console.log('Geen bonus data gevonden, automatisch importeren...');
        try {
          const result = await bonusService.autoImportBonusData(user.id);
          if (result && result.success) {
            console.log('Bonus data automatisch geïmporteerd');
            // Herlaad de data na import
            const { data: newData, error: newError } = await bonusService.getBonusData(user.id);
            if (!newError) {
              console.log(`Reloaded ${newData?.length || 0} bonus products after import`);
              setBonusData(newData || []);
              // Debug bonus data na het laden
              debugBonusData();
            }
          } else {
            console.log('Auto-import result:', result);
            setBonusData([]);
          }
        } catch (importError) {
          console.error('Fout bij automatisch importeren bonus data:', importError);
          setBonusData([]);
        }
      } else {
        setBonusData(data);
        // Debug bonus data na het laden
        debugBonusData();
      }
    } catch (error) {
      console.error('Fout bij laden bonus data:', error);
    }
  };

  // Auto-import bonus data
  const handleAutoImportBonus = async () => {
    try {
      if (!user) return;
      
      const result = await bonusService.autoImportBonusData(user.id);
      if (result && result.success) {
        Alert.alert(
          'Bonus Data Geïmporteerd!',
          `${result.count} bonus producten zijn automatisch geïmporteerd. Je zult nu bonus badges zien naast producten die in de bonus zijn.`
        );
        // Reload bonus data
        loadBonusData();
      } else {
        console.log('Auto-import failed:', result);
        Alert.alert('Fout', 'Kon bonus data niet importeren. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('Fout bij auto-import bonus:', error);
      Alert.alert('Fout', 'Er is iets misgegaan bij het importeren van bonus data.');
    }
  };

  // Debug functie om bonus data te controleren
  const debugBonusData = async () => {
    try {
      if (!user) return;
      
      console.log('=== DEBUG BONUS DATA ===');
      
      // Check hoeveel bonus producten er in de database staan
      const { data: dbData, error: dbError } = await bonusService.getBonusData(user.id);
      if (dbError) {
        console.error('Error getting bonus data from DB:', dbError);
        return;
      }
      
      console.log(`Bonus products in database: ${dbData?.length || 0}`);
      
      // Check hoeveel fruit producten er zijn
      const fruitProducts = dbData?.filter(product => product.category === 'Fruit') || [];
      console.log(`Fruit products in database: ${fruitProducts.length}`);
      
      // Log alle fruit producten
      fruitProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - €${product.price} - ${product.bonus_description}`);
      });
      
      // Check hoeveel groente producten er zijn
      const groenteProducts = dbData?.filter(product => product.category === 'Groente') || [];
      console.log(`Groente products in database: ${groenteProducts.length}`);
      
      // Check specifiek voor druiven en aardbeien
      const druivenProducts = dbData?.filter(product => 
        product.name.toLowerCase().includes('druif')
      ) || [];
      const aardbeienProducts = dbData?.filter(product => 
        product.name.toLowerCase().includes('aardbei')
      ) || [];
      
      console.log(`Druiven products: ${druivenProducts.length}`);
      console.log(`Aardbeien products: ${aardbeienProducts.length}`);
      
      console.log('=== END DEBUG ===');
      
    } catch (error) {
      console.error('Error in debugBonusData:', error);
    }
  };

  // Maak een nieuwe lijst aan in Supabase
  const createNieuweLijst = async (lijstData) => {
    try {
      if (!user) return;

      // Converteer app formaat naar Supabase formaat
      const supabaseData = {
        name: lijstData.naam, // App gebruikt 'naam', Supabase verwacht 'name'
        items: lijstData.items || []
      };

      const { data, error } = await lists.createList(user.id, supabaseData);
      if (error) {
        console.error('Fout bij aanmaken lijst:', error);
        Alert.alert('Fout', 'Kon lijst niet aanmaken');
        return;
      }
      
      console.log('createNieuweLijst: Successfully created list:', data);
      
      // Voeg de nieuwe lijst toe aan de lokale state zonder alle lijsten opnieuw te laden
      const nieuweLijst = {
        id: data.id,
        naam: data.name,
        items: data.items || [],
        type: 'personal'
      };
      
      setLijsten(prevLists => [...prevLists, nieuweLijst]);
    } catch (error) {
      console.error('Fout bij aanmaken lijst:', error);
      Alert.alert('Fout', 'Kon lijst niet aanmaken');
    }
  };

  // Update een lijst in Supabase
  const updateLijst = async (lijstId, updates) => {
    try {
      // Converteer app formaat naar Supabase formaat
      const supabaseUpdates = {};
      if (updates.naam) {
        supabaseUpdates.name = updates.naam; // App gebruikt 'naam', Supabase verwacht 'name'
      }
      if (updates.items) {
        supabaseUpdates.items = updates.items;
      }

      // Update persoonlijke lijst
      const { error } = await lists.updateList(lijstId, supabaseUpdates);
      if (error) {
        console.error('Fout bij updaten lijst:', error);
        Alert.alert('Fout', 'Kon lijst niet updaten');
      }
    } catch (error) {
      console.error('Fout bij updaten lijst:', error);
      Alert.alert('Fout', 'Kon lijst niet updaten');
    }
  };
  const [productZoek, setProductZoek] = useState('');
  const [toonProductDetails, setToonProductDetails] = useState(false);
  const [bewerkProduct, setBewerkProduct] = useState(null);
  const [toonCategorieModal, setToonCategorieModal] = useState(false);
  const [categorieTab, setCategorieTab] = useState('Algemeen');
  const [filterCategorie, setFilterCategorie] = useState(null);
  const [toonSorteerModal, setToonSorteerModal] = useState(false);
  const [sorteerOptie, setSorteerOptie] = useState('Categorieën');
  const [chronologischChecked, setChronologischChecked] = useState(true);
  const [toonAfgevinkte, setToonAfgevinkte] = useState(true);
  const [gekozenCategorie, setGekozenCategorie] = useState(null);
  const [zoekSuggestie, setZoekSuggestie] = useState('');
  const [toonZoekResultaten, setToonZoekResultaten] = useState(false);
  const [toonDuplicaatModal, setToonDuplicaatModal] = useState(false);
  const [duplicaatProduct, setDuplicaatProduct] = useState(null);
  
  // Menu states
  const [toonMenuModal, setToonMenuModal] = useState(false);
  const [toonShareModal, setToonShareModal] = useState(false);

  const [currentListCode, setCurrentListCode] = useState('');
  const [isListOwner, setIsListOwner] = useState(false);
  const [toonTestModal, setToonTestModal] = useState(false);
  const [toonNieuweLijstNaamModal, setToonNieuweLijstNaamModal] = useState(false);
  const [realtimeSubscriptions, setRealtimeSubscriptions] = useState([]);

  const [productOpslaanLoading, setProductOpslaanLoading] = useState(false);
  const [productOpslaanFout, setProductOpslaanFout] = useState(null);

  // 1. Voeg een state toe voor de prijsweergave
  const [toonPrijzen, setToonPrijzen] = useState(false);

  // Bulk selectie states  
  const [geselecteerdeProducten, setGeselecteerdeProducten] = useState([]);

  // 2. Nieuwe menu-modal component
  const [toonNieuwMenuModal, setToonNieuwMenuModal] = useState(false);

      const menuModalAnimation = new Animated.Value(0);
  const productModalAnimation = new Animated.Value(800);
  const overlayAnimation = new Animated.Value(0);

  // 3. Functies voor menu-opties
  const handleAlleItemsDeselecteren = () => {
    if (!geselecteerdeLijst) return;
    const nieuweLijst = {
      ...geselecteerdeLijst,
      items: geselecteerdeLijst.items.map(item => ({ ...item, checked: false }))
    };
    updateLijst(geselecteerdeLijst.id, { items: nieuweLijst.items });
    setLijsten(lijsten.map(l => l.id === geselecteerdeLijst.id ? nieuweLijst : l));
    setGeselecteerdeLijst(nieuweLijst);
    setToonNieuwMenuModal(false);
  };
  const handleAlleItemsSelecteren = () => {
    if (!geselecteerdeLijst) return;
    const nieuweLijst = {
      ...geselecteerdeLijst,
      items: geselecteerdeLijst.items.map(item => ({ ...item, checked: true }))
    };
    updateLijst(geselecteerdeLijst.id, { items: nieuweLijst.items });
    setLijsten(lijsten.map(l => l.id === geselecteerdeLijst.id ? nieuweLijst : l));
    setGeselecteerdeLijst(nieuweLijst);
    setToonNieuwMenuModal(false);
  };

  // Deel-functionaliteit (native share waar mogelijk, anders fallback)
  const [toonDeelModal, setToonDeelModal] = useState(false);
  const [deelCode, setDeelCode] = useState('');

  const buildShareText = () => {
    const titel = `${geselecteerdeLijst?.naam || geselecteerdeLijst?.name || 'Boodschappenlijst'}`;
    const regels = (geselecteerdeLijst?.items || []).map((item) => {
      const naam = item.naam || item.name || 'Item';
      const qty = item.aantal || item.quantity || item.qty || item.stuks || 1;
      return `• ${naam} (${qty})`;
    });
    return `Mijn ${titel}\n\n${regels.join('\n')}`;
  };

  const handleDeelLijst = async () => {
    try {
      if (!geselecteerdeLijst) return;
      if (!geselecteerdeLijst.items || geselecteerdeLijst.items.length === 0) {
        Alert.alert('Delen', 'Voeg eerst producten toe voordat je de lijst deelt.');
        return;
      }

      // Probeer een deelcode aan te maken; faalt dit, ga dan toch door met tekst-delen
      let code = '';
      try {
        const { data: shareData, error: shareErr } = await sharedLists.createSharedList(user?.id, {
          name: geselecteerdeLijst.naam || geselecteerdeLijst.name,
          items: geselecteerdeLijst.items,
        });
        if (!shareErr && shareData?.code) {
          code = shareData.code;
        }
      } catch (e) {
        // stille fallback; we delen alsnog de tekst zonder code
      }

      const message = buildShareText();

      // Web: gebruik de Web Share API indien beschikbaar
      // @ts-ignore - navigator kan op native ontbreken
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        try {
          // @ts-ignore
          await navigator.share({ title: 'Boodschappenlijst', text: message, url: code ? webLink : undefined });
          return;
        } catch (_) { /* fallback hieronder */ }
      }

      // Native (iOS/Android): gebruik React Native Share API
      try {
        // Belangrijk: op iOS wordt 'message' gebruikt; 'url' kan content wegdrukken.
        await Share.share({ message });
        return;
      } catch (_) { /* fallback hieronder */ }

      // Fallback: kopieer naar klembord (web) of toon modal met tekst
      // @ts-ignore
      if (Platform.OS === 'web' && navigator?.clipboard?.writeText) {
        try {
          // @ts-ignore
          await navigator.clipboard.writeText(message);
          Alert.alert('Gekopieerd', 'De lijst is gekopieerd naar het klembord.');
          return;
        } catch (_) { /* ga door naar modal */ }
      }

      // Als alles faalt, toon eenvoudig een modal met deelbare tekst
      setDeelCode(message);
      setToonDeelModal(true);
    } catch (err) {
      console.error('Fout bij delen:', err);
      Alert.alert('Fout', 'Kon de lijst niet delen. Probeer opnieuw.');
    }
  };


  // Zoeksuggesties genereren
  const genereerZoekSuggestie = () => {
    const suggesties = [
      'Melk', 'Brood', 'Appels', 'Kaas', 'Eieren', 'Bananen', 'Yoghurt', 'Kipfilet', 'Rijst', 'Pasta',
      'Tomaten', 'Komkommer', 'Paprika', 'Wortels', 'Uien', 'Sla', 'Spinazie', 'Avocado', 'Sinaasappels', 'Druiven'
    ];
    const randomSuggestie = suggesties[Math.floor(Math.random() * suggesties.length)];
    setZoekSuggestie(randomSuggestie);
  };

  // Zoeksuggestie elke 5 seconden updaten
  useEffect(() => {
    if (toonProductModal && !productZoek) {
      genereerZoekSuggestie();
      const interval = setInterval(genereerZoekSuggestie, 5000);
      return () => clearInterval(interval);
    }
  }, [toonProductModal, productZoek]);

  // Menu popup animatie
  useEffect(() => {
    if (toonNieuwMenuModal) {
      Animated.spring(menuModalAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuModalAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [toonNieuwMenuModal]);

  // Overlay fade-in animatie voor nieuwe lijst modal
  useEffect(() => {
    if (toonNieuweLijstNaamModal) {
      Animated.timing(overlayAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [toonNieuweLijstNaamModal]);

  // Product modal animatie - tijdelijk uitgeschakeld
  // useEffect(() => {
  //   if (toonProductModal) {
  //     Animated.timing(productModalAnimation, {
  //       toValue: 0,
  //       duration: 300,
  //       useNativeDriver: true,
  //     }).start();
  //   } else {
  //     Animated.timing(productModalAnimation, {
  //       toValue: 800,
  //       duration: 300,
  //       useNativeDriver: true,
  //     }).start();
  //   }
  // }, [toonProductModal]);

  // Zoekresultaten filteren
  const getZoekResultaten = () => {
    if (!productZoek.trim()) return [];
    
    const zoekTerm = productZoek.toLowerCase();
    
    // Zoek in producten
    const alleProducten = Object.values(PRODUCT_CATEGORIE_MAPPING).flat();
    const gefilterdeProducten = alleProducten.filter(product => 
      product.toLowerCase().includes(zoekTerm)
    );
    
    // Zoek in categorieën
    const gefilterdeCategorieen = Object.keys(PRODUCT_CATEGORIE_MAPPING).filter(cat =>
      cat.toLowerCase().includes(zoekTerm)
    );
    
    // Voeg categorie informatie toe aan producten
    const productResultaten = gefilterdeProducten.map(product => {
      const categorie = Object.keys(PRODUCT_CATEGORIE_MAPPING).find(cat => 
        PRODUCT_CATEGORIE_MAPPING[cat].includes(product)
      );
      return { naam: product, categorie, type: 'product' };
    });
    
    // Voeg categorie resultaten toe met emoji
    const categorieResultaten = gefilterdeCategorieen.map(cat => {
      const categorieItem = CATEGORIE_GRID.find(item => item.naam === cat);
      return {
        naam: cat,
        categorie: cat,
        type: 'categorie',
        emoji: categorieItem ? categorieItem.emoji : '📁'
      };
    });
    
    // Eerst producten, dan categorieën
    return [...productResultaten, ...categorieResultaten];
  };

  // Check of product al bestaat
  const checkProductDuplicaat = (productNaam) => {
    if (!geselecteerdeLijst) return false;
    return geselecteerdeLijst.items.find(item => 
      item.naam.toLowerCase() === productNaam.toLowerCase()
    );
  };

  // Bepaal categorie voor een product
  const getProductCategorie = (productNaam) => {
    const naam = productNaam.toLowerCase();
    
    // Fruit
    if (['appels', 'bananen', 'sinaasappels', 'mandarijnen', 'peren', 'druiven', 'aardbeien', 'blauwe bessen', 'frambozen', 'watermeloen', 'citroen', 'limoen', 'ananas', 'mango', 'kiwi', 'grapefruit', 'nectarines', 'abrikozen', 'pruimen', 'kersen', 'bramen', 'kruisbessen', 'vijgen', 'granaatappel', 'lychee', 'passievrucht', 'guave', 'papaya', 'kokosnoot', 'dragonfruit', 'starfruit', 'rambutan', 'mangosteen', 'longan'].includes(naam)) {
      return { categorie: 'Fruit', emoji: '🍎' };
    }
    
    // Groente
    if (['tomaten', 'komkommer', 'paprika', 'wortels', 'uien', 'knoflook', 'sla', 'spinazie', 'courgette', 'aubergine', 'prei', 'boontjes', 'bloemkool', 'broccoli', 'spruitjes', 'champignons', 'avocado', 'asperges', 'artisjok', 'bleekselderij', 'rode bieten', 'radijs', 'rettich', 'paksoi', 'bok choy', 'koolrabi', 'snijbiet', 'rucola', 'waterkers', 'postelein', 'veldsla', 'kropsla', 'ijsbergsla', 'romaine sla', 'endive', 'witlof', 'andijvie', 'pompoen', 'butternut squash', 'patisson', 'courgette geel', 'aubergine paars', 'aubergine wit', 'tomatillos', 'okra', 'bamboescheuten', 'lotuswortel'].includes(naam)) {
      return { categorie: 'Groente', emoji: '🥦' };
    }
    
    // Brood & Bakkerij
    if (['brood', 'ontbijtkoek', 'crackers', 'wasa', 'beschuit', 'pannenkoekenmix', 'wafelmix', 'cakemix', 'brownie mix', 'muffin mix', 'pizza mix', 'bread mix', 'pasta mix', 'risotto mix', 'soep mix'].includes(naam)) {
      return { categorie: 'Brood & Bakkerij', emoji: '🍞' };
    }
    
    // Broodbeleg
    if (['pindakaas', 'hagelslag', 'jam', 'honing', 'chocoladepasta', 'boter', 'margarine', 'roomkaas', 'hüttenkäse', 'crème fraîche'].includes(naam)) {
      return { categorie: 'Broodbeleg', emoji: '🥪' };
    }
    
    // Vlees
    if (['kip', 'rundergehakt', 'varkenshaas', 'runderlappen', 'lamsvlees', 'kalkoenfilet', 'eend', 'gans', 'konijn', 'wild zwijn', 'hertenvlees', 'kwartel'].includes(naam)) {
      return { categorie: 'Vlees', emoji: '🥩' };
    }
    
    // Vis
    if (['zalm', 'tonijn', 'garnalen', 'haring', 'makreel', 'kabeljauw', 'vissticks', 'forel', 'heilbot', 'koolvis', 'sardines', 'ansjovis', 'oesters', 'mosselen', 'kreeft', 'krab', 'kreeftenstaart'].includes(naam)) {
      return { categorie: 'Vis', emoji: '🐟' };
    }
    
    // Zuivel
    if (['melk', 'kaas', 'eieren', 'yoghurt', 'slagroom', 'gouda', 'edammer', 'brie', 'camembert', 'feta', 'parmezaan', 'mozzarella', 'cheddar', 'gorgonzola', 'roquefort', 'karnemelk', 'kefir', 'kwark', 'skyr', 'griekse yoghurt', 'bulgaarse yoghurt', 'kokosyoghurt', 'amandelmelk', 'havermelk', 'sojamelk'].includes(naam)) {
      return { categorie: 'Zuivel', emoji: '🥛' };
    }
    
    // Vleeswaren
    if (['ham', 'salami', 'kipfilet (beleg)', 'rookworst'].includes(naam)) {
      return { categorie: 'Vleeswaren', emoji: '🥓' };
    }
    
    // Frisdrank
    if (['frisdrank', 'sinaasappelsap', 'appelsap', 'water', 'cola', 'sprite', 'fanta', '7-up', 'pepsi', 'dr pepper', 'mountain dew', 'red bull', 'monster', 'rockstar', 'limonade', 'ice tea', 'vruchtensap', 'groentesap', 'smoothie', 'milkshake'].includes(naam)) {
      return { categorie: 'Frisdrank', emoji: '🥤' };
    }
    
    // Alcoholische dranken
    if (['bier', 'wijn'].includes(naam)) {
      return { categorie: 'Alcoholische dranken', emoji: '🍷' };
    }
    
    // Warme dranken
    if (['thee', 'koffie', 'hot chocolate', 'espresso', 'cappuccino', 'latte'].includes(naam)) {
      return { categorie: 'Warme dranken', emoji: '☕' };
    }
    
    // Chips & Nootjes
    if (['chips', 'nootjes', 'popcorn'].includes(naam)) {
      return { categorie: 'Chips & Nootjes', emoji: '🥜' };
    }
    
    // Snoep & Koek
    if (['koekjes', 'marshmallows', 'liquorice', 'winegums', 'toffees', 'caramels', 'chocolade', 'm&m\'s', 'skittles', 'haribo', 'stroopwafels', 'speculaas', 'ge vulde koek', 'boterkoek', 'appeltaart', 'cheesecake', 'tiramisu', 'chocolademousse', 'ijscoupe', 'sorbet', 'frozen yoghurt'].includes(naam)) {
      return { categorie: 'Snoep & Koek', emoji: '🍬' };
    }
    
    // Diepvries
    if (['ijs', 'pizza'].includes(naam)) {
      return { categorie: 'Diepvries', emoji: '🧊' };
    }
    
    // Ontbijtgranen
    if (['muesli', 'cornflakes'].includes(naam)) {
      return { categorie: 'Ontbijtgranen', emoji: '🥣' };
    }
    
    // Kruiden & Sauzen
    if (['peper', 'kruidenmix', 'olijfolie', 'zonnebloemolie', 'azijn', 'sojasaus', 'ketchup', 'mayonaise', 'mosterd', 'satésaus', 'basilicum', 'oregano', 'tijm', 'rozemarijn', 'salie', 'laurier', 'kurkuma', 'gember', 'kaneel', 'nootmuskaat', 'chilipepers', 'jalapeños', 'habanero', 'poblano', 'serrano', 'cayenne', 'paprika poeder', 'curry', 'garam masala', 'ras el hanout'].includes(naam)) {
      return { categorie: 'Kruiden & Sauzen', emoji: '🧂' };
    }
    
    // Droge producten
    if (['bloem', 'bakpoeder', 'vanillesuiker', 'suiker', 'zout', 'quinoa', 'bulgur', 'couscous', 'farro', 'freekeh', 'spelt', 'gerst', 'rogge', 'teff'].includes(naam)) {
      return { categorie: 'Droge producten', emoji: '🌾' };
    }
    
    // Conserven
    if (['kikkererwten', 'linzen', 'kidneybonen', 'zwarte bonen', 'witte bonen', 'bruine bonen', 'spliterwten', 'kapucijners', 'doperwten', 'bonen'].includes(naam)) {
      return { categorie: 'Conserven', emoji: '🥫' };
    }
    
    // Rijst & Pasta
    if (['rijst', 'pasta'].includes(naam)) {
      return { categorie: 'Rijst & Pasta', emoji: '🍚' };
    }
    
    // Standaard
    return { categorie: 'Overig', emoji: '🛒' };
  };

  // Product toevoegen
  const handleProductToevoegen = async (productNaam) => {
    if (!geselecteerdeLijst) return { isDuplicaat: false };
    // Check of product al bestaat in de lijst
    const bestaandProduct = checkProductDuplicaat(productNaam);
    if (bestaandProduct) {
      setDuplicaatProduct(productNaam);
      setToonDuplicaatModal(true);
      setToonProductModal(false); // Sluit de product modal wanneer duplicaat modal wordt getoond
      return { isDuplicaat: true };
    } else {
      await handleProductToevoegenDirect(productNaam);
      return { isDuplicaat: false };
    }
  };

  // Functie om product direct toe te voegen zonder duplicaat check
  const handleProductToevoegenDirect = async (productNaam) => {
    if (!geselecteerdeLijst) return;
    
    const { categorie, emoji } = getProductCategorie(productNaam);
    const nieuweProduct = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      naam: productNaam,
      checked: false,
      hoeveelheid: '1',
      eenheid: 'stuks',
      categorie: categorie,
      categorieEmoji: emoji,
    };
    const nieuweLijst = {
      ...geselecteerdeLijst,
      items: [...geselecteerdeLijst.items, nieuweProduct]
    };
    // Update in Supabase
    let error = null;
    if (geselecteerdeLijst.code) {
      // Gedeelde lijst
      ({ error } = await sharedLists.updateSharedList(geselecteerdeLijst.code, { items: nieuweLijst.items }));
    } else {
      // Persoonlijke lijst
      ({ error } = await lists.updateList(geselecteerdeLijst.id, { items: nieuweLijst.items }));
    }
    if (!error) {
      // Update lokale state alleen bij succes
      const nieuweLijsten = lijsten.map(l => l.id === geselecteerdeLijst.id ? nieuweLijst : l);
      setLijsten(nieuweLijsten);
      setGeselecteerdeLijst(nieuweLijst);
      setToonProductModal(false);
      
      // Track user activity and trigger notification for item added
      await notificationTriggers.trackUserActivity();
      await notificationTriggers.triggerItemAddedNotification(productNaam, geselecteerdeLijst.naam, user?.user_metadata?.name || user?.email);
    } else {
      Alert.alert('Fout', 'Kon product niet toevoegen');
    }
  };

  // Bulk selectie functies
  const handleProductSelecteren = (productNaam) => {
    setGeselecteerdeProducten(prev => {
      if (prev.includes(productNaam)) {
        return prev.filter(p => p !== productNaam);
      } else {
        return [...prev, productNaam];
      }
    });
  };

  const handleBulkProductenToevoegen = async () => {
    if (!geselecteerdeLijst || geselecteerdeProducten.length === 0) return;

    const aantalProducten = geselecteerdeProducten.length;

    const nieuweProducten = geselecteerdeProducten.map((productNaam, index) => {
      const { categorie, emoji } = getProductCategorie(productNaam);
      return {
        id: (Date.now() + index).toString() + Math.random().toString(36).substr(2, 5),
        naam: productNaam,
        checked: false,
        hoeveelheid: '1',
        eenheid: 'stuks',
        categorie: categorie,
        categorieEmoji: emoji,
      };
    });

    const nieuweLijst = {
      ...geselecteerdeLijst,
      items: [...geselecteerdeLijst.items, ...nieuweProducten]
    };

    // Update in Supabase
    let error = null;
    if (geselecteerdeLijst.code) {
      // Gedeelde lijst
      ({ error } = await sharedLists.updateSharedList(geselecteerdeLijst.code, { items: nieuweLijst.items }));
    } else {
      // Persoonlijke lijst
      ({ error } = await lists.updateList(geselecteerdeLijst.id, { items: nieuweLijst.items }));
    }

    if (!error) {
      // Update lokale state alleen bij succes
      const nieuweLijsten = lijsten.map(l => l.id === geselecteerdeLijst.id ? nieuweLijst : l);
      setLijsten(nieuweLijsten);
      setGeselecteerdeLijst(nieuweLijst);
      
      // Reset bulk selectie
      setGeselecteerdeProducten([]);
      setToonProductModal(false);
      
      // Track user activity
      await notificationTriggers.trackUserActivity();
      
      // Toon success bericht
      showCustomAlert('Toegevoegd!', `${aantalProducten} product${aantalProducten !== 1 ? 'en' : ''} toegevoegd aan je lijst!`, 'success');
    } else {
      showCustomAlert('Fout', 'Kon producten niet toevoegen', 'error');
    }
  };

  const handleBulkSelectieReset = () => {
    setGeselecteerdeProducten([]);
  };

  // Product afvinken
  const handleProductToggle = async (productId) => {
    if (!geselecteerdeLijst) return;
    const nieuweLijst = {
      ...geselecteerdeLijst,
      items: geselecteerdeLijst.items.map(item =>
        item.id === productId ? { ...item, checked: !item.checked } : item
      )
    };
    let error = null;
    if (geselecteerdeLijst.code) {
      ({ error } = await sharedLists.updateSharedList(geselecteerdeLijst.code, { items: nieuweLijst.items }));
    } else {
      ({ error } = await lists.updateList(geselecteerdeLijst.id, { items: nieuweLijst.items }));
    }
    if (!error) {
      const nieuweLijsten = lijsten.map(l => l.id === geselecteerdeLijst.id ? nieuweLijst : l);
      setLijsten(nieuweLijsten);
      setGeselecteerdeLijst(nieuweLijst);
      
      // Check if list is completed
      const completedItems = nieuweLijst.items.filter(item => item.checked).length;
      const totalItems = nieuweLijst.items.length;
      
      // Track user activity
      await notificationTriggers.trackUserActivity();
      
      if (completedItems === totalItems && totalItems > 0) {
        await notificationTriggers.triggerListCompletedNotification(nieuweLijst.naam, completedItems);
      } else if (completedItems === totalItems - 1 && totalItems > 1) {
        // Almost empty (1 item remaining)
        await notificationTriggers.triggerListAlmostEmptyNotification(nieuweLijst.naam, 1);
      }
    } else {
      Alert.alert('Fout', 'Kon product niet afvinken');
    }
  };

  // Product verwijderen
  const handleProductVerwijderen = async (productId) => {
    if (!geselecteerdeLijst) return;
    const nieuweLijst = {
      ...geselecteerdeLijst,
      items: geselecteerdeLijst.items.filter(item => item.id !== productId)
    };
    let error = null;
    if (geselecteerdeLijst.code) {
      ({ error } = await sharedLists.updateSharedList(geselecteerdeLijst.code, { items: nieuweLijst.items }));
    } else {
      ({ error } = await lists.updateList(geselecteerdeLijst.id, { items: nieuweLijst.items }));
    }
    if (!error) {
      const nieuweLijsten = lijsten.map(l => l.id === geselecteerdeLijst.id ? nieuweLijst : l);
      setLijsten(nieuweLijsten);
      setGeselecteerdeLijst(nieuweLijst);
      
      // Track user activity and find the removed item for notification
      await notificationTriggers.trackUserActivity();
      const removedItem = geselecteerdeLijst.items.find(item => item.id === productId);
      if (removedItem) {
        await notificationTriggers.triggerItemRemovedNotification(removedItem.naam, geselecteerdeLijst.naam, user?.user_metadata?.name || user?.email);
      }
    } else {
      Alert.alert('Fout', 'Kon product niet verwijderen');
    }
  };

  // Lijst verwijderen
  const handleLijstVerwijderen = async (lijst) => {
    Alert.alert(
      'Lijst verwijderen',
      `Weet je zeker dat je "${lijst.naam}" wilt verwijderen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Verwijderen', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Check of dit een gedeelde lijst is
              if (lijst.code) {
                // Haal leden op
                const { data: leden, error: ledenError } = await sharedLists.getListMembers(lijst.code);
                if (!ledenError && leden && leden.length === 0 && lijst.created_by === user.id) {
                  // Geen leden en eigenaar: verwijder uit shared_lists
                  await sharedLists.deleteSharedList(lijst.code, user.id);
                } else {
                // Verlaat de gedeelde lijst (verwijder uit list_members)
                const { error: leaveError } = await sharedLists.removeListMember(lijst.code, user.id, user.id);
                if (leaveError) {
                  console.error('Fout bij verlaten gedeelde lijst:', leaveError);
                  Alert.alert('Fout', 'Kon gedeelde lijst niet verlaten');
                  return;
                }
                }
            } else {
                // Persoonlijke lijst
                await lists.deleteList(lijst.id);
              }
              // Update lokale state
              setLijsten(lijsten.filter(l => l.id !== lijst.id));
                setGeselecteerdeLijst(null);
            } catch (error) {
              console.error('Fout bij verwijderen lijst:', error);
              Alert.alert('Fout', 'Kon lijst niet verwijderen');
            }
          }
        }
      ]
    );
  };

  // Menu functies
  const handleMenuOpen = () => {
    setToonMenuModal(true);
  };

  const handleDeleteList = () => {
    setToonMenuModal(false);
    handleLijstVerwijderen(geselecteerdeLijst);
  };

  // Nieuwe lijst maken
  const handleNieuweLijst = async () => {
    setNieuweLijstNaam('');
    setToonNieuweLijstNaamModal(true);
  };

  const handleNieuweLijstAanmaken = () => {
    handleNieuweLijst();
  };

    const bevestigNieuweLijst = async () => {
    if (!nieuweLijstNaam.trim()) {
      // Als er geen naam is ingevoerd, gebruik een standaard naam
      const standaardNaam = `Nieuwe lijst ${lijsten.length + 1}`;
      await createNieuweLijst({
        naam: standaardNaam,
        items: []
      });
      setToonNieuweLijstNaamModal(false);
      return;
    }
    
    await createNieuweLijst({
      naam: nieuweLijstNaam.trim(),
      items: []
    });
    setToonNieuweLijstNaamModal(false);
  };

  // Productdetails openen
  const handleProductDetails = (product) => {
    setBewerkProduct({ ...product });
    setToonProductDetails(true);
  };

  // Productdetails opslaan
  const handleProductDetailsOpslaan = async () => {
    if (!geselecteerdeLijst || !bewerkProduct) return;
    setProductOpslaanLoading(true);
    setProductOpslaanFout(null);
    try {
      const nieuweLijst = {
        ...geselecteerdeLijst,
        items: geselecteerdeLijst.items.map(item =>
          item.id === bewerkProduct.id ? { ...bewerkProduct } : item
        )
      };
      // Update in Supabase
      await updateLijst(geselecteerdeLijst.id, {
        items: nieuweLijst.items
      });
      // Update lokale state
      setLijsten(lijsten.map(l => l.id === geselecteerdeLijst.id ? nieuweLijst : l));
      setGeselecteerdeLijst(nieuweLijst);
      setToonProductDetails(false);
    } catch (error) {
      setProductOpslaanFout('Er is iets misgegaan bij het opslaan. Probeer het opnieuw.');
      console.error('Fout bij opslaan product:', error);
    } finally {
      setProductOpslaanLoading(false);
    }
  };

  // Categorie wijzigen
  const handleCategorieWijzigen = async (cat) => {
    if (bewerkProduct) {
      // Update in details-modal of direct vanuit productrij
      const nieuweProduct = { ...bewerkProduct, categorie: cat.naam, categorieEmoji: cat.emoji };
      const nieuweLijst = {
        ...geselecteerdeLijst,
        items: geselecteerdeLijst.items.map(item =>
          item.id === nieuweProduct.id ? nieuweProduct : item
        )
      };
      
      // Update in Supabase
      await updateLijst(geselecteerdeLijst.id, {
        items: nieuweLijst.items
      });
      
      // Update lokale state
      setLijsten(lijsten.map(l => l.id === geselecteerdeLijst.id ? nieuweLijst : l));
      setGeselecteerdeLijst(nieuweLijst);
      setBewerkProduct(nieuweProduct);
    }
    setToonCategorieModal(false);
  };

  // Sorteer producten op basis van sorteerOptie
  const getSortedProducten = () => {
    let items = [...geselecteerdeLijst.items];
    if (sorteerOptie === 'Categorieën') {
      items.sort((a, b) => (a.categorie || '').localeCompare(b.categorie || ''));
    } else if (sorteerOptie === 'Alfabetisch') {
      items.sort((a, b) => (a.naam || '').localeCompare(b.naam || ''));
    }
    const nietAfgevinkt = items.filter(p => !p.checked);
    const afgevinkt = items.filter(p => p.checked);
    if (toonAfgevinkte) {
      return [...nietAfgevinkt, ...afgevinkt];
    } else {
      return nietAfgevinkt;
    }
  };

  // Groepeer producten per categorie voor weergave
  const getGegroepeerdeProducten = () => {
    const items = getSortedProducten();
    
    if (sorteerOptie !== 'Categorieën') {
      return items; // Geen groepering voor andere sorteeropties
    }

    const groepen = {};
    items.forEach(item => {
      const categorie = item.categorie || 'Overig';
      if (!groepen[categorie]) {
        groepen[categorie] = [];
      }
      groepen[categorie].push(item);
    });

    // Behoud originele volgorde binnen categorieën
    // Geen alfabetische sortering, gewoon groeperen per categorie

    // Converteer naar array met categorie headers
    const resultaat = [];
    Object.keys(groepen).forEach(categorie => {
      resultaat.push({ type: 'header', categorie, items: groepen[categorie] });
      resultaat.push(...groepen[categorie].map(item => ({ ...item, type: 'item' })));
    });

    return resultaat;
  };

  // Render lijst card
  const renderLijst = ({ item }) => {
    const checkedItems = item.items.filter(item => item.checked).length;
    const totalItems = item.items.length;
    const isSelected = selectedListIds.includes(item.id);
    return (
      <TouchableOpacity 
        style={[styles.lijstCard, { backgroundColor: colors.surface }]} 
        onPress={() => {
          if (selectMode) {
            // Toggle selectie
            setSelectedListIds(prev =>
              prev.includes(item.id)
                ? prev.filter(id => id !== item.id)
                : [...prev, item.id]
            );
          } else {
            setGeselecteerdeLijst(item);
          }
        }}
      >
        <View style={styles.lijstCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {selectMode && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedListIds(prev =>
                    prev.includes(item.id)
                      ? prev.filter(id => id !== item.id)
                      : [...prev, item.id]
                  );
                }}
                style={{ marginRight: 12 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                  size={26}
                  color={isSelected ? colors.primary : colors.textTertiary}
                />
              </TouchableOpacity>
            )}
          <Text style={[styles.lijstCardTitle, { color: colors.text }]}>{item.naam}</Text>
          </View>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation(); // Voorkom dat de lijst wordt geselecteerd
              handleLijstVerwijderen(item);
            }}
            style={styles.lijstCardMenu}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Groter touch area
          >
            <MaterialCommunityIcons name="delete" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
        <View style={styles.lijstCardProgress}>
          <View style={[styles.lijstCardProgressBar, { width: `${totalItems > 0 ? (checkedItems / totalItems) * 100 : 0}%` }]} />
        </View>
        <Text style={[styles.lijstCardSubtitle, { color: colors.textSecondary }]}>
          {checkedItems} van {totalItems} producten afgevinkt
        </Text>
      </TouchableOpacity>
    );
  };

  // Render product row
  const renderProduct = ({ item }) => {
    if (filterCategorie && item.categorie !== filterCategorie) return null;
    
    // Render categorie header
    if (item.type === 'header') {
    return (
        <View style={{
          backgroundColor: colors.background,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginTop: 16,
          marginBottom: 8,
          borderRadius: 8,
        }}>
          <Text style={{
            fontWeight: 'bold',
            fontSize: 16,
            color: colors.textSecondary,
            textTransform: 'uppercase',
          }}>
            {item.categorie} ({item.items.length})
          </Text>
        </View>
      );
    }
    
    // Find matching bonus for this product
    const matchingBonus = bonusService.findMatchingBonus(item.naam, bonusData);
    
    // Render normaal product
    return (
      <View style={[styles.productRow, item.checked && styles.productRowChecked]}>
        <TouchableOpacity 
          onPress={() => handleProductToggle(item.id)}
          style={styles.productCheckbox}
        >
          <MaterialCommunityIcons 
            name={item.checked ? "check-circle" : "checkbox-blank-circle-outline"} 
            size={28} 
            color={item.checked ? colors.success : colors.textTertiary} 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.productInfo} onPress={() => handleProductDetails(item)}>
          <View style={styles.productHeader}>
            <Text style={[styles.productNaam, item.checked && styles.productNaamChecked, { color: colors.text }]}>
              {item.naam}
            </Text>
            {matchingBonus && (
              <BonusBadge 
                bonus={matchingBonus} 
                onPress={() => {
                  setSelectedBonus(matchingBonus);
                  setShowBonusModal(true);
                }}
              />
            )}
          </View>
          <Text style={[styles.productDetails, { color: colors.textSecondary }]}>
            {item.hoeveelheid} {item.eenheid}
          </Text>
          {item.notitie ? (
            <Text style={[styles.productDetails, { color: colors.textSecondary, fontStyle: 'italic' }]} numberOfLines={2}>
              {item.notitie}
            </Text>
          ) : null}
          {item.prijs ? (
            <Text style={[styles.productDetails, { color: colors.success, fontWeight: 'bold' }]}> 
              € {parseFloat(item.prijs).toFixed(2)}
              {item.hoeveelheid && !isNaN(parseFloat(item.hoeveelheid)) ? ` | Totaal: € ${(parseFloat(item.prijs) * parseFloat(item.hoeveelheid)).toFixed(2)}` : ''}
            </Text>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setBewerkProduct({ ...item }); setToonCategorieModal(true); }}>
          <Text style={{ fontSize: 28, marginLeft: 8 }}>{item.categorieEmoji || '🏷️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleProductVerwijderen(item.id)}
          style={styles.productDelete}
        >
          <MaterialCommunityIcons name="delete" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  // Voeg een stille verwijderfunctie toe voor bulk delete:
  const deleteLijstDirect = async (lijst) => {
    try {
      if (lijst.code) {
        const { data: leden, error: ledenError } = await sharedLists.getListMembers(lijst.code);
        if (!ledenError && leden && leden.length === 0 && lijst.created_by === user.id) {
          await sharedLists.deleteSharedList(lijst.code, user.id);
        } else {
          await sharedLists.removeListMember(lijst.code, user.id, user.id);
        }
      } else {
        await lists.deleteList(lijst.id);
      }
    } catch (error) {
      // Fout bij verwijderen, eventueel loggen
    }
  };

  const handleBulkVerwijderLijsten = async () => {
    // Verwijder direct uit de state
    setLijsten(prev => prev.filter(l => !selectedListIds.includes(l.id)));
    // Verwijder uit de database
    for (const lijstId of selectedListIds) {
      const lijst = lijsten.find(l => l.id === lijstId);
      if (lijst) {
        await deleteLijstDirect(lijst);
      }
    }
    setSelectedListIds([]);
    setSelectMode(false);
  };

  // Hoofdscherm - lijsten overzicht
  if (geselecteerdeLijst == null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {geselecteerdeLijst == null ? (
          <>
                    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
          <Text style={[styles.title, { color: colors.text }]}>Mijn lijsten</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {selectMode && selectedListIds.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Lijsten verwijderen',
                    `Weet je zeker dat je ${selectedListIds.length} lijst(en) wilt verwijderen?`,
                    [
                      { text: 'Annuleren', style: 'cancel' },
                      {
                        text: 'Verwijderen', style: 'destructive', onPress: handleBulkVerwijderLijsten }
                    ]
                  );
                }}
                style={{ marginRight: 18 }}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={26} color={colors.error} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setSelectMode(!selectMode)}>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                {selectMode ? 'Annuleren' : 'Selecteren'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
            {lijsten.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Nog geen lijsten</Text>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleNieuweLijst}>
                  <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                  <Text style={[styles.addButtonText, { color: colors.buttonText }]}>NIEUWE LIJST</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <FlatList
                  data={lijsten}
                  renderItem={renderLijst}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.lijstenList}
                />
                <TouchableOpacity style={[styles.floatingAddButton, { backgroundColor: colors.primary }]} onPress={handleNieuweLijst}>
                  <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                  <Text style={[styles.addButtonText, { color: colors.buttonText }]}>NIEUWE LIJST</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
              <TouchableOpacity onPress={() => setGeselecteerdeLijst(null)}>
                <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
              </TouchableOpacity>
                  <Text style={[styles.title, { color: colors.text }]}>{geselecteerdeLijst.naam}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setToonNieuwMenuModal(true)}>
                      <MaterialCommunityIcons name="dots-vertical" size={28} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
            {geselecteerdeLijst.items.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Nog geen producten</Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => {
              setToonProductModal(true);
              handleBulkSelectieReset();
            }}>
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                  <Text style={[styles.addButtonText, { color: '#fff' }]}>PRODUCT TOEVOEGEN</Text>
            </TouchableOpacity>
          </View>
        ) : (
              <>
            <FlatList
                  data={getGegroepeerdeProducten()}
                  renderItem={renderProduct}
                  keyExtractor={item => item.type === 'header' ? `header-${item.categorie}` : item.id}
                  contentContainerStyle={styles.productenList}
                />
              </>
            )}
            {geselecteerdeLijst.items.some(p => p.checked) && (
              <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
                {toonAfgevinkte ? (
                  <TouchableOpacity onPress={() => setToonAfgevinkte(false)} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                    <MaterialCommunityIcons name="eye-off-outline" size={22} color={colors.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Verberg afgevinkte producten</Text>
      </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setToonAfgevinkte(true)} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                    <MaterialCommunityIcons name="eye-outline" size={22} color={colors.success} style={{ marginRight: 6 }} />
                    <Text style={{ color: colors.success, fontWeight: 'bold' }}>Toon afgevinkte producten</Text>
          </TouchableOpacity>
              )}
              </View>
            )}
            {geselecteerdeLijst.items.length > 0 && (
              <View style={{ position: 'absolute', right: 24, bottom: 24 }}>
                <TouchableOpacity 
                  style={[styles.floatingAddButton, { backgroundColor: colors.primary }]} 
                  onPress={() => {
                    setToonProductModal(true);
                    setGekozenCategorie(null);
                    setProductZoek('');
                    setToonZoekResultaten(false);
                    setToonDuplicaatModal(false);
                    handleBulkSelectieReset();
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                  <Text style={[styles.addButtonText, { color: colors.buttonText }]}>TOEVOEGEN</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Prominente sticky deelknop onderaan */}
            <View style={{ position: 'absolute', left: 16, right: 16, bottom: 80, zIndex: 20 }}>
              <TouchableOpacity
                onPress={handleDeelLijst}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 24,
                  paddingVertical: 14,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center'
                }}
              >
                <MaterialCommunityIcons name="share-variant" size={22} color={colors.buttonText} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.buttonText, fontWeight: 'bold', fontSize: 16 }}>Lijst delen</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
        {/* --- MODALS ALTIJD HIERONDER --- */}

        
        {/* Nieuwe Lijst Naam Modal */}
        <Modal
          visible={toonNieuweLijstNaamModal}
          transparent
          animationType="none"
          onRequestClose={() => setToonNieuweLijstNaamModal(false)}
        >
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <Animated.View style={[styles.modalOverlay, { justifyContent: 'flex-end', opacity: overlayAnimation }]}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, minHeight: 200 }]}>
                <View style={[styles.modalHeader, { justifyContent: 'center' }]}>
                  <Text style={[styles.modalTitle, { color: colors.text, fontSize: 22, textAlign: 'center' }]}>Maak een nieuwe lijst</Text>
                  <TouchableOpacity style={{ position: 'absolute', right: 0 }} onPress={() => setToonNieuweLijstNaamModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                </View>
                
                <TextInput
                    style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text, borderColor: '#37af29', borderWidth: 2, fontWeight: '700' }]}
                    placeholder="Nieuwe lijst"
                    placeholderTextColor={colors.textTertiary}
                    placeholderStyle={{ fontWeight: '700' }}
                    keyboardAppearance={isDarkMode ? 'dark' : 'light'}
                  value={nieuweLijstNaam}
                  onChangeText={setNieuweLijstNaam}
                  autoFocus
                    onSubmitEditing={bevestigNieuweLijst}
                    returnKeyType="done"
                  />
                  
                  <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <TouchableOpacity 
                      style={[styles.addButton, { backgroundColor: '#37af29', width: '100%', paddingHorizontal: 32, justifyContent: 'center' }]}
                      onPress={bevestigNieuweLijst}
                    >
                      <Text style={[styles.addButtonText, { textAlign: 'center', color: colors.buttonText, fontWeight: 'bold' }]}>OPSLAAN</Text>
                    </TouchableOpacity>
                  </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    );
  }

  // Detailscherm - producten in lijst
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => setGeselecteerdeLijst(null)}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{geselecteerdeLijst.naam}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setToonNieuwMenuModal(true)}>
            <MaterialCommunityIcons name="dots-vertical" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {geselecteerdeLijst.items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Nog geen producten</Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => {
              setToonProductModal(true);
              handleBulkSelectieReset();
            }}>
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            <Text style={[styles.addButtonText, { color: colors.buttonText }]}>PRODUCT TOEVOEGEN</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
                      <FlatList
                  data={getGegroepeerdeProducten()}
                  renderItem={renderProduct}
                  keyExtractor={item => item.type === 'header' ? `header-${item.categorie}` : item.id}
                  contentContainerStyle={styles.productenList}
                />
        </>
      )}

      {geselecteerdeLijst.items.some(p => p.checked) && (
        <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
          {toonAfgevinkte ? (
            <TouchableOpacity onPress={() => setToonAfgevinkte(false)} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
              <MaterialCommunityIcons name="eye-off-outline" size={22} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Verberg afgevinkte producten</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setToonAfgevinkte(true)} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
              <MaterialCommunityIcons name="eye-outline" size={22} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.success, fontWeight: 'bold' }}>Toon afgevinkte producten</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {geselecteerdeLijst.items.length > 0 && (
        <TouchableOpacity 
          style={[styles.floatingAddButton, { backgroundColor: colors.primary }]} 
          onPress={() => {
            setToonProductModal(true);
            setGekozenCategorie(null);
            setProductZoek('');
            setToonZoekResultaten(false);
            setToonDuplicaatModal(false); // Reset duplicaat modal
            handleBulkSelectieReset(); // Reset bulk selectie
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={[styles.addButtonText, { color: colors.buttonText }]}>TOEVOEGEN</Text>
        </TouchableOpacity>
      )}

      {/* Product toevoegen modal */}
        <Modal
          visible={toonProductModal}
          transparent
          animationType="slide"
          onRequestClose={() => setToonProductModal(false)}
        >
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
          <View style={[{ backgroundColor: colors.surface, height: '90%', minHeight: 600, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, width: '100%' }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                setToonProductModal(false);
                handleBulkSelectieReset();
              }}>
                <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Producten selecteren
              </Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 20, color: colors.text }}>
                Selecteer producten voor je lijst
              </Text>
              {geselecteerdeProducten.length > 0 && (
                <Text style={{ fontSize: 16, color: colors.primary, marginTop: 4 }}>
                  {geselecteerdeProducten.length} product{geselecteerdeProducten.length !== 1 ? 'en' : ''} geselecteerd
                </Text>
              )}
            </View>

            <View style={{ position: 'relative' }}>
                <TextInput
                style={[styles.searchInput, { paddingRight: 40, backgroundColor: colors.background, color: colors.text, borderColor: colors.divider }]}
                placeholder={productZoek ? "Zoek producten..." : `Zoek producten... (bijv. ${zoekSuggestie})`}
                placeholderTextColor={colors.textTertiary}
                  value={productZoek}
                onChangeText={(text) => {
                  setProductZoek(text);
                  setToonZoekResultaten(text.length > 0);
                  if (text.length > 0) {
                    setGekozenCategorie(null);
                  }
                }}
                onFocus={() => {
                  if (productZoek.length > 0) {
                    setToonZoekResultaten(true);
                  }
                }}
              />
              {productZoek.length > 0 && (
                <TouchableOpacity 
                  style={{ position: 'absolute', right: 12, top: 16 }}
                  onPress={() => {
                    setProductZoek('');
                    setToonZoekResultaten(false);
                  }}
                >
                  <MaterialCommunityIcons name="close" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
              </View>

            {/* Zoekresultaten tonen wanneer er getypt wordt */}
            {toonZoekResultaten && productZoek.length > 0 && (
              <View style={{ flex: 1, marginBottom: 16 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text, marginBottom: 8 }}>
                  Zoekresultaten ({getZoekResultaten().length})
                </Text>
                                {(() => {
                  const resultaten = getZoekResultaten();
                  const showHighlighting = resultaten.length > 1;
  return (
                    <FlatList
                      data={resultaten}
                      renderItem={({ item }) => {
                        const isSelected = geselecteerdeProducten.includes(item.naam);
                        return (
          <TouchableOpacity 
                          style={[
                            item.type === 'categorie' 
                              ? {
                                  backgroundColor: colors.background,
                                  borderRadius: 12,
                                  padding: 20,
                                  marginBottom: 12,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  elevation: 2,
                                  shadowColor: '#000',
                                  shadowOffset: { width: 0, height: 1 },
                                  shadowOpacity: 0.08,
                                  shadowRadius: 3,
                                }
                              : [styles.productOption, { 
                                  backgroundColor: isSelected ? (isDarkMode ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)') : colors.surface,
                                  borderColor: isSelected ? '#4CAF50' : colors.divider,
                                  borderWidth: isSelected ? 2 : 1,
                                  shadowColor: isDarkMode ? '#000' : '#4CAF50',
                                  shadowOffset: { width: 0, height: 1 },
                                  shadowOpacity: isSelected ? (isDarkMode ? 0.4 : 0.1) : 0,
                                  shadowRadius: isSelected ? 2 : 0,
                                  elevation: isSelected ? 1 : 0,
                                  borderRadius: 8,
                                  marginVertical: 1,
                                  marginHorizontal: 2
                                }]
                          ]}
                                                  onPress={async () => {
                          if (item.type === 'categorie') {
                            setGekozenCategorie(item.naam);
                            setProductZoek('');
                            setToonZoekResultaten(false);
                          } else {
                            // Altijd selecteer/deselecteer product
                            handleProductSelecteren(item.naam);
                          }
                        }}
                        >
                          {item.type === 'categorie' ? (
                            <>
                              <Text style={{ fontSize: 48, marginRight: 16 }}>{item.emoji}</Text>
                              <View style={{ flex: 1 }}>
                                <HighlightedText 
                                  text={item.naam}
                                  highlight={productZoek}
                                  style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 4 }}
                                  showHighlight={showHighlighting}
                                  colors={colors}
                                />
                                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                                  Bekijk alle producten in deze categorie
                                </Text>
                              </View>
                              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
                            </>
                          ) : (
                            <>
                              <MaterialCommunityIcons 
                                name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                                size={26} 
                                color={isSelected ? '#4CAF50' : colors.textSecondary} 
                              />
                              <View style={{ flex: 1, position: 'relative' }}>
                                <HighlightedText 
                                  text={item.naam}
                                  highlight={productZoek}
                                  style={[styles.productOptionText, { 
                                    color: colors.text,
                                    fontWeight: isSelected ? 'bold' : 'normal'
                                  }]}
                                  showHighlight={showHighlighting}
                                  colors={colors}
                                />
                                {/* Bonus badge voor zoekresultaten */}
                                {(() => {
                                  const matchingBonus = bonusService.findMatchingBonus(item.naam, bonusData);
                                  return matchingBonus ? (
                                    <BonusBadge 
                                      bonus={matchingBonus} 
                                      top={0}
                                    />
                                  ) : null;
                                })()}
                              </View>
                              <Text style={{ fontSize: 12, color: colors.textSecondary, backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                                {item.categorie}
                              </Text>
                            </>
                          )}
            </TouchableOpacity>
                        );
                      }}
                      keyExtractor={item => `${item.type}-${item.naam}`}
                      style={{ flex: 1 }}
                    />
                  );
                })()}
              </View>
            )}

            {/* In de Product toevoegen modal, onder de zoekbalk, toon het grid als er geen categorie gekozen is */}
            {!gekozenCategorie && !toonZoekResultaten && (
              <View style={{ flex: 1 }}>
                <FlatList
                  data={CATEGORIE_GRID}
                  numColumns={2}
                  keyExtractor={item => item.naam}
                  contentContainerStyle={{ paddingVertical: 8 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        margin: 8,
                        backgroundColor: colors.background,
                        borderRadius: 18,
                        minHeight: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 2,
                      }}
                      onPress={() => setGekozenCategorie(item.naam)}
                    >
                      <Text style={{ fontSize: 48, marginBottom: 8 }}>{item.emoji}</Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>{item.naam}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {gekozenCategorie && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity onPress={() => setGekozenCategorie(null)} style={{ marginRight: 8 }}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
              </TouchableOpacity>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text }}>{gekozenCategorie}</Text>
        </View>
                <View style={{ flex: 1 }}>
                  <FlatList
                    data={(PRODUCT_CATEGORIE_MAPPING[gekozenCategorie] || []).filter(p => p.toLowerCase().includes(productZoek.toLowerCase()))}
                    renderItem={({ item }) => {
                      const isSelected = geselecteerdeProducten.includes(item);
                      return (
                        <TouchableOpacity 
                          style={[styles.productOption, { 
                            backgroundColor: isSelected ? (isDarkMode ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)') : colors.surface, 
                            borderBottomColor: isSelected ? '#4CAF50' : colors.divider,
                            borderColor: isSelected ? '#4CAF50' : colors.divider,
                            borderWidth: isSelected ? 2 : 1,
                            borderBottomWidth: isSelected ? 2 : 1,
                            shadowColor: isDarkMode ? '#000' : '#4CAF50',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: isSelected ? (isDarkMode ? 0.3 : 0.08) : 0,
                            shadowRadius: isSelected ? 2 : 0,
                            elevation: isSelected ? 1 : 0,
                            marginVertical: 1,
                            marginHorizontal: 2,
                            borderRadius: 8
                          }]}
                          onPress={() => {
                            // Altijd selecteer/deselecteer product
                            handleProductSelecteren(item);
                          }}
                        >
                          <MaterialCommunityIcons 
                            name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                            size={26} 
                            color={isSelected ? '#4CAF50' : colors.textSecondary} 
                          />
                          <View style={{ flex: 1, position: 'relative' }}>
                            <Text style={[styles.productOptionText, { 
                              color: colors.text,
                              fontWeight: isSelected ? 'bold' : 'normal'
                            }]}>{item}</Text>
                            {/* Bonus badge voor categorie producten */}
                            {(() => {
                              const matchingBonus = bonusService.findMatchingBonus(item, bonusData);
                              return matchingBonus ? (
                                <BonusBadge 
                                  bonus={matchingBonus} 
                                  top={0}
                                />
                              ) : null;
                            })()}
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                    keyExtractor={item => item}
                  />
                </View>
              </>
            )}

            {/* Bulk selectie floating action button */}
            {geselecteerdeProducten.length > 0 && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 24,
                  right: 24,
                  backgroundColor: '#4CAF50',
                  borderRadius: 28,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: isDarkMode ? '#000' : '#4CAF50',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDarkMode ? 0.5 : 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: '#45a049'
                }}
                onPress={handleBulkProductenToevoegen}
              >
                <MaterialCommunityIcons name="check" size={26} color="#fff" />
                <Text style={{ 
                  color: '#fff', 
                  fontWeight: 'bold', 
                  fontSize: 17, 
                  marginLeft: 10 
                }}>
                  TOEVOEGEN ({geselecteerdeProducten.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        </Modal>

      {/* Product details modal */}
        <Modal
          visible={toonProductDetails}
          transparent
          animationType="none"
          onRequestClose={() => setToonProductDetails(false)}
        >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}
        >
          <View style={[{ backgroundColor: colors.surface, height: '80%', minHeight: 500, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, width: '100%' }]}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ width: 40, height: 4, backgroundColor: colors.divider, borderRadius: 2, marginBottom: 4 }} />
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text }}>Details</Text>
          </View>
              <TouchableOpacity onPress={handleProductDetailsOpslaan} disabled={productOpslaanLoading}>
                <Text style={{ color: productOpslaanLoading ? colors.textTertiary : colors.primary, fontWeight: 'bold', fontSize: 16 }}>Klaar</Text>
              </TouchableOpacity>
            </View>
            {productOpslaanFout && (
              <Text style={{ color: colors.error, marginBottom: 8 }}>{productOpslaanFout}</Text>
            )}
            {bewerkProduct && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <TextInput
                    style={{ flex: 1, fontWeight: 'bold', fontSize: 20, backgroundColor: colors.background, borderRadius: 12, padding: 8, marginRight: 8, color: colors.text }}
                    value={bewerkProduct.naam}
                    onChangeText={v => setBewerkProduct({ ...bewerkProduct, naam: v })}
                  />
                  <TouchableOpacity onPress={() => setToonCategorieModal(true)}>
                    <Text style={{ fontSize: 28, marginLeft: 8 }}>{bewerkProduct.categorieEmoji || '🏷️'}</Text>
                  </TouchableOpacity>
                  </View>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }} onPress={() => setToonCategorieModal(true)}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>{bewerkProduct.categorieEmoji || '🏷️'}</Text>
                  <Text style={{ fontWeight: 'bold', color: colors.textSecondary }}>{bewerkProduct.categorie || 'Categorie kiezen'}</Text>
                </TouchableOpacity>
                <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>Notitie toevoegen</Text>
          <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16, color: colors.text }}
                  placeholder="Notitie"
                  placeholderTextColor={colors.textTertiary}
                  value={bewerkProduct.notitie || ''}
                  onChangeText={v => setBewerkProduct({ ...bewerkProduct, notitie: v })}
                />
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>Hoeveelheid</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 10 }}>
                      <TouchableOpacity style={{ padding: 8 }} onPress={() => setBewerkProduct({ ...bewerkProduct, hoeveelheid: Math.max(1, parseInt(bewerkProduct.hoeveelheid || '1', 10) - 1).toString() })}>
                        <MaterialCommunityIcons name="minus" size={22} color={colors.primary} />
                      </TouchableOpacity>
                      <TextInput
                        style={{ flex: 1, padding: 12, fontSize: 16, textAlign: 'center', color: colors.text }}
                        placeholder="0.0"
                        placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                        value={bewerkProduct.hoeveelheid ? String(bewerkProduct.hoeveelheid) : ''}
                        onChangeText={v => setBewerkProduct({ ...bewerkProduct, hoeveelheid: v.replace(/[^0-9]/g, '') })}
                      />
                      <TouchableOpacity style={{ padding: 8 }} onPress={() => setBewerkProduct({ ...bewerkProduct, hoeveelheid: (parseInt(bewerkProduct.hoeveelheid || '1', 10) + 1).toString() })}>
                        <MaterialCommunityIcons name="plus" size={22} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>Eenheid</Text>
          <TextInput
                      style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, fontSize: 16, color: colors.text }}
                      placeholder="Eenheid"
                      placeholderTextColor={colors.textTertiary}
                      value={bewerkProduct.eenheid || ''}
                      onChangeText={v => setBewerkProduct({ ...bewerkProduct, eenheid: v })}
                    />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>Prijs</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 10 }}>
                      <TextInput
                        style={{ flex: 1, padding: 12, fontSize: 16, color: colors.text }}
                        placeholder="Prijs"
                        placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
                        value={bewerkProduct.prijs ? String(bewerkProduct.prijs) : ''}
                        onChangeText={v => setBewerkProduct({ ...bewerkProduct, prijs: v })}
          />
                      <TouchableOpacity style={{ padding: 8 }} onPress={() => setBewerkProduct({ ...bewerkProduct, prijs: '' })}>
                        <MaterialCommunityIcons name="close" size={20} color={colors.textTertiary} />
                      </TouchableOpacity>
        </View>
      </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>TOTAAL</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>{bewerkProduct.prijs && bewerkProduct.hoeveelheid ? `€ ${(parseFloat(bewerkProduct.prijs) * parseFloat(bewerkProduct.hoeveelheid)).toFixed(2)}` : '€ 0,00'}</Text>
                  </View>
                </View>
                <TouchableOpacity style={{ backgroundColor: colors.success, borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginTop: 8 }} onPress={handleProductDetailsOpslaan}>
                  <Text style={{ color: colors.buttonText, fontWeight: 'bold', fontSize: 18 }}>Opslaan</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
        </KeyboardAvoidingView>
        </Modal>

        {/* Categorie wijzigen modal */}
      <Modal
          visible={toonCategorieModal}
          transparent
        animationType="none"
          onRequestClose={() => setToonCategorieModal(false)}
        >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TouchableOpacity onPress={() => setToonCategorieModal(false)}>
                <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: colors.text }}>Wijzig categorie</Text>
              <View style={{ width: 28 }} />
            </View>
            {bewerkProduct && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 20, flex: 1, color: colors.text }}>{bewerkProduct.naam}</Text>
                <Text style={{ fontSize: 28, marginLeft: 8 }}>{bewerkProduct.categorieEmoji || '🏷️'}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', marginBottom: 16, backgroundColor: colors.background, borderRadius: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: categorieTab === 'Algemeen' ? colors.surface : 'transparent', alignItems: 'center' }}
                onPress={() => setCategorieTab('Algemeen')}
              >
                <Text style={{ fontWeight: 'bold', color: categorieTab === 'Algemeen' ? colors.text : colors.textSecondary }}>Algemeen</Text>
                </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: categorieTab === 'Mijn categorieën' ? colors.surface : 'transparent', alignItems: 'center' }}
                onPress={() => setCategorieTab('Mijn categorieën')}
              >
                <Text style={{ fontWeight: 'bold', color: categorieTab === 'Mijn categorieën' ? colors.text : colors.textSecondary }}>Mijn categorieën</Text>
                </TouchableOpacity>
              </View>
            <FlatList
                data={CATEGORIEEN}
                keyExtractor={item => item.naam}
              renderItem={({ item }) => (
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => handleCategorieWijzigen(item)}>
                  <Text style={{ fontSize: 22, marginRight: 16 }}>{item.emoji}</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>{item.naam}</Text>
                    </TouchableOpacity>
                  )}
            />
            {/* <TouchableOpacity style={{ backgroundColor: '#2196f3', borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginTop: 16 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>MAAK EEN NIEUWE CATEGORIE</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </Modal>

      {/* Sorteer-modal */}
      <Modal
        visible={toonSorteerModal}
          transparent
        animationType="none"
        onRequestClose={() => setToonSorteerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: 320 }]}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TouchableOpacity onPress={() => setToonSorteerModal(false)}>
                <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: colors.text }}>Sorteer op:</Text>
              <TouchableOpacity onPress={() => setToonSorteerModal(false)}>
                <MaterialCommunityIcons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }} onPress={() => setSorteerOptie('Categorieën')}>
              <MaterialCommunityIcons name="sort-variant" size={22} color={sorteerOptie === 'Categorieën' ? colors.success : colors.textSecondary} style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, fontWeight: 'bold', color: sorteerOptie === 'Categorieën' ? colors.success : colors.text }}>Categorieën</Text>
              {sorteerOptie === 'Categorieën' && <MaterialCommunityIcons name="check" size={22} color={colors.success} />}
              </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }} onPress={() => setSorteerOptie('Alfabetisch')}>
              <MaterialCommunityIcons name="sort-alphabetical-variant" size={22} color={sorteerOptie === 'Alfabetisch' ? colors.success : colors.textSecondary} style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, fontWeight: 'bold', color: sorteerOptie === 'Alfabetisch' ? colors.success : colors.text }}>Alfabetisch</Text>
              {sorteerOptie === 'Alfabetisch' && <MaterialCommunityIcons name="check" size={22} color={colors.success} />}
              </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }} onPress={() => setSorteerOptie('Aangepast')}>
              <MaterialCommunityIcons name="sort" size={22} color={sorteerOptie === 'Aangepast' ? colors.success : colors.textSecondary} style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, fontWeight: 'bold', color: sorteerOptie === 'Aangepast' ? colors.success : colors.text }}>Aangepast</Text>
              {sorteerOptie === 'Aangepast' && <MaterialCommunityIcons name="check" size={22} color={colors.success} />}
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary, fontWeight: 'bold', marginTop: 18, marginBottom: 8 }}>AFGEVINKTE ITEMS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, borderRadius: 12, padding: 14, marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>Chronologisch</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Gekochte producten worden gesorteerd in de volgorde waarin ze zijn aangevinkt.</Text>
            </View>
              <TouchableOpacity onPress={() => setChronologischChecked(!chronologischChecked)} style={{ marginLeft: 12 }}>
                <MaterialCommunityIcons name={chronologischChecked ? 'toggle-switch' : 'toggle-switch-off-outline'} size={38} color={chronologischChecked ? colors.success : colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </Modal>

      {/* Vriendelijke duplicaat waarschuwing modal */}
        <Modal
        visible={toonDuplicaatModal}
          transparent
        animationType="fade"
        onRequestClose={() => setToonDuplicaatModal(false)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 24,
            margin: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            maxWidth: '90%',
          }}>
            <MaterialCommunityIcons name="information-outline" size={48} color={colors.success} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 8 }}>
              Weet u zeker?
            </Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
              "{duplicaatProduct}" staat al op uw lijst.{'\n'}Wilt u dit product nog een keer toevoegen?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setToonDuplicaatModal(false);
                  setDuplicaatProduct(null);
                  setToonProductModal(true); // Open de product modal weer
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textSecondary }}>
                  Nee, laat maar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{
                  flex: 1,
                  backgroundColor: colors.success,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
                onPress={async () => {
                  if (duplicaatProduct) {
                    // Voeg het product toe via de normale functie maar bypass de duplicaat check
                    await handleProductToevoegenDirect(duplicaatProduct);
                  }
                  setToonDuplicaatModal(false);
                  setDuplicaatProduct(null);
                  // Open de product modal niet weer omdat het product al is toegevoegd
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                  Ja, toevoegen
              </Text>
              </TouchableOpacity>
          </View>
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={toonMenuModal}
          transparent
        animationType="fade"
        onRequestClose={() => setToonMenuModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setToonMenuModal(false)}
        >
          <TouchableOpacity 
            style={[styles.modalContent, { backgroundColor: colors.surface }]} 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Lijst opties</Text>
              <TouchableOpacity onPress={() => setToonMenuModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>



      {/* Nieuwe Lijst Naam Modal */}
      <Modal
        visible={toonNieuweLijstNaamModal}
        transparent
        animationType="none"
        onRequestClose={() => setToonNieuweLijstNaamModal(false)}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Animated.View style={[styles.modalOverlay, { justifyContent: 'flex-end', opacity: overlayAnimation }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, minHeight: 200 }]}>
              <View style={[styles.modalHeader, { justifyContent: 'center' }]}>
                <Text style={[styles.modalTitle, { color: colors.text, fontSize: 22, textAlign: 'center' }]}>Maak een nieuwe lijst</Text>
                <TouchableOpacity style={{ position: 'absolute', right: 0 }} onPress={() => setToonNieuweLijstNaamModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              </View>
              
              <TextInput
                  style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text, borderColor: '#37af29', borderWidth: 2, fontWeight: '700' }]}
                  placeholder="Nieuwe lijst"
                  placeholderTextColor={colors.textTertiary}
                  placeholderStyle={{ fontWeight: '700' }}
                value={nieuweLijstNaam}
                onChangeText={setNieuweLijstNaam}
                autoFocus
                  onSubmitEditing={bevestigNieuweLijst}
                  returnKeyType="done"
                />
                
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: '#37af29', width: '100%', paddingHorizontal: 32, justifyContent: 'center' }]}
                    onPress={bevestigNieuweLijst}
                  >
                    <Text style={[styles.addButtonText, { textAlign: 'center', color: colors.buttonText, fontWeight: 'bold' }]}>OPSLAAN</Text>
                  </TouchableOpacity>
                </View>
                            </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>

      {/* Nieuw menu-popup */}
      {toonNieuwMenuModal && (
        <TouchableOpacity 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.15)',
            zIndex: 1000
          }}
          activeOpacity={1}
          onPress={() => setToonNieuwMenuModal(false)}
        >
          <Animated.View 
            style={{ 
              position: 'absolute',
              top: 100,
              right: 20,
              backgroundColor: colors.surface, 
              borderRadius: 12, 
              padding: 8,
              minWidth: 200,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 8,
              transform: [{ scale: menuModalAnimation }]
            }}
          >

            <TouchableOpacity style={{ paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }} onPress={handleAlleItemsDeselecteren}>
              <MaterialCommunityIcons name="refresh" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 15, color: colors.text }}>Alle items deselecteren</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }} onPress={handleAlleItemsSelecteren}>
              <MaterialCommunityIcons name="check-all" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 15, color: colors.text }}>Check all items</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }} onPress={handleDeelLijst}>
              <MaterialCommunityIcons name="share-variant" size={20} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 15, color: colors.primary, fontWeight: 'bold' }}>Lijst delen</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}


      {/* Deelcode modal */}
      <Modal
        visible={toonDeelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setToonDeelModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setToonDeelModal(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 12, width: '90%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Lijst delen</Text>
            <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
              Kopieer en deel de lijst via je favoriete app:
            </Text>
            <View style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.divider, marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: colors.text }}>{deelCode}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setToonDeelModal(false)} style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Sluiten</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bonus Info Modal */}
      <Modal
        visible={showBonusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBonusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: colors.surface, 
            borderRadius: 16,
            margin: 20,
            padding: 24,
            maxWidth: '90%',
            alignItems: 'center'
          }]}>
            <View style={{ 
              backgroundColor: '#FF8C00', 
              borderRadius: 50, 
              width: 80, 
              height: 80, 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <MaterialCommunityIcons name="tag" size={40} color="white" />
            </View>
            
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: colors.text, 
              textAlign: 'center', 
              marginBottom: 8 
            }}>
              {selectedBonus?.name}
            </Text>
            
            <Text style={{ 
              fontSize: 16, 
              color: colors.textSecondary, 
              textAlign: 'center', 
              marginBottom: 8 
            }}>
              {selectedBonus?.store}
            </Text>
            
            {/* Display the exact bonus offer prominently */}
            <View style={{ 
              backgroundColor: '#FF8C00', 
              borderRadius: 20, 
              paddingHorizontal: 20, 
              paddingVertical: 12,
              marginBottom: 16,
              minWidth: 200,
              alignItems: 'center'
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: 'white', 
                textAlign: 'center',
                textTransform: 'uppercase'
              }}>
                {selectedBonus?.bonus_description || 'In de bonus'}
              </Text>
            </View>
            
            {selectedBonus?.price && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 12 
              }}>
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: 'bold', 
                  color: colors.success 
                }}>
                  €{selectedBonus.price.toFixed(2)}
                </Text>
                {selectedBonus.original_price && selectedBonus.original_price !== selectedBonus.price && (
                  <Text style={{ 
                    fontSize: 16, 
                    color: colors.textSecondary, 
                    textDecorationLine: 'line-through',
                    marginLeft: 8
                  }}>
                    €{selectedBonus.original_price.toFixed(2)}
                  </Text>
                )}
              </View>
            )}
            
            {/* Show small text when no exact bonus is available */}
            {(!selectedBonus?.bonus_description || selectedBonus?.bonus_description === 'In de bonus') && (
              <Text style={{ 
                fontSize: 12, 
                color: colors.textSecondary, 
                textAlign: 'center', 
                marginBottom: 16,
                opacity: 0.7
              }}>
                Voor de exacte bonus kijk op ah.nl/bonus
              </Text>
            )}
            
            <TouchableOpacity 
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 32,
                alignItems: 'center',
                width: '100%'
              }}
              onPress={() => setShowBonusModal(false)}
            >
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: colors.buttonText 
              }}>
                Sluiten
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {selectMode && selectedListIds.length > 0 && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center', zIndex: 10 }}>
          <TouchableOpacity
            style={{ backgroundColor: colors.error, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 32 }}
            onPress={() => {
              Alert.alert(
                'Lijsten verwijderen',
                `Weet je zeker dat je ${selectedListIds.length} lijst(en) wilt verwijderen?`,
                [
                  { text: 'Annuleren', style: 'cancel' },
                  {
                    text: 'Verwijderen', style: 'destructive', onPress: handleBulkVerwijderLijsten }
                ]
              );
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              Verwijder geselecteerde lijsten ({selectedListIds.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}


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
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  lijstenList: {
    padding: 16,
  },
  lijstCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lijstCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lijstCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lijstCardMenu: {
    padding: 4,
  },
  lijstCardProgress: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  lijstCardProgressBar: {
    height: 4,
    borderRadius: 2,
            backgroundColor: '#37af29',
  },
  lijstCardSubtitle: {
    fontSize: 14,
  },
  productenList: {
    padding: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  productRowChecked: {
  },
  productCheckbox: {
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productNaam: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  productNaamChecked: {
    textDecorationLine: 'line-through',
  },
  productDetails: {
    fontSize: 14,
    marginTop: 2,
  },
  productDelete: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  // styles for temporary actions bar were removed since we now use menu option + single floating add button
  floatingAddButton: {
    position: 'absolute',
    right: 24,
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  shareButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  productOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  productOptionText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: 'bold',
  },
  menuOptions: {
    flex: 1,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
}); 