import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native'; 
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAuth } from '@auth';
import apiClient from '@services/api';

const MaintenanceScreen = () => {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<{ first_name: string; last_name: string; room_number: string }>({
    first_name: '',
    last_name: '',
    room_number: '',
  });
  const [selectedRequest, setSelectedRequest] = useState<'WorkOrder' | 'Housekeeping' | null>(null);
  const [description, setDescription] = useState('');

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
    setDescription('');
  }, [token])
);

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
      await apiClient.post('/maintenance/', requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Your request has been submitted.');
      setSelectedRequest(null);
      setDescription('');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong submitting your request.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Maintenance & Housekeeping</Text>
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
          selectedRequest === 'Housekeeping' && styles.selected,
        ]}
        onPress={() => setSelectedRequest('Housekeeping')}
      >
        <Text style={styles.buttonText}>🧹 Request Housekeeping</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: '#FFA726' },
          selectedRequest === 'WorkOrder' && styles.selected,
        ]}
        onPress={() => setSelectedRequest('WorkOrder')}
      >
        <Text style={styles.buttonText}>🛠️ Work Order Request</Text>
      </TouchableOpacity>

      {selectedRequest === 'WorkOrder' && (
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Describe the issue (e.g., replace lightbulb, fix leaky faucet)"
          value={description}
          onChangeText={setDescription}
        />
      )}

      {selectedRequest && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3E7',
    padding: 24,
  },
  header: {
    fontSize: 32,
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