import React, { useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleStarPress = (starNumber) => {
    setRating(starNumber);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starContainer}
        >
          <MaterialCommunityIcons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#FFD700" : "#ccc"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const handleSubmit = async () => {
    // Validatie: minimaal 1 ster OF tekst
    if (rating === 0 && feedbackText.trim() === '') {
      Alert.alert('Fout', 'Vul minimaal een rating of feedback tekst in.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          rating: rating > 0 ? rating : null,
          feedback_text: feedbackText.trim() !== '' ? feedbackText.trim() : null
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        Alert.alert('Fout', 'Er is een fout opgetreden bij het versturen van je feedback.');
        return;
      }

      // Toon bedankt melding
      setShowThankYou(true);
      
      // Na 2 seconden terug naar instellingen
      setTimeout(() => {
        setShowThankYou(false);
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Fout', 'Er is een fout opgetreden bij het versturen van je feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feedback geven</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Sterren Rating */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Hoe waardeer je de app?</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 ? 'Zeer slecht' : 
                 rating === 2 ? 'Slecht' : 
                 rating === 3 ? 'Gemiddeld' : 
                 rating === 4 ? 'Goed' : 'Uitstekend'}
              </Text>
            )}
          </View>

          {/* Feedback Tekst */}
          <View style={styles.textSection}>
            <Text style={styles.sectionTitle}>Jouw feedback (optioneel)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Deel je ervaringen, suggesties of problemen..."
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Versturen Knop */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (rating === 0 && feedbackText.trim() === '') && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || (rating === 0 && feedbackText.trim() === '')}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Versturen</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bedankt Modal */}
      <Modal
        visible={showThankYou}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.thankYouContainer}>
            <MaterialCommunityIcons name="check-circle" size={48} color="#4CAF50" />
            <Text style={styles.thankYouText}>Bedankt voor je feedback!</Text>
          </View>
        </View>
      </Modal>
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
  ratingSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starContainer: {
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  textSection: {
    marginBottom: 30,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouContainer: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  thankYouText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
}); 