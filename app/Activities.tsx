import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import apiClient from '../services/api';
import { useAuth } from '../AuthContext';

interface Activity {
  id: number;
  name: string;
  date_time: string;
  description: string;
  location: string;
  participants: number[];
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { token, logout, user } = useAuth();
  const [refreshToggle, setRefreshToggle] = useState(false);

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
      fetchActivities(selectedDate);
      setRefreshToggle(prev => !prev);
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
      fetchActivities(selectedDate);
      setRefreshToggle(prev => !prev);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleApiError = (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        Alert.alert("Session Expired", "Your session has expired, please log back in.", [
          { text: "OK", onPress: logout }
        ]);
      } else if (data.detail === "Already signed up.") {
        Alert.alert("Info", "You're already signed up for this activity.");
      } else if (data.detail === "Not registered for activity.") {
        Alert.alert("Info", "You're not registered for this activity.");
      } else {
        console.error("Unhandled API error:", data);
        Alert.alert('Error', 'Something went wrong: ' + (data.detail || 'Unknown error.'));
      }
    } else {
      Alert.alert('Network Error', 'Please check your internet connection.');
    }
  };

  const renderItem = ({ item }: { item: Activity }) => {
    const userId = user?.id;
    const alreadyJoined = !!(userId && item.participants.includes(userId));

    console.log("Rendering activity:", item.id, "user.id:", userId, "participants:", item.participants, "alreadyJoined:", alreadyJoined);

    return (
      <View style={styles.card}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityTime}>{new Date(item.date_time).toLocaleString()}</Text>
        <Text style={styles.activityLocation}>📍 {item.location}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.buttonBase,
              alreadyJoined ? styles.buttonDisabled : styles.signupButton
            ]}
            onPress={() => handleSignup(item.id)}
            disabled={alreadyJoined || !userId}
          >
            <Text style={styles.buttonText}>Join Activity</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonBase,
              !alreadyJoined ? styles.buttonDisabled : styles.unregisterButton
            ]}
            onPress={() => handleUnregister(item.id)}
            disabled={!alreadyJoined || !userId}
          >
            <Text style={styles.buttonText}>Leave Activity</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!user?.id) {
    console.log("⏳ Waiting for user to load...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: '#007AFF' } }}
      />
      <FlatList
        data={activities}
        extraData={refreshToggle}
        keyExtractor={(item) => `${item.id}-${item.date_time}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.noActivities}>No activities for this day.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F3E7', padding: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginVertical: 8 },
  activityName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  activityDescription: { fontSize: 15, marginBottom: 4 },
  activityTime: { fontSize: 14, marginBottom: 2 },
  activityLocation: { fontSize: 14, marginBottom: 8 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  buttonBase: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  signupButton: {
    backgroundColor: '#27ae60',
  },
  unregisterButton: {
    backgroundColor: '#e74c3c',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  noActivities: { marginTop: 20, textAlign: 'center', fontSize: 16 },
});
