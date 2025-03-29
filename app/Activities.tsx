import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import apiClient from '../services/api';
import { useAuth } from '../AuthContext';

interface Activity {
  id: number;
  name: string;
  date_time: string;
  description: string;
  location: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { token, logout } = useAuth();

  useEffect(() => {
    fetchActivities(selectedDate);
  }, [selectedDate, token]);

  const fetchActivities = async (date: string) => {
    try {
      const response = await apiClient.get(`activities/?start_date=${date}&end_date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(response.data);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleSignup = async (activityId: number) => {
    try {
      await apiClient.post(`/activities/${activityId}/signup/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'You signed up for the activity!');
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUnregister = async (activityId: number) => {
    try {
      await apiClient.post(`/activities/${activityId}/unregister/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'You have unregistered from the activity.');
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleApiError = (error) => {
    if (error.response && error.response.status === 401) {
      Alert.alert("Session Expired", "Your session has expired, please log back in.", [
        { text: "OK", onPress: logout }
      ]);
    } else {
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const renderItem = ({ item }: { item: Activity }) => (
    <View style={styles.card}>
      <Text style={styles.activityName}>{item.name}</Text>
      <Text style={styles.activityDescription}>{item.description}</Text>
      <Text style={styles.activityTime}>{new Date(item.date_time).toLocaleString()}</Text>
      <Text style={styles.activityLocation}>📍 {item.location}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.signupButton} onPress={() => handleSignup(item.id)}>
          <Text style={styles.buttonText}>Join Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.unregisterButton} onPress={() => handleUnregister(item.id)}>
          <Text style={styles.buttonText}>Leave Activity</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: '#007AFF' } }}
      />
      <FlatList
        data={activities}
        keyExtractor={(item) => `${item.id}-${item.date_time}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.noActivities}>No activities for this day.</Text>}
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
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#777',
    marginBottom: 2,
  },
  activityLocation: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signupButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 6,
    marginRight: 5,
    alignItems: 'center',
  },
  unregisterButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 6,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noActivities: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
  },
});
