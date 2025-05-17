import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@auth';
import apiClient from '@services/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { sendImmediateNotification } from '@utils/notifications';
import { fetchProfile } from '@utils/fetchProfile';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Transportation() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState({ first_name: '', last_name: '', room_number: '' });
  const [selectedRequest, setSelectedRequest] = useState<'Medical' | 'Personal' | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [address, setAddress] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'medical' | 'personal' | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [displayAppointmentTime, setDisplayAppointmentTime] = useState('');
  const [displayPickupTime, setDisplayPickupTime] = useState('');

const loadRequests = async () => {
  try {
    const { first_name, last_name, room_number } = await fetchProfile(token);
    const fullProfile = { first_name, last_name, room_number };
    setProfile(fullProfile);

    const res = await apiClient.get('/transportation/');
    const filtered = res.data.filter(
      (r: any) =>
        r.resident_name === `${first_name} ${last_name}` &&
        r.room_number === room_number &&
        r.status !== 'Cancelled' // ⬅️ Exclude cancelled
    );
    setRequests(filtered);
  } catch (error) {
    if (error.response?.status === 401) {
      Alert.alert('Session Expired', 'Please log in again.', [{ text: 'OK', onPress: logout }]);
    } else {
      Alert.alert('Error', 'Could not load profile or requests.');
    }
  }
};

useFocusEffect(
  useCallback(() => {
    loadRequests();
    setSelectedRequest(null);
    setDoctorName('');
    setAppointmentTime('');
    setDestinationName('');
    setPickupTime('');
    setAddress('');
    setPickerTarget(null);
    setSelectedDate(null);
    setShowTimePicker(false);
    setDisplayAppointmentTime('');
    setDisplayPickupTime('');
  }, [token])
);

const handleTimeConfirm = (date: Date) => {
  const display = format(date, 'EEEE, MMMM d \'at\' h:mm a');
  const iso = date.toISOString();

  setSelectedDate(date);

  if (pickerTarget === 'medical') {
    setAppointmentTime(iso);
    setDisplayAppointmentTime(display);
  } else {
    setPickupTime(iso);
    setDisplayPickupTime(display);
  }

  setShowTimePicker(false);
  setPickerTarget(null);
};

const handleSubmit = async () => {
  if (!selectedRequest) {
    Alert.alert('Selection Required', 'Please choose a transportation type.');
    return;
  }

  const requestTimeStr = selectedRequest === 'Medical' ? appointmentTime : pickupTime;
  if (!requestTimeStr) {
    Alert.alert('Missing Time', 'Please select a time for the request.');
    return;
  }

  const requestTime = new Date(requestTimeStr);
  const requestHour = requestTime.getHours();
  const requestDateStr = requestTime.toDateString();

  const blockStart = Math.floor(requestHour / 2) * 2;
  const blockEnd = blockStart + 2;

  const sameBlockRequests = requests.filter((r) => {
    const timeStr = r.pickup_time || r.appointment_time;
    if (!timeStr) return false;

    const time = new Date(timeStr);
    return (
      time.toDateString() === requestDateStr &&
      time.getHours() >= blockStart &&
      time.getHours() < blockEnd &&
      r.status !== 'Cancelled'
    );
  });

  if (sameBlockRequests.length >= 2) {
    const startTime = new Date();
    startTime.setHours(blockStart, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(blockEnd, 0, 0, 0);

    Alert.alert(
      'Block Full',
      `Sorry, the ${format(startTime, 'h:mm a')}–${format(endTime, 'h:mm a')} time block is already full. Please choose a different time.`
    );
    return;
  }

  const baseData = {
    resident_name: `${profile.first_name} ${profile.last_name}`,
    room_number: profile.room_number,
    request_type: selectedRequest,
    status: 'Pending',
  };

  let requestData;
  if (selectedRequest === 'Medical') {
    if (!doctorName.trim()) {
      Alert.alert('Missing Info', 'Doctor Name is required.');
      return;
    }
    requestData = {
      ...baseData,
      doctor_name: doctorName,
      appointment_time: appointmentTime,
      address,
    };
  } else {
    if (!destinationName.trim()) {
      Alert.alert('Missing Info', 'Destination Name is required.');
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
    await apiClient.post('/transportation/', requestData);
    await sendImmediateNotification(
      'Transportation Request Submitted',
      'Your request is being processed.'
    );
    Alert.alert('Success', 'Your transportation request has been submitted.');
    await loadRequests();

    // Reset fields after successful submission
    setSelectedRequest(null);
    setDoctorName('');
    setAppointmentTime('');
    setDestinationName('');
    setPickupTime('');
    setAddress('');
    setPickerTarget(null);
    setSelectedDate(null);
    setShowTimePicker(false);
    setDisplayAppointmentTime('');
    setDisplayPickupTime('');

  } catch {
    Alert.alert('Error', 'Something went wrong submitting your request.');
  }
};

  const handleCancel = async (id: number) => {
    try {
      await apiClient.patch(`/transportation/${id}/`, { status: 'Cancelled' });
      setRequests((prev) => prev.filter((r) => r.id !== id));
      Alert.alert('Cancelled', 'Your request has been cancelled.');
    } catch {
      Alert.alert('Error', 'Failed to cancel request.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/transportation/${id}/`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      Alert.alert('Deleted', 'Request has been deleted.');
    } catch {
      Alert.alert('Error', 'Failed to delete request.');
    }
  };

  const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return '#FFD700'; // Yellow
    case 'Completed':
      return '#4CAF50'; // Green
    case 'Cancelled':
      return '#B0B0B0'; // Gray (won’t show for residents)
    default:
      return '#777'; // Default gray
  }
};

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
      <Text style={styles.header}>Transportation</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Name: <Text style={styles.infoValue}>{profile.first_name} {profile.last_name}</Text></Text>
        <Text style={styles.infoText}>Room Number: <Text style={styles.infoValue}>{profile.room_number}</Text></Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#26A69A' }, selectedRequest === 'Medical' && styles.selected]}
        onPress={() => setSelectedRequest('Medical')}
      >
        <Text style={styles.buttonText}>🚑 Medical Transportation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#5C6BC0' }, selectedRequest === 'Personal' && styles.selected]}
        onPress={() => setSelectedRequest('Personal')}
      >
        <Text style={styles.buttonText}>🛍️ Personal Transportation</Text>
      </TouchableOpacity>

      {selectedRequest === 'Medical' && (
        <>
          <TextInput style={styles.textInput} placeholder="Dr. Name" value={doctorName} onChangeText={setDoctorName} />
          <TextInput style={styles.textInput} placeholder="Address (optional)" value={address} onChangeText={setAddress} />
          <TouchableOpacity style={styles.textInput} onPress={() => { setPickerTarget('medical'); setShowTimePicker(true); }}>
            <Text style={{ fontSize: 18 }}>{displayAppointmentTime || 'Select Appointment Time'}</Text>
          </TouchableOpacity>
        </>
      )}

      {selectedRequest === 'Personal' && (
        <>
          <TextInput style={styles.textInput} placeholder="Destination Name" value={destinationName} onChangeText={setDestinationName} />
          <TextInput style={styles.textInput} placeholder="Address (optional)" value={address} onChangeText={setAddress} />
          <TouchableOpacity style={styles.textInput} onPress={() => { setPickerTarget('personal'); setShowTimePicker(true); }}>
            <Text style={{ fontSize: 18 }}>{displayPickupTime || 'Select Pick-up Time'}</Text>
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

<Text style={[styles.header, { fontSize: 26, marginTop: 40 }]}>Open Requests</Text>

{requests.map((req) => (
  <View key={req.id} style={styles.infoBox}>
    <Text style={styles.infoText}>
      <Text style={styles.label}>Type:</Text> {req.request_type}
    </Text>

    <Text style={styles.infoText}>
      <Text style={styles.label}>Status:</Text>{' '}
      <Text style={{ color: getStatusColor(req.status), fontWeight: 'bold' }}>
        {req.status}
      </Text>
    </Text>

{req.request_type === 'Medical' ? (
  <>
    <Text style={styles.infoText}>
      <Text style={styles.label}>Doctor:</Text> {req.doctor_name}
    </Text>
    <Text style={styles.infoText}>
      <Text style={styles.label}>Appt:</Text>{' '}
      {req.appointment_time
        ? format(new Date(req.appointment_time), 'MMMM d, yyyy h:mm a')
        : 'N/A'}
    </Text>
  </>
) : (
  <>
    <Text style={styles.infoText}>
      <Text style={styles.label}>Destination:</Text> {req.destination_name}
    </Text>
    <Text style={styles.infoText}>
      <Text style={styles.label}>Pickup:</Text>{' '}
      {req.pickup_time
        ? format(new Date(req.pickup_time), 'MMMM d, yyyy h:mm a')
        : 'N/A'}
    </Text>
  </>
)}

    {req.address && (
      <Text style={styles.infoText}>
        <Text style={styles.label}>Address:</Text> {req.address}
      </Text>
    )}

    {req.updated_at && (
      <Text style={styles.infoText}>
        <Text style={styles.label}>Last Updated:</Text> {new Date(req.updated_at).toLocaleString()}
      </Text>
    )}

    {req.staff_comment && (
      <Text style={styles.infoText}>
        <Text style={styles.label}>Staff Comment:</Text> {req.staff_comment}
      </Text>
    )}

    {req.status === 'Pending' && (
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: '#D32F2F', marginTop: 10 }]}
        onPress={() => handleCancel(req.id)}
      >
        <Text style={styles.submitButtonText}>Cancel</Text>
      </TouchableOpacity>
    )}

    {req.status === 'Completed' && (
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: '#757575', marginTop: 10 }]}
        onPress={() => handleDelete(req.id)}
      >
        <Text style={styles.submitButtonText}>Delete</Text>
      </TouchableOpacity>
    )}
  </View>
))}
    </ScrollView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: '#F3F3E7',
    paddingHorizontal: 16,
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
    fontSize: 18,
    color: '#444',
    marginBottom: 6,
  },
  label: {
    fontWeight: 'bold',
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