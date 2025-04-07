import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../services/api';
import { useAuth } from '../AuthContext';
import {
  format,
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  parseISO,
} from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getWeekRange, getDateForWeekdayIndex } from '../utils/time';
import { toCentralUtcISOString } from '../utils/time';

interface Activity {
  id: number;
  name: string;
  date_time: string;
  description: string;
  location: string;
  participants: number[];
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StaffActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: '',
    description: '',
    location: '',
    date_time: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [preFilledDate, setPreFilledDate] = useState<Date | null>(null);
  const [dateLocked, setDateLocked] = useState(false);

  const { token } = useAuth();
  const navigation = useNavigation();

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

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

  const addActivity = async () => {
  const missingFields = [];
  if (!newActivity.name) missingFields.push('Name');
  if (!newActivity.description) missingFields.push('Description');
  if (!newActivity.location) missingFields.push('Location');
  if (!newActivity.date_time) missingFields.push('Date & Time');

  if (missingFields.length > 0) {
    Alert.alert('Missing Fields', `Please provide: ${missingFields.join(', ')}`);
    return;
  }

  try {
    await apiClient.post('activities/', newActivity, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setModalVisible(false);
    setNewActivity({ name: '', description: '', location: '', date_time: '' });
    setSelectedDate(null);
    setPreFilledDate(null);
    setDateLocked(false);
    fetchActivities(currentDate);
  } catch (error) {
    Alert.alert('Error', 'Could not add activity. Please try again.');
  }
};

  const deleteActivity = async (id: number) => {
    try {
      await apiClient.delete(`activities/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchActivities(currentDate);
    } catch (error) {
      Alert.alert('Error', 'Could not delete activity.');
    }
  };

  const groupByDay = (): Record<string, Activity[]> => {
    const map: Record<string, Activity[]> = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    };
    activities.forEach((activity) => {
      const localDate = new Date(parseISO(activity.date_time));
      const localMidnight = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
      const day = format(localMidnight, 'EEEE');
      if (map[day]) map[day].push(activity);
    });
    return map;
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

  const getDateForDay = (index: number): string => {
  const dayDate = getDateForWeekdayIndex(currentDate, index);
  return format(dayDate, 'MMM d');
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Staff Activity Manager</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => {
        setModalVisible(true);
        setDateLocked(false);
      }}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>

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
        {daysOfWeek.map((day, index) => (
          <View key={day} style={styles.dayBox}>
            <Text style={styles.dayHeader}>{day} - {getDateForDay(index)}</Text>
            {groupedActivities[day].length === 0 ? (
              <Text style={styles.noActivity}>No activities</Text>
            ) : (
              groupedActivities[day].map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <Text style={styles.activityText}>{format(parseISO(activity.date_time), 'h:mm a')} - {activity.name}</Text>
                  <Text style={styles.locationText}>📍 {activity.location}</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteActivity(activity.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditActivity', { activityId: activity.id })}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
            <TouchableOpacity
              style={styles.addDayButton}
              onPress={() => {
                const dayDate = getDateForWeekdayIndex(currentDate, index);
                setPreFilledDate(new Date(dayDate));
                setDateLocked(true);
                setModalVisible(true);
              }}
            >
              <Text style={styles.addDayButtonText}>+ Add Activity</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>New Activity</Text>
          <TextInput placeholder="Name" style={styles.input} value={newActivity.name} onChangeText={(text) => setNewActivity({ ...newActivity, name: text })} />
          <TextInput placeholder="Description" style={styles.input} value={newActivity.description} onChangeText={(text) => setNewActivity({ ...newActivity, description: text })} />
          <TextInput placeholder="Location" style={styles.input} value={newActivity.location} onChangeText={(text) => setNewActivity({ ...newActivity, location: text })} />

          {dateLocked ? (
            <View style={styles.input}>
              <Text>{preFilledDate ? format(preFilledDate, 'yyyy-MM-dd') : ''}</Text>
            </View>
          ) : (
           <>
	    <TouchableOpacity onPress={() => setDatePickerVisible(true)} style={styles.input}>
	      <Text>{selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'Select Date'}</Text>
	    </TouchableOpacity>

	    <TouchableOpacity onPress={() => setTimePickerVisible(true)} style={styles.input}>
	      <Text>{selectedDate ? format(selectedDate, 'hh:mm a') : 'Select Time'}</Text>
	    </TouchableOpacity>
	  </>
	  )}

          <DateTimePickerModal
	  isVisible={isDatePickerVisible}
	  mode="date"
	  date={selectedDate || new Date()}
	  onConfirm={(date) => {
	  setDatePickerVisible(false);
	  const time = selectedDate || new Date();
	  const combined = new Date(
	    date.getFullYear(),
	    date.getMonth(),
	    date.getDate(),
	    time.getHours(),
	    time.getMinutes()
	  );

	  setSelectedDate(combined);
	  setNewActivity((prev) => ({ ...prev, date_time: toCentralUtcISOString(combined) }));
	}}
	  onCancel={() => setDatePickerVisible(false)}
	/>

	  <DateTimePickerModal
	  isVisible={isTimePickerVisible}
	  mode="time"
	  date={selectedDate || new Date()}
	  onConfirm={(time) => {
	  setTimePickerVisible(false);
	  const date = selectedDate || new Date();
	  const combined = new Date(
	    date.getFullYear(),
	    date.getMonth(),
	    date.getDate(),
	    time.getHours(),
	    time.getMinutes()
	  );
	
	  setSelectedDate(combined);
	  setNewActivity((prev) => ({ ...prev, date_time: toCentralUtcISOString(combined) }));
	}}

  onCancel={() => setTimePickerVisible(false)}
/>


          <TouchableOpacity style={styles.modalButton} onPress={addActivity}>
            <Text style={styles.modalButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => {
            setModalVisible(false);
            setDateLocked(false);
          }}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#f3f0e9' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  addButton: { backgroundColor: '#27ae60', padding: 10, borderRadius: 10, marginBottom: 10 },
  addButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  navigationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  navButton: { backgroundColor: '#999', padding: 10, borderRadius: 10 },
  navText: { color: 'white' },
  weekLabel: { fontSize: 16, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dayBox: { width: '48%', backgroundColor: 'white', borderRadius: 16, padding: 12, marginBottom: 10, minHeight: 140 },
  dayHeader: { fontSize: 18, fontWeight: '600', borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 5 },
  activityCard: { marginTop: 8, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 6 },
  activityText: { fontSize: 14, fontWeight: '500' },
  locationText: { fontSize: 13, color: '#555' },
  deleteButton: { marginTop: 5, backgroundColor: '#e74c3c', padding: 5, borderRadius: 5 },
  deleteText: { color: 'white', textAlign: 'center' },
  editButton: { marginTop: 5, backgroundColor: '#2980b9', padding: 5, borderRadius: 5 },
  editText: { color: 'white', textAlign: 'center' },
  noActivity: { fontStyle: 'italic', color: '#aaa', marginTop: 8 },
  modalContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f3f0e9' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  modalButton: { backgroundColor: '#2f80ed', padding: 12, borderRadius: 6, marginTop: 10 },
  modalButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  cancelButton: { backgroundColor: '#999' },
  addDayButton: { backgroundColor: '#27ae60', padding: 6, borderRadius: 8, marginTop: 10 },
  addDayButtonText: { color: 'white', fontSize: 13, textAlign: 'center' },
});
