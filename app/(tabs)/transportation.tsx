import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@auth';
import apiClient from '@services/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { sendImmediateNotification } from '@utils/notifications';

export default function Transportation() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<{ first_name: string; last_name: string; room_number: string }>({
    first_name: '',
    last_name: '',
    room_number: '',
  });

  const [selectedRequest, setSelectedRequest] = useState<'Medical' | 'Personal' | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [address, setAddress] = useState('');

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'medical' | 'personal' | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

useFocusEffect(
  useCallback(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { first_name, last_name, room_number } = response.data;
        setProfile({ first_name, last_name, room_number });
      } catch (error) {
        if (error.response?.status === 401) {
          Alert.alert('Session Expired', 'Please log in again.', [{ text: 'OK', onPress: logout }]);
        } else {
          Alert.alert('Error', 'Could not load profile.');
        }
      }
    };

    fetchProfile();
    setSelectedRequest(null);
    setDoctorName('');
    setAppointmentTime('');
    setDestinationName('');
    setPickupTime('');
    setAddress('');
    setPickerTarget(null);
    setSelectedDate(null);
    setShowTimePicker(false);
  }, [token])
);

  const handleTimeConfirm = (date: Date) => {
    const formatted = format(date, 'EEEE, MMMM d \'at\' h:mm a');
    setSelectedDate(date);
    if (pickerTarget === 'medical') {
      setAppointmentTime(formatted);
    } else if (pickerTarget === 'personal') {
      setPickupTime(formatted);
    }
    setShowTimePicker(false);
    setPickerTarget(null);
  };

  const handleSubmit = async () => {
    if (!selectedRequest) {
      Alert.alert('Selection Required', 'Please choose a transportation type.');
      return;
    }

    // Future logic: limit to 2 riders per 2-hour window
    // const blockStart = Math.floor((selectedDate?.getHours() ?? 0) / 2) * 2;
    // const blockKey = `${format(selectedDate!, 'yyyy-MM-dd')} ${blockStart}:00`;
    // const { data: count } = await apiClient.get(`/transportation/capacity?slot=${blockKey}`);
    // if (count >= 2) {
    //   Alert.alert('Time Slot Full', 'Please select another time.');
    //   return;
    // }

    const baseData = {
      resident_name: `${profile.first_name} ${profile.last_name}`,
      room_number: profile.room_number,
      request_type: selectedRequest,
      status: 'Pending',
    };

    let requestData;
    if (selectedRequest === 'Medical') {
      if (!doctorName.trim() || !appointmentTime.trim()) {
        Alert.alert('Missing Info', 'Doctor Name and Appointment Time are required.');
        return;
      }
      requestData = {
        ...baseData,
        doctor_name: doctorName,
        appointment_time: appointmentTime,
        address,
      };
    } else {
      if (!destinationName.trim() || !pickupTime.trim()) {
        Alert.alert('Missing Info', 'Destination Name and Pick-up Time are required.');
        return;
      }
      requestData = {
        ...baseData,
        destination_name: destinationName,
        pickup_time: pickupTime,
        address,
      };
    }

    try {
      await apiClient.post('/transportation/', requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Your transportation request has been submitted.');
      await sendImmediateNotification(
        'Transportation Request Submitted',
        'Your request is being processed.'
      );
      setSelectedRequest(null);
      setDoctorName('');
      setAppointmentTime('');
      setDestinationName('');
      setPickupTime('');
      setAddress('');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong submitting your request.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transportation</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Name: <Text style={styles.infoValue}>{profile.first_name} {profile.last_name}</Text>
        </Text>
        <Text style={styles.infoText}>
          Room Number: <Text style={styles.infoValue}>{profile.room_number}</Text>
        </Text>
      </View>

<TouchableOpacity
  style={[
    styles.button,
    { backgroundColor: '#26A69A' },
    selectedRequest === 'Medical' && styles.selected,
  ]}
  onPress={() => setSelectedRequest('Medical')}
>
  <Text style={styles.buttonText}>🚑 Medical Transportation</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[
    styles.button,
    { backgroundColor: '#5C6BC0' },
    selectedRequest === 'Personal' && styles.selected,
  ]}
  onPress={() => setSelectedRequest('Personal')}
>
  <Text style={styles.buttonText}>🛍️ Personal Transportation</Text>
</TouchableOpacity>

{selectedRequest === 'Medical' && (
  <>
    <TextInput
      style={styles.textInput}
      placeholder="Dr. Name"
      value={doctorName}
      onChangeText={setDoctorName}
    />
    <TextInput
      style={styles.textInput}
      placeholder="Address (optional)"
      value={address}
      onChangeText={setAddress}
    />
    <TouchableOpacity
      style={styles.textInput}
      onPress={() => {
        setPickerTarget('medical');
        setShowTimePicker(true);
      }}
    >
      <Text style={{ fontSize: 18 }}>
        {appointmentTime || 'Select Appointment Time'}
      </Text>
    </TouchableOpacity>
  </>
)}

{selectedRequest === 'Personal' && (
  <>
    <TextInput
      style={styles.textInput}
      placeholder="Destination Name"
      value={destinationName}
      onChangeText={setDestinationName}
    />
    <TextInput
      style={styles.textInput}
      placeholder="Address (optional)"
      value={address}
      onChangeText={setAddress}
    />
    <TouchableOpacity
      style={styles.textInput}
      onPress={() => {
        setPickerTarget('personal');
        setShowTimePicker(true);
      }}
    >
      <Text style={{ fontSize: 18 }}>
        {pickupTime || 'Select Pick-up Time'}
      </Text>
    </TouchableOpacity>
  </>
)}

{selectedRequest && (
  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
    <Text style={styles.submitButtonText}>Submit Request</Text>
  </TouchableOpacity>
)}

<DateTimePickerModal
  isVisible={showTimePicker}
  mode="datetime"
  date={selectedDate || new Date()}
  onConfirm={handleTimeConfirm}
  onCancel={() => setShowTimePicker(false)}
/>
</View>
);
}   

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3E7',
    padding: 24,
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 1,
  },
  infoText: {
    fontSize: 20,
    color: '#444',
    marginBottom: 8,
  },
  infoValue: {
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginVertical: 12,
    elevation: 3,
    alignItems: 'center',
  },
  selected: {
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    elevation: 3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});