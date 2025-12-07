import React from 'react';
import { View, StyleSheet } from 'react-native';

type ProgressProps = {
  value?: number;
};

const Progress = ({ value }: ProgressProps) => {
  return (
    <View style={styles.progressBar}>
      <View style={[styles.progressIndicator, { width: `${value || 0}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
});

export { Progress };
