import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Transportation() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transportation</Text>
      {/* Add your transportation request form or view here */}
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