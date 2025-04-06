import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import apiClient from '../services/api';
import { useAuth } from '../AuthContext';
import {
  format,
  addDays,
  addMonths,
  parseISO,
} from 'date-fns';
import { getWeekRange } from '../utils/time';

interface Activity {
  id: number;
  name: string;
  date_time: string;
  description: string;
  location: string;
  participants: number[];
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklyActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { token, user } = useAuth();

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

    const { start, end } = getWeekRange(date);
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    try {
      const response = await apiClient.get(`activities/?start_date=${startStr}&end_date=${endStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch activities.');
    }
  };

  const groupByDay = (): Record<string, Activity[]> => {
    const map: Record<string, Activity[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    activities.forEach((activity) => {
      const localDate = new Date(parseISO(activity.date_time));
      const localMidnight = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
      const day = format(localMidnight, 'EEEE');
      if (map[day]) {
        map[day].push(activity);
      }
    });
    return map;
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

  const changeWeek = (direction: number) => {
  const potentialNextWeek = addDays(currentDate, direction * 7);
  const twoMonthsAhead = addMonths(new Date(), 2);

  if (potentialNextWeek <= twoMonthsAhead) {
    setCurrentDate(potentialNextWeek);
  } else {
    Alert.alert('Error', 'You can only view activities up to two months ahead.');
  }
};

  const groupedActivities = groupByDay();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Weekly Schedule</Text>
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => changeWeek(-1)}>
          <Text style={styles.navText}>Previous Week</Text>
        </TouchableOpacity>
        <Text style={styles.weekLabel}>
          {format(getWeekRange(currentDate).start, 'MMM d')} - {format(getWeekRange(currentDate).end, 'MMM d, yyyy')}
        </Text>
        <TouchableOpacity style={styles.navButton} onPress={() => changeWeek(1)}>
          <Text style={styles.navText}>Next Week</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {daysOfWeek.map((day) => (
          <View key={day} style={styles.dayBox}>
            <Text style={styles.dayHeader}>{day}</Text>
            {groupedActivities[day].length === 0 ? (
              <Text style={styles.noActivity}>No activities</Text>
            ) : (
              groupedActivities[day].map((activity) => {
                const joined = user?.id && activity.participants.includes(user.id);
                return (
                  <View
                    key={`${activity.id}-${activity.date_time}`}
                    style={[styles.activityCard, joined && styles.signedUpCard]}
                  >
                    <Text style={styles.activityText}>{format(parseISO(activity.date_time), 'h:mm a')} - {activity.name}</Text>
                    <Text style={styles.locationText}>📍 {activity.location}</Text>
                    {joined ? (
                      <TouchableOpacity style={styles.cancelButton} onPress={() => handleUnregister(activity.id, activity.date_time)}>
                        <Text style={styles.cancelText}>×</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => handleSignup(activity.id, activity.date_time)}>
                        <Text style={styles.signupLink}>Sign Up</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#f3f0e9' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  navigationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  navButton: { backgroundColor: '#c8b6a6', padding: 10, borderRadius: 10 },
  navText: { color: 'white', fontWeight: 'bold' },
  weekLabel: { fontSize: 16, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dayBox: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dayHeader: { fontSize: 18, fontWeight: '600', borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 5 },
  activityCard: {
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 6,
    position: 'relative',
  },
  signedUpCard: {
    backgroundColor: '#d1f7d6',
  },
  activityText: { fontSize: 14, fontWeight: '500' },
  locationText: { fontSize: 13, color: '#555' },
  signupLink: { color: '#007AFF', marginTop: 4 },
  cancelButton: {
    position: 'absolute',
    top: 4,
    right: 6,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: 'white', fontWeight: 'bold', fontSize: 14, lineHeight: 18 },
  noActivity: { fontStyle: 'italic', color: '#aaa', marginTop: 8 },
});
