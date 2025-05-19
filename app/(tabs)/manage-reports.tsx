import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { formatDateLocal } from '@utils/time';
import apiClient from '@services/api';
import { useAuth } from '@auth';
import { format, parseISO } from 'date-fns';

export default function ManageReports() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'dining' | 'activities'>('dining');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [mealSelections, setMealSelections] = useState([]);
  const [activities, setActivities] = useState([]);

  const fetchDiningData = async () => {
    try {
      const response = await apiClient.get('/meals/report/', {
        params: { date: formatDateLocal(selectedDate) },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMealSelections(response.data);
    } catch (err) {
      console.error('Dining report error:', err);
      Alert.alert('Error', 'Failed to load dining report');
    }
  };

  const fetchActivityData = async () => {
    try {
      const response = await apiClient.get('/activities/report/', {
        params: { date: formatDateLocal(selectedDate) },
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(response.data);
    } catch (err) {
      console.error('Activity report error:', err);
      Alert.alert('Error', 'Failed to load activities report');
    }
  };

  useEffect(() => {
    if (activeTab === 'dining') {
      fetchDiningData();
    } else {
      fetchActivityData();
    }
  }, [activeTab, selectedDate]);

  const renderTab = (label: string, value: 'dining' | 'activities') => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === value && styles.tabActive]}
      onPress={() => setActiveTab(value)}
    >
      <Text style={[styles.tabText, activeTab === value && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports</Text>

      <View style={styles.tabContainer}>
        {renderTab('Dining Reports', 'dining')}
        {renderTab('Activities Reports', 'activities')}
      </View>

      <TouchableOpacity onPress={() => setDatePickerVisible(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>Date: {formatDateLocal(selectedDate)} (Tap to change)</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={selectedDate}
        onConfirm={(date) => {
          setSelectedDate(date);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />

      <ScrollView style={styles.scroll}>
        {activeTab === 'dining' ? (
          mealSelections.map((item: any, index: number) => (
            <View key={index} style={styles.card}>
              <Text style={styles.label}>Room {item.room_number} - {item.name}</Text>
              <Text>Main: {item.main_item}</Text>
              <Text>Side: {item.protein}</Text>
              <Text>Drink: {item.drinks?.join(', ')}</Text>
              <Text>Room Service: {item.room_service ? 'Yes' : 'No'}</Text>
              <Text>Guest: {item.guest_name ? `${item.guest_name} (${item.guest_meal})` : 'No'}</Text>
              <Text>Allergies: {item.allergies?.join(', ') || 'None'}</Text>
            </View>
          ))
        ) : (
          activities.map((activity: any, index: number) => (
            <View key={index} style={styles.card}>
              <Text style={styles.label}>{activity.name}</Text>
              <Text>Time: {format(parseISO(activity.date_time), 'EEEE, MMM d, yyyy • h:mm a')}</Text>
              <Text>Location: {activity.location}</Text>
              <Text>Participants:</Text>
              {activity.participants?.map((p: any, i: number) => (
                <Text key={i}>• {p.name} (Room {p.room_number})</Text>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F3E7', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  tabContainer: { flexDirection: 'row', marginBottom: 12, justifyContent: 'center' },
  tabButton: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#ccc', borderRadius: 10, marginHorizontal: 4 },
  tabActive: { backgroundColor: '#4C7860' },
  tabText: { fontSize: 16 },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },
  dateButton: { backgroundColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 10 },
  dateText: { fontSize: 16, textAlign: 'center' },
  scroll: { flex: 1 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
});