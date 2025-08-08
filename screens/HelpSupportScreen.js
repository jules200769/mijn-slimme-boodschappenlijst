import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Linking,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [toonContactModal, setToonContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const overlayAnimation = new Animated.Value(0);

  // FAQ data georganiseerd per categorie
  const faqData = {
    'Basis Gebruik': [
      {
        question: 'Hoe maak ik mijn eerste boodschappenlijst?',
        answer: 'Ga naar het "**Lijsten**" tabblad en tik op de "**+**" knop. Geef je lijst een **naam** en begin met het toevoegen van producten. Je kunt producten toevoegen door op de "**Voeg product toe**" knop te tikken.'
      },
      {
        question: 'Hoe werkt real-time samenwerking?',
        answer: 'Wanneer je een lijst **deelt** met anderen, zien alle deelnemers **direct** de wijzigingen die je maakt. Producten die je **toevoegt**, **afvinkt** of **verwijdert** worden automatisch **gesynchroniseerd** met alle andere gebruikers.'
      },
      {
        question: 'Kan ik offline werken?',
        answer: '**Ja!** De app werkt ook zonder **internetverbinding**. Je wijzigingen worden **lokaal opgeslagen** en automatisch **gesynchroniseerd** zodra je weer online bent.'
      }
    ],
    'Delen & Samenwerken': [
      {
        question: 'Hoe deel ik een lijst met anderen?',
        answer: 'Open je lijst en tik op het "**Delen**" icoon. Je kunt de lijst delen via een **link** of door het **e-mailadres** van de andere persoon in te voeren. Zij krijgen dan **toegang** tot dezelfde lijst.'
      },
      {
        question: 'Wie kan mijn lijst zien?',
        answer: 'Alleen mensen die je **expliciet hebt uitgenodigd** kunnen je lijst zien en bewerken. Je lijsten zijn **privé** en worden niet **openbaar gedeeld**.'
      },
      {
        question: 'Kan ik iemand uitnodigen om mijn lijst te bewerken?',
        answer: '**Ja**, je kunt anderen **toestemming** geven om je lijst te bewerken. Zij kunnen dan producten **toevoegen**, **afvinken** en **verwijderen**, net zoals jij dat kunt.'
      }
    ],
    'Notificaties': [
      {
        question: 'Hoe stel ik notificaties in?',
        answer: 'Ga naar **Instellingen** > **Notificaties beheren**. Hier kun je kiezen welke **meldingen** je wilt ontvangen, zoals **herinneringen** voor boodschappen of **updates** van gedeelde lijsten.'
      },
      {
        question: 'Waarom krijg ik geen notificaties?',
        answer: 'Controleer je **notificatie instellingen** in de app en in je **telefoon instellingen**. Zorg ervoor dat notificaties zijn **ingeschakeld** voor deze app in je **systeem instellingen**.'
      }
    ],
    'Probleemoplossing': [
      {
        question: 'Mijn lijst synchroniseert niet, wat nu?',
        answer: 'Probeer eerst de app **opnieuw te starten**. Als dat niet werkt, controleer je **internetverbinding**. Je kunt ook proberen om de **synchronisatie te forceren** door de lijst te verversen.'
      },
      {
        question: 'Ik kan niet inloggen, wat moet ik doen?',
        answer: 'Controleer of je **e-mailadres** en **wachtwoord** correct zijn. Als je je wachtwoord bent vergeten, gebruik dan de "**Wachtwoord vergeten**" functie op het inlogscherm.'
      },
      {
        question: 'De app werkt traag, wat kan ik doen?',
        answer: 'Probeer de app **opnieuw te starten** of je telefoon te **herstarten**. Als het probleem aanhoudt, kun je proberen de app **cache te legen** via je telefoon instellingen.'
      }
    ]
  };

  const toggleCategory = (categoryIndex) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryIndex]: !prev[categoryIndex]
    }));
  };

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Overlay fade-in animatie voor contact modal
  useEffect(() => {
    if (toonContactModal) {
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
  }, [toonContactModal]);

  const handleContactSubmit = async () => {
    if (!contactMessage.trim()) {
      Alert.alert('Fout', 'Vul een bericht in.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          user_id: user.id,
          message_text: contactMessage.trim()
        });

      if (error) {
        console.error('Error submitting contact message:', error);
        Alert.alert('Fout', 'Er is een fout opgetreden bij het versturen van je bericht.');
        return;
      }

      // Toon succes melding
      setShowSuccess(true);
      setContactMessage('');
      setToonContactModal(false);
      
      // Na 2.5 seconden terug naar help & support
      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);

    } catch (error) {
      console.error('Error submitting contact message:', error);
      Alert.alert('Fout', 'Er is een fout opgetreden bij het versturen van je bericht.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

                      <ScrollView 
           contentContainerStyle={styles.scrollContent}
           showsVerticalScrollIndicator={false}
         >
           {/* FAQ Sectie */}
           <View style={styles.faqSection}>
             <Text style={[styles.faqTitle, { color: colors.text }]}>Veelgestelde Vragen</Text>
           
           {Object.entries(faqData).map(([category, questions], categoryIndex) => {
             const isCategoryExpanded = expandedCategories[categoryIndex];
             
             return (
               <View key={category} style={[styles.categoryCard, { backgroundColor: colors.surface }]}>
                 <TouchableOpacity 
                   style={styles.categoryButton}
                   onPress={() => toggleCategory(categoryIndex)}
                 >
                   <Text style={[styles.categoryTitle, { color: colors.primary }]}>{category}</Text>
                   <MaterialCommunityIcons 
                     name={isCategoryExpanded ? "chevron-up" : "chevron-down"} 
                     size={20} 
                     color={colors.primary} 
                   />
                 </TouchableOpacity>
                 
                 {isCategoryExpanded && (
                   <View style={styles.questionsContainer}>
                     {questions.map((item, questionIndex) => {
                       const key = `${categoryIndex}-${questionIndex}`;
                       const isExpanded = expandedQuestions[key];
                       
                       return (
                         <View key={questionIndex} style={styles.questionContainer}>
                           <TouchableOpacity 
                             style={styles.questionButton}
                             onPress={() => toggleQuestion(categoryIndex, questionIndex)}
                           >
                             <Text style={[styles.questionText, { color: colors.text }]}>
                               {item.question}
                             </Text>
                             <MaterialCommunityIcons 
                               name={isExpanded ? "chevron-up" : "chevron-down"} 
                               size={18} 
                               color={colors.textTertiary} 
                             />
                           </TouchableOpacity>
                           
                                                       {isExpanded && (
                              <View style={[styles.answerContainer, { backgroundColor: colors.background }]}>
                                <Text style={[styles.answerText, { color: colors.text }]}>
                                  {item.answer.split('. ').map((sentence, index, array) => {
                                    // Split sentence into parts for bold formatting
                                    const parts = sentence.split(/\*\*(.*?)\*\*/);
                                    return (
                                      <Text key={index}>
                                        {parts.map((part, partIndex) => {
                                          if (partIndex % 2 === 1) {
                                            // Bold text
                                            return (
                                              <Text key={partIndex} style={{ fontWeight: 'bold' }}>
                                                {part}
                                              </Text>
                                            );
                                          } else {
                                            // Regular text
                                            return part;
                                          }
                                        })}
                                        {index < array.length - 1 ? '.' : ''}
                                        {index < array.length - 1 && '\n\n'}
                                      </Text>
                                    );
                                  })}
                                </Text>
                              </View>
                            )}
                           
                           {questionIndex < questions.length - 1 && (
                             <View style={[styles.questionDivider, { backgroundColor: colors.divider }]} />
                           )}
                         </View>
                       );
                     })}
                   </View>
                 )}
               </View>
             );
                        })}
           </View>

           {/* Iets anders? Tekst */}
           <View style={styles.somethingElseContainer}>
             <Text style={[styles.somethingElseText, { color: colors.text }]}>Iets anders?</Text>
           </View>

           {/* Contact Knop */}
           <View style={[styles.contactCard, { backgroundColor: colors.surface }]}>
             <TouchableOpacity style={styles.contactButton} onPress={() => setToonContactModal(true)}>
               <Text style={[styles.contactText, { color: colors.primary }]}>Contacteer ons</Text>
               <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
             </TouchableOpacity>
           </View>
                  </ScrollView>

         {/* Contact Modal */}
         <Modal
           visible={toonContactModal}
           transparent
           animationType="none"
           onRequestClose={() => setToonContactModal(false)}
         >
           <KeyboardAvoidingView 
             style={{ flex: 1 }} 
             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
             keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
           >
             <Animated.View style={[styles.modalOverlay, { justifyContent: 'flex-end', opacity: overlayAnimation }]}>
               <View style={[styles.modalContent, { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, minHeight: 200 }]}>
                 <View style={[styles.modalHeader, { justifyContent: 'center' }]}>
                   <Text style={[styles.modalTitle, { color: colors.text, fontSize: 22, textAlign: 'center' }]}>Contacteer ons</Text>
                   <TouchableOpacity style={{ position: 'absolute', right: 0 }} onPress={() => setToonContactModal(false)}>
                     <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                   </TouchableOpacity>
                 </View>
                 
                 <TextInput
                   style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text, borderColor: '#37af29', borderWidth: 2, fontWeight: '700', minHeight: 120 }]}
                   placeholder="Neem contact met ons op:"
                   placeholderTextColor={colors.textTertiary}
                   placeholderStyle={{ fontWeight: '700' }}
                    keyboardAppearance={isDarkMode ? 'dark' : 'light'}
                   multiline
                   numberOfLines={9}
                   autoFocus
                   value={contactMessage}
                   onChangeText={setContactMessage}
                 />
                 
                 <View style={{ alignItems: 'center', marginTop: 20 }}>
                   <TouchableOpacity 
                     style={[styles.addButton, { backgroundColor: '#37af29', width: '100%', paddingHorizontal: 32, justifyContent: 'center' }]}
                     onPress={handleContactSubmit}
                     disabled={isSubmitting}
                   >
                     {isSubmitting ? (
                       <ActivityIndicator color={colors.buttonText} />
                     ) : (
                       <Text style={[styles.addButtonText, { textAlign: 'center', color: colors.buttonText, fontWeight: 'bold' }]}>VERSTUREN</Text>
                     )}
                   </TouchableOpacity>
                 </View>
               </View>
             </Animated.View>
           </KeyboardAvoidingView>
         </Modal>

         {/* Succes Modal */}
         <Modal
           visible={showSuccess}
           transparent={true}
           animationType="fade"
         >
           <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
             <View style={[styles.thankYouContainer, { backgroundColor: colors.surface }]}>
               <MaterialCommunityIcons name="check-circle" size={48} color={colors.success} />
               <Text style={[styles.thankYouText, { color: colors.text }]}>Succesvol verzonden!</Text>
               <Text style={[styles.thankYouSubText, { color: colors.textSecondary }]}>Wij nemen zo snel mogelijk contact met U op via uw Email.</Text>
             </View>
           </View>
         </Modal>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    padding: 16,
  },

  contactCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  contactText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  somethingElseContainer: {
    marginVertical: 8,
  },
  somethingElseText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  faqSection: {
    marginBottom: 8,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionsContainer: {
    marginTop: 12,
  },
  questionContainer: {
    marginBottom: 8,
  },
  questionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  answerContainer: {
    padding: 12,
    marginTop: 4,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },
             questionDivider: {
    height: 1,
    marginTop: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  thankYouContainer: {
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
  },
  thankYouText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  thankYouSubText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
