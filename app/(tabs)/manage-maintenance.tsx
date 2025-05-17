import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import apiClient from '@services/api';
import { Picker } from '@react-native-picker/picker';

export default function ManageMaintenance() {
  const [requests, setRequests] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [filterType, setFilterType] = useState<'All' | 'Maintenance' | 'Housekeeping'>('All');
  const [sortDirection, setSortDirection] = useState<'Newest' | 'Oldest'>('Newest');

  useEffect(() => {
    fetchAllRequests();
  }, [filterStatus, filterType, sortDirection]);

  const fetchAllRequests = async () => {
    try {
      const res = await apiClient.get('/maintenance/');
      let data = res.data.filter((r: any) => r.status !== 'Cancelled');

      if (filterStatus !== 'All') {
        data = data.filter((r: any) => r.status === filterStatus);
      }

      if (filterType !== 'All') {
        data = data.filter((r: any) => r.request_type === filterType);
      }

      data.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortDirection === 'Newest' ? dateB - dateA : dateA - dateB;
      });

      setRequests(data);
    } catch (error) {
      console.warn('❌ Error fetching maintenance requests:', error);
    }
  };

  const handleCommentChange = (id: number, comment: string) => {
    setComments((prev) => ({ ...prev, [id]: comment }));
  };

  const submitComment = async (id: number) => {
    try {
      await apiClient.patch(`/maintenance/${id}/`, { staff_comment: comments[id] });
      Alert.alert('Comment Added');
      fetchAllRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const markCompleted = async (id: number) => {
    try {
      await apiClient.patch(`/maintenance/${id}/`, { status: 'Completed' });
      Alert.alert('Marked as Completed');
      fetchAllRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as completed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#FFD700';
      case 'Completed':
        return '#4CAF50';
      default:
        return '#777';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Manage Maintenance</Text>

      {/* Filter and Sort Controls */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Filter by Status:</Text>
        <View style={styles.dropdownBox}>
          <Picker
            selectedValue={filterStatus}
            onValueChange={(value) => setFilterStatus(value)}
            mode="dropdown"
          >
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Pending" value="Pending" />
            <Picker.Item label="Completed" value="Completed" />
          </Picker>
        </View>

        <Text style={[styles.dropdownLabel, { marginTop: 16 }]}>Filter by Type:</Text>
        <View style={styles.dropdownBox}>
          <Picker
            selectedValue={filterType}
            onValueChange={(value) => setFilterType(value)}
            mode="dropdown"
          >
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Maintenance" value="Maintenance" />
            <Picker.Item label="Housekeeping" value="Housekeeping" />
          </Picker>
        </View>

        <Text style={[styles.dropdownLabel, { marginTop: 16 }]}>Sort by Date:</Text>
        <View style={styles.dropdownBox}>
          <Picker
            selectedValue={sortDirection}
            onValueChange={(value) => setSortDirection(value)}
            mode="dropdown"
          >
            <Picker.Item label="Newest" value="Newest" />
            <Picker.Item label="Oldest" value="Oldest" />
          </Picker>
        </View>
      </View>

      {requests.map((req) => (
        <View key={req.id} style={styles.card}>
          <Text style={styles.info}><Text style={styles.label}>Resident:</Text> {req.resident_name}</Text>
          <Text style={styles.info}><Text style={styles.label}>Room:</Text> {req.room_number}</Text>
          <Text style={styles.info}><Text style={styles.label}>Type:</Text> {req.request_type}</Text>
          <Text style={styles.info}><Text style={styles.label}>Status:</Text> <Text style={{ color: getStatusColor(req.status), fontWeight: 'bold' }}>{req.status}</Text></Text>
          <Text style={styles.info}><Text style={styles.label}>Description:</Text> {req.description}</Text>
          {req.staff_comment && (
            <Text style={styles.info}><Text style={styles.label}>Comment:</Text> {req.staff_comment}</Text>
          )}

          {req.status === 'Pending' && (
            <>
              <TextInput
                style={styles.textInput}
                placeholder="Add staff comment..."
                value={comments[req.id] || ''}
                onChangeText={(text) => handleCommentChange(req.id, text)}
              />
              <TouchableOpacity style={styles.button} onPress={() => submitComment(req.id)}>
                <Text style={styles.buttonText}>Submit Comment</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={() => markCompleted(req.id)}>
                <Text style={styles.buttonText}>Mark Completed</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ))}
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  info: {
    fontSize: 18,
    marginBottom: 6,
    color: '#444',
  },
  label: {
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dropdownBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
});