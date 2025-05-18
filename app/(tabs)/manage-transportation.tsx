import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import apiClient from '@services/api';
import { formatTimeDisplay, isInTimeBlock } from '@utils/time';
import { format } from 'date-fns';

const TIME_BLOCKS = [
  { label: '8:00–10:00 AM', start: 8, end: 10 },
  { label: '10:00–12:00 PM', start: 10, end: 12 },
  { label: '12:00–2:00 PM', start: 12, end: 14 },
  { label: '2:00–4:00 PM', start: 14, end: 16 },
  { label: '4:00–6:00 PM', start: 16, end: 18 },
];

export default function ManageTransportation() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      const res = await apiClient.get('/transportation/');
      setRequests(res.data.filter((r: any) => r.status !== 'Cancelled'));
    } catch (error) {
      console.warn('Error fetching transportation requests:', error);
    }
  };

  const getBlockRequests = (startHour: number, endHour: number) => {
    return requests.filter((req) =>
      isInTimeBlock(req.pickup_time || req.appointment_time, selectedDate!, startHour, endHour)
    );
  };

    const markCompleted = async (id: number) => {
      try {
        await apiClient.patch(`/transportation/${id}/`, { status: 'Completed' });
        Alert.alert('Success', 'Marked as Completed');
        fetchAllRequests();
      } catch {
        Alert.alert('Error', 'Failed to mark as completed');
      }
    };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Transportation</Text>

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>
          {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select Date'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {TIME_BLOCKS.map((block, idx) => {
        const blockRequests = getBlockRequests(block.start, block.end);
        return (
          <View key={idx} style={styles.card}>
            <Text style={styles.blockTitle}>{block.label}</Text>
            {blockRequests.length === 0 ? (
              <Text style={styles.emptyText}>No requests</Text>
            ) : (
              blockRequests.map((req) => (
                <View key={req.id} style={styles.reqItem}>
                  <Text style={styles.reqText}>
                    👤 {req.resident_name} ({req.request_type})
                  </Text>
                  <Text style={styles.reqText}>
                    🕒 {formatTimeDisplay(req.pickup_time || req.appointment_time)}
                  </Text>
                  {req.status === 'Pending' && (
                    <TouchableOpacity
                      style={styles.markBtn}
                      onPress={() => markCompleted(req.id)}
                    >
                      <Text style={styles.markBtnText}>Mark Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
            {blockRequests.length >= 2 && (
              <Text style={styles.fullText}>🚫 Block Full</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F3F3E7',
    paddingBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 1,
  },
  blockTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reqItem: {
    marginBottom: 10,
  },
  reqText: {
    fontSize: 16,
    color: '#444',
  },
  markBtn: {
    marginTop: 6,
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  markBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
  },
  fullText: {
    marginTop: 6,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
});