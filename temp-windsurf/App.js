import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Keyboard, View } from 'react-native';
import { Provider as PaperProvider, TextInput, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'; // Placeholder, update as needed
const DEEPSEEK_API_KEY = 'sk-83e6b712d24147dbb12ef3ff1d40264b'; // TODO: Replace with your actual API key

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setError('');
    setResponse('');
    try {
      const res = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat', // or the correct model name for DeepSeek
          messages: [
            { role: 'user', content: prompt },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const aiMessage = res.data?.choices?.[0]?.message?.content || 'No response from AI.';
      setResponse(aiMessage);
    } catch (err) {
      setError('Failed to fetch AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResponse('');
    setError('');
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Your note or prompt"
                value={prompt}
                onChangeText={setPrompt}
                mode="outlined"
                returnKeyType="done"
                onSubmitEditing={handleSend}
                style={styles.input}
                autoFocus
                blurOnSubmit
                editable={!loading}
              />
              <View style={styles.buttonRow}>
                <Button mode="contained" onPress={handleSend} disabled={!prompt || loading} style={styles.button}>
                  Send
                </Button>
                <Button mode="outlined" onPress={handleClear} disabled={loading} style={styles.button}>
                  Clear
                </Button>
              </View>
              {loading && <ActivityIndicator animating={true} style={styles.loading} />}
              {error ? (
                <Text style={styles.error}>{error}</Text>
              ) : response ? (
                <Card style={styles.responseCard}>
                  <Card.Content>
                    <Text>{response}</Text>
                  </Card.Content>
                </Card>
              ) : null}
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 8,
    borderRadius: 12,
    elevation: 2,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  loading: {
    marginVertical: 12,
  },
  error: {
    color: 'red',
    marginVertical: 8,
    textAlign: 'center',
  },
  responseCard: {
    marginTop: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
});
