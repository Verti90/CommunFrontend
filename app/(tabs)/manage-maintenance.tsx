import { View, Text, StyleSheet } from 'react-native';

export default function ManageMaintenance() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Maintenance</Text>
      {/* Add your maintenance management UI here */}
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