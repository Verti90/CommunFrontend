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
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const handleConfirm = (date: Date) => {
    setPickerVisible(false);
    setSelectedDate(date);
    setActivity({
      ...activity,
      date_time: date.toISOString(),
    });
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

      <TouchableOpacity onPress={() => setPickerVisible(true)} style={styles.input}>
         <Text>{selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'Select Date'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setPickerVisible(true)} style={styles.input}>
         <Text>{selectedDate ? format(selectedDate, 'hh:mm a') : 'Select Time'}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="datetime"
        date={selectedDate || new Date()}
        onConfirm={handleConfirm}
        onCancel={() => setPickerVisible(false)}
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
