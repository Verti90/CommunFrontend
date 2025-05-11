import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import apiClient from '@services/api';
import { useAuth } from '@auth';
import { getWeekRange } from '@utils/time';
import { format, addDays, addMonths, parseISO } from 'date-fns';
import { sendImmediateNotification } from '@utils/notifications';

interface Activity {
  id: number;
  name: string;
  date_time: string;
  description: string;
  location: string;
  participants: number[];
  capacity: number;
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
      await sendImmediateNotification(
        'Activity Signup Confirmed',
        'You’re signed up! Don’t forget your activity.'
      );
      setTimeout(() => fetchActivities(currentDate), 500);
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
      await sendImmediateNotification(
        'Activity Unregistered',
        'You’ve been removed from this activity.'
      );
      setTimeout(() => fetchActivities(currentDate), 500);
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
      <Text style={styles.title}>Weekly Activities Schedule</Text>
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
        {daysOfWeek.map((day, index) => {
          const dateForDay = format(addDays(getWeekRange(currentDate).start, index), 'MMM d');
          return (
            <View key={day} style={styles.dayBox}>
              <Text style={styles.dayHeader}>
                {day} <Text style={styles.dateText}>{dateForDay}</Text>
              </Text>
              {groupedActivities[day].length === 0 ? (
                <Text style={styles.noActivity}>No activities</Text>
              ) : (
                groupedActivities[day].map((activity) => {
                  const joined = user?.id && activity.participants.includes(user.id);
                  console.log(`[Resident View] ${activity.name} | ${activity.date_time} | ${activity.participants.length}/${activity.capacity}`);
                  return (
                    <View
                      key={`${activity.id}-${activity.date_time}`}
                      style={[styles.activityCard, joined && styles.signedUpCard]}
                    >
                      <Text style={styles.activityText}>
                        {format(parseISO(activity.date_time), 'h:mm a')} - {activity.name}
                      </Text>
                      <Text style={styles.locationText}>📍 {activity.location}</Text>
                      {activity.capacity > 0 && (
                        <Text style={styles.locationText}>
                          {activity.participants.length}/{activity.capacity} signed up
                        </Text>
                      )}
                      {activity.capacity > 0 &&
                        activity.participants.length >= activity.capacity &&
                        !joined && (
                          <Text style={{ color: 'gray', marginTop: 4 }}>[FULL]</Text>
                        )}
                      {joined ? (
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => handleUnregister(activity.id, activity.date_time)}
                        >
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
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F3F3E7',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#c8b6a6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  navText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayBox: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dayHeader: {
    fontSize: 34,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },

  activityCard: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    position: 'relative',
  },
  signedUpCard: {
    backgroundColor: '#d1f7d6',
  },
  activityText: {
    fontSize: 18,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 16,
    color: '#555',
  },
  signupLink: {
    color: '#007AFF',
    marginTop: 6,
    fontSize: 16,
  },

  cancelButton: {
    position: 'absolute',
    top: 4,
    right: 6,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 20,
  },

  noActivity: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#aaa',
    marginTop: 12,
  },
});