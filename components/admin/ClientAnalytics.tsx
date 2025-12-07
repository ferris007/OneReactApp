import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function ClientAnalytics() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Client Analytics</Text>
      <Text>Detailed client analytics will be displayed here.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
