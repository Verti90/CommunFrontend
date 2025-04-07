import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import apiClient from '../services/api';
import { useAuth } from '../AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { toCentralUtcISOString } from '../utils/time';

export default function EditActivity() {
  const { token } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { activityId } = route.params as { activityId: number };

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState({
    name: '',
    description: '',
    location: '',
    date_time: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  useEffect(() => {
    fetchActivity();
  }, [activityId]);

  const fetchActivity = async () => {
    try {
      const response = await apiClient.get(`activities/${activityId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivity(response.data);
      setSelectedDate(new Date(response.data.date_time));
    } catch (error) {
      Alert.alert('Error', 'Failed to load activity details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const missingFields = [];
    if (!activity.name) missingFields.push('Name');
    if (!activity.description) missingFields.push('Description');
    if (!activity.location) missingFields.push('Location');
    if (!activity.date_time) missingFields.push('Date & Time');

    if (missingFields.length > 0) {
      Alert.alert('Missing Fields', `Please provide: ${missingFields.join(', ')}`);
      return;
    }

    try {
      await apiClient.put(`activities/${activityId}/`, activity, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Activity updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update activity.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Activity</Text>

      <TextInput
        placeholder="Name"
        style={styles.input}
        value={activity.name}
        onChangeText={(text) => setActivity({ ...activity, name: text })}
      />
      <TextInput
        placeholder="Description"
        style={styles.input}
        value={activity.description}
        onChangeText={(text) => setActivity({ ...activity, description: text })}
      />
      <TextInput
        placeholder="Location"
        style={styles.input}
        value={activity.location}
        onChangeText={(text) => setActivity({ ...activity, location: text })}
      />

      <TouchableOpacity onPress={() => setDatePickerVisible(true)} style={styles.input}>
        <Text>{selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'Select Date'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setTimePickerVisible(true)} style={styles.input}>
        <Text>{selectedDate ? format(selectedDate, 'hh:mm a') : 'Select Time'}</Text>
      </TouchableOpacity>

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
	  setActivity({ ...activity, date_time: toCentralUtcISOString(combined) });
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
	  setActivity({ ...activity, date_time: toCentralUtcISOString(combined) });
	}}
        onCancel={() => setTimePickerVisible(false)}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Activity</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2f80ed',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
