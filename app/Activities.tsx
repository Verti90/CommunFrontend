import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getActivities } from '../services/api';

interface Activity {
  id: number;
  name: string;
  date_time: string;
  description: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await getActivities();
        setActivities(response);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, []);

  const renderItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.activityName}>{item.name}</Text>
      <Text style={styles.activityDescription}>{item.description}</Text>
      <Text style={styles.activityTime}>{new Date(item.date_time).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        keyExtractor={(item) => `${item.id}-${item.date_time}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3E7',
    padding: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  activityDescription: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#777',
  },
});
