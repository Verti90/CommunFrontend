import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import apiClient from '../services/api';
import { useAuth } from '../AuthContext';
import { addDays, addMonths, format, startOfWeek, endOfWeek } from 'date-fns';

interface Activity {
  id: number;
  name: string;
  date_time: string;
  description: string;
  location: string;
  participants: number[];
}

export default function WeeklyActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { token, logout, user } = useAuth();

  useEffect(() => {
    fetchActivities(currentDate);
  }, [currentDate, token]);

const fetchActivities = async (date: Date) => {
  const now = new Date();
  const twoMonthsAhead = addMonths(now, 2);
  
  if (date > twoMonthsAhead) {
    Alert.alert('Error', 'You can only view activities up to two months ahead.');
    return;
  }

  const start = format(startOfWeek(date), 'yyyy-MM-dd');
  const end = format(endOfWeek(date), 'yyyy-MM-dd');

    try {
      const response = await apiClient.get(`activities/?start_date=${start}&end_date=${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch activities.');
    }
  };

  const changeWeek = (direction: number) => {
  const potentialNextWeek = addDays(currentDate, direction * 7);
  const twoMonthsAhead = addMonths(new Date(), 2);

  if (potentialNextWeek <= twoMonthsAhead) {
    setCurrentDate(potentialNextWeek);
  } else {
    Alert.alert('Error', 'You can only view activities up to two months ahead.');
  }
};

const handleSignup = async (activityId: number, occurrence_date: string) => {
  try {
    await apiClient.post(`/activities/${activityId}/signup/`, { occurrence_date }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Alert.alert('Success', 'You signed up for the activity!');
    fetchActivities(currentDate);
  } catch (error) {
    Alert.alert('Error', 'Unable to sign up.');
  }
};

const handleUnregister = async (activityId: number, occurrence_date: string) => {
  try {
    await apiClient.post(`/activities/${activityId}/unregister/`, { occurrence_date }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Alert.alert('Success', 'You unregistered from the activity.');
    fetchActivities(currentDate);
  } catch (error) {
    Alert.alert('Error', 'Unable to unregister.');
  }
};
  
  const renderItem = ({ item }: { item: Activity }) => {
    const alreadyJoined = user?.id ? item.participants.includes(user.id) : false;

    return (
      <View style={styles.card}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activityTime}>{format(new Date(item.date_time), 'EEEE, MMM d, yyyy h:mm a')}</Text>
        <Text style={styles.activityLocation}>📍 {item.location}</Text>
        <View style={styles.buttonContainer}>
          {!alreadyJoined ? (
            <TouchableOpacity style={styles.joinButton} onPress={() => handleSignup(item.id, item.date_time)}>
	      <Text style={styles.buttonText}>Join</Text>
	    </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.leaveButton} onPress={() => handleUnregister(item.id, item.date_time)}>
	      <Text style={styles.buttonText}>Leave</Text>
	    </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => changeWeek(-1)}>
          <Text style={styles.navText}>Previous Week</Text>
        </TouchableOpacity>
      <Text style={styles.weekLabel}>
        {format(startOfWeek(currentDate), 'EEEE MMM d')} - {format(endOfWeek(currentDate), 'EEEE MMM d, yyyy')}
      </Text>
        <TouchableOpacity style={styles.navButton} onPress={() => changeWeek(1)}>
          <Text style={styles.navText}>Next Week</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => `${item.id}-${item.date_time}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.noActivities}>No activities scheduled this week.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F3E7', padding: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginVertical: 8 },
  activityName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  activityTime: { fontSize: 16, marginBottom: 4 },
  activityLocation: { fontSize: 16 },
  noActivities: { textAlign: 'center', fontSize: 18, marginTop: 20 },
  navigationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  navButton: { padding: 10, backgroundColor: '#007AFF', borderRadius: 8 },
  navText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  weekLabel: { fontSize: 18, fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', marginTop: 10 },
  joinButton: { flex: 1, backgroundColor: '#27ae60', padding: 12, borderRadius: 8, alignItems: 'center' },
  leaveButton: { flex: 1, backgroundColor: '#e74c3c', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
