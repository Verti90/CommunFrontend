import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@auth';
import apiClient from '@services/api';
import { fetchProfile } from '@utils/fetchProfile';

const MaintenanceScreen = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<{ first_name: string; last_name: string; room_number: string }>({
    first_name: '',
    last_name: '',
    room_number: '',
  });
  const [selectedRequest, setSelectedRequest] = useState<'WorkOrder' | 'Housekeeping' | null>(null);
  const [description, setDescription] = useState('');
  const [requests, setRequests] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const { first_name, last_name, room_number } = await fetchProfile(token);
          const fullProfile = { first_name, last_name, room_number };
          setProfile(fullProfile);

          const res = await apiClient.get('/maintenance/');
          const filtered = res.data.filter(
            (r: any) =>
              r.resident_name === `${first_name} ${last_name}` && r.room_number === room_number
          );
          setRequests(filtered);
        } catch (error) {
          if (__DEV__) console.warn('❌ Failed to load profile or requests:', error);
        }
      };

      loadProfile();
      setSelectedRequest(null);
      setDescription('');
    }, [token])
  );

const fetchRequests = async () => {
  try {
    const res = await apiClient.get('/maintenance/');
    const { first_name, last_name, room_number } = profile;
    const filtered = res.data.filter(
      (r: any) =>
        r.resident_name === `${first_name} ${last_name}` &&
        r.room_number === room_number &&
        r.status !== 'Cancelled'
    );
    setRequests(filtered);
  } catch (error) {
    if (__DEV__) console.warn('❌ Failed to refresh requests:', error);
  }
};

  const handleSubmit = async () => {
    if (!selectedRequest) {
      Alert.alert('Selection Required', 'Please choose a request type.');
      return;
    }

    if (selectedRequest === 'WorkOrder' && !description.trim()) {
      Alert.alert('Description Required', 'Please describe the issue.');
      return;
    }

    const requestData = {
      resident_name: `${profile.first_name} ${profile.last_name}`,
      room_number: profile.room_number,
      request_type: selectedRequest === 'WorkOrder' ? 'Maintenance' : 'Housekeeping',
      description: selectedRequest === 'WorkOrder' ? description : 'Housekeeping requested',
      status: 'Pending',
    };

    try {
      await apiClient.post('/maintenance/', requestData);
      Alert.alert('Success', 'Your request has been submitted.');
      setSelectedRequest(null);
      setDescription('');
      fetchRequests();
    } catch (error) {
      Alert.alert('Error', 'Something went wrong submitting your request.');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await apiClient.delete(`/maintenance/${id}/`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      Alert.alert('Cancelled', 'Your request has been removed.');
    } catch {
      Alert.alert('Error', 'Failed to cancel request.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/maintenance/${id}/`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      Alert.alert('Deleted', 'Closed request has been deleted.');
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
      return '#B0B0B0'; // Gray
    default:
      return '#777';
  }
};

return (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.header}>Maintenance & Housekeeping</Text>

    {/* Resident Info */}
    <View style={styles.infoBox}>
      <Text style={styles.infoText}>
        Name: <Text style={styles.infoValue}>{profile.first_name} {profile.last_name}</Text>
      </Text>
      <Text style={styles.infoText}>
        Room Number: <Text style={styles.infoValue}>{profile.room_number}</Text>
      </Text>
    </View>

    {/* Request Type Buttons */}
    <TouchableOpacity
      style={[styles.button, { backgroundColor: '#26A69A' }, selectedRequest === 'Housekeeping' && styles.selected]}
      onPress={() => setSelectedRequest('Housekeeping')}
    >
      <Text style={styles.buttonText}>🧹 Request Housekeeping</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.button, { backgroundColor: '#FFA726' }, selectedRequest === 'WorkOrder' && styles.selected]}
      onPress={() => setSelectedRequest('WorkOrder')}
    >
      <Text style={styles.buttonText}>🛠️ Maintenance Request</Text>
    </TouchableOpacity>

    {/* Description Box for Work Orders */}
    {selectedRequest === 'WorkOrder' && (
      <TextInput
        style={styles.textInput}
        multiline
        placeholder="Describe the issue (e.g., replace lightbulb, fix leaky faucet)"
        value={description}
        onChangeText={setDescription}
      />
    )}

    {/* Submit Button */}
    {selectedRequest && (
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Request</Text>
      </TouchableOpacity>
    )}

    {/* Divider */}
    <Text style={[styles.header, { fontSize: 26, marginTop: 40 }]}>Open Requests</Text>

{/* Requests List */}
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

    <Text style={styles.infoText}>
      <Text style={styles.label}>Description:</Text> {req.description}
    </Text>

    {req.updated_at && (
      <Text style={styles.infoText}>
        <Text style={styles.label}>Last Updated:</Text>{' '}
        {new Date(req.updated_at).toLocaleString()}
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
  infoValue: {
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    textAlignVertical: 'top',
    height: 140,
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

export default MaintenanceScreen;