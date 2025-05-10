// app/(tabs)/manage-transportation.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function ManageTransportation() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Transportation</Text>
      {/* Add your transportation management logic here */}
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