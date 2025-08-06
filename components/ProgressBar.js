import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProgressBar({ progress = 0, height = 8, style }) {
  return (
    <View style={[styles.container, { backgroundColor: '#e0e0e0', height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.max(0, Math.min(progress, 1)) * 100}%`,
            backgroundColor: '#37af29',
            borderRadius: height / 2,
            height: '100%',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
}); 