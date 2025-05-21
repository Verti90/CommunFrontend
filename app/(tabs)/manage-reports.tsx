import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput
} from 'react-native';
import * as FileSystem from 'expo-file-system';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [roomServiceFilter, setRoomServiceFilter] = useState<'All' | 'Yes' | 'No'>('All');
  const [allergiesFilter, setAllergiesFilter] = useState<'All' | 'Yes' | 'No'>('All');
  const [mealTypeFilter, setMealTypeFilter] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner'>('All');

  const cycleRoomServiceFilter = () => {
    setRoomServiceFilter((prev) =>
      prev === 'All' ? 'Yes' : prev === 'Yes' ? 'No' : 'All'
    );
  };
  const cycleAllergiesFilter = () => {
    setAllergiesFilter((prev) =>
      prev === 'All' ? 'Yes' : prev === 'Yes' ? 'No' : 'All'
    );
  };

  const cycleMealTypeFilter = () => {
  setMealTypeFilter((prev) =>
    prev === 'All' ? 'Breakfast'
    : prev === 'Breakfast' ? 'Lunch'
    : prev === 'Lunch' ? 'Dinner'
    : 'All'
  );
};

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
    if (activeTab === 'dining') fetchDiningData();
    else fetchActivityData();
  }, [activeTab, selectedDate]);

  const groupedMeals = { Breakfast: [], Lunch: [], Dinner: [] };
  mealSelections.forEach((item) => {
    if (groupedMeals[item.meal_time]) groupedMeals[item.meal_time].push(item);
  });

const applyFilters = (meals) => {
  return meals
    // Meal Type filter
    .filter((item) => {
      if (mealTypeFilter === 'All') return true;
      return item.meal_time === mealTypeFilter;
    })
    // Search filter
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.room_number.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Room Service filter
    .filter((item) => {
      if (roomServiceFilter === 'All') return true;
      if (roomServiceFilter === 'Yes') return !!item.room_service;
      if (roomServiceFilter === 'No') return !item.room_service;
      return true;
    })
    // Allergies filter
    .filter((item) => {
      if (allergiesFilter === 'All') return true;
      if (allergiesFilter === 'Yes') return Array.isArray(item.allergies) && item.allergies.length > 0;
      if (allergiesFilter === 'No') return !item.allergies || item.allergies.length === 0;
      return true;
    })
    .sort((a, b) => {
      const nameA = `${a.room_number}-${a.name}`.toLowerCase();
      const nameB = `${b.room_number}-${b.name}`.toLowerCase();
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
};

const handleExportCSV = async () => {
  try {
    let csv = 'Meal Type,Room,Name,Main,Side,Drink,Room Service,Guest Name,Guest Meal,Allergies\\n';
    Object.entries(groupedMeals).forEach(([type, meals]) => {
      applyFilters(meals).forEach((item) => {
        csv += `${type},${item.room_number},${item.name},"${item.main_item}","${item.protein}","${item.drinks?.join(';')}",${item.room_service ? 'Yes' : 'No'},${item.guest_name || ''},"${item.guest_meal || ''}","${item.allergies?.join(';') || ''}"\\n`;
      });
    });

    const fileUri = FileSystem.documentDirectory + 'dining_report.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

    Alert.alert(
      'Export Complete',
      `File saved to:\n${fileUri.replace('file://', '')}\n\nUse Android file browser or ADB to retrieve.`
    );
  } catch (error) {
    console.error('CSV Export Error:', error);
    Alert.alert('Export Failed', 'An error occurred while saving the file.');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'dining' && styles.tabActive]}
          onPress={() => setActiveTab('dining')}
        >
          <Text style={[styles.tabText, activeTab === 'dining' && styles.tabTextActive]}>Dining Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'activities' && styles.tabActive]}
          onPress={() => setActiveTab('activities')}
        >
          <Text style={[styles.tabText, activeTab === 'activities' && styles.tabTextActive]}>Activities Reports</Text>
        </TouchableOpacity>
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

      {activeTab === 'dining' && (
        <>
          <TextInput
            placeholder="Search by name or room number"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          <View style={styles.filterRow}>
            <TouchableOpacity onPress={cycleMealTypeFilter} style={styles.filterButton}>
              <Text style={styles.filterText}>Meal Type: {mealTypeFilter}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortAsc(!sortAsc)} style={styles.filterButton}>
              <Text style={styles.filterText}>{sortAsc ? 'Sort: A–Z' : 'Sort: Z–A'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cycleRoomServiceFilter} style={styles.filterButton}>
              <Text style={styles.filterText}>Room Service: {roomServiceFilter}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cycleAllergiesFilter} style={styles.filterButton}>
              <Text style={styles.filterText}>Allergies: {allergiesFilter}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExportCSV} style={styles.exportButton}>
              <Text style={styles.exportText}>Export CSV</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView style={styles.scroll}>
        {activeTab === 'dining' ? (
          Object.entries(groupedMeals).map(([mealType, meals]) => (
            <View key={mealType}>
              <Text style={styles.subHeader}>{mealType}</Text>
              {applyFilters(meals).length === 0 ? (
                <Text style={styles.emptyText}>No selections</Text>
              ) : (
                applyFilters(meals).map((item, index) => (
                  <View key={index} style={styles.card}>
                    <Text style={styles.label}>Room {item.room_number} - {item.name}</Text>
                    <Text>Main: {item.main_item}</Text>
                    <Text>Side: {item.protein}</Text>
                    <Text>Drink: {item.drinks?.join(', ') || 'None'}</Text>
                    <Text>Room Service: {item.room_service ? 'Yes' : 'No'}</Text>
                    <Text>Guest: {item.guest_name ? `${item.guest_name} (${item.guest_meal})` : 'No'}</Text>
                    <Text>Allergies: {item.allergies?.join(', ') || 'None'}</Text>
                  </View>
                ))
              )}
            </View>
          ))
        ) : (
          activities.map((activity, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.label}>{activity.name}</Text>
              <Text>Time: {format(parseISO(activity.date_time), 'EEEE, MMM d, yyyy • h:mm a')}</Text>
              <Text>Location: {activity.location}</Text>
              <Text>Participants:</Text>
              {activity.participants?.map((p, i) => (
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
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginHorizontal: 4
  },
  tabActive: { backgroundColor: '#4C7860' },
  tabText: { fontSize: 16 },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },
  dateButton: { backgroundColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 10 },
  dateText: { fontSize: 16, textAlign: 'center' },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderColor: '#aaa',
    borderWidth: 1,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#e0e0e0', padding: 8, borderRadius: 6, margin: 2,
  },
  filterText: { fontSize: 14 },
  exportButton: {
    backgroundColor: '#2f80ed', padding: 8, borderRadius: 6, margin: 2,
  },
  exportText: { color: '#fff', fontWeight: 'bold' },
  scroll: { flex: 1 },
  subHeader: { fontSize: 22, fontWeight: 'bold', marginTop: 10, marginBottom: 6 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  emptyText: { fontStyle: 'italic', color: '#666', marginBottom: 10 },
});

export default ManageReports;