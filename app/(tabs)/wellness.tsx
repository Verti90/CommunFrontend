import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Wellness() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wellness</Text>
      {/* Add your wellness features here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3E7',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});