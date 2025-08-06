import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export default function PrimaryButton({ title, onPress, style, fullWidth = false, ...props }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: '#37af29', shadowColor: '#37af29' },
        fullWidth && { alignSelf: 'stretch' },
        style,
      ]}
      activeOpacity={0.85}
      {...props}
    >
      <Text style={[styles.text, { color: '#fff' }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    marginVertical: 8,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
}); 