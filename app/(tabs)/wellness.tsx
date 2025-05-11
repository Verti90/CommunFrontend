import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

interface MedicineEntry {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  notificationIds: string[];
}

export default function Wellness() {
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [rawTime, setRawTime] = useState<Date | null>(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [pendingTimes, setPendingTimes] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<MedicineEntry[]>([]);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setMedicineName('');
      setDosage('');
      setSelectedTime('');
      setRawTime(null);
      setPendingTimes([]);
      setTimePickerVisible(false);
    }, [])
  );

  const scheduleDailyReminder = async (
    name: string,
    dosage: string,
    timeStr: string
  ): Promise<string> => {
    const [hourStr, minuteStr] = timeStr.replace(/AM|PM/i, '').trim().split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    if (/PM/i.test(timeStr) && hour !== 12) hour += 12;
    if (/AM/i.test(timeStr) && hour === 12) hour = 0;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to take: ${name}`,
        body: `Dosage: ${dosage}`,
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    return id;
  };

  const handleAddTime = () => {
    if (!selectedTime) return;
    if (pendingTimes.includes(selectedTime)) return;

    setPendingTimes([...pendingTimes, selectedTime]);
    setSelectedTime('');
    setRawTime(null);
  };

  const handleAddMedicine = async () => {
    if (!medicineName.trim() || !dosage.trim() || pendingTimes.length === 0) {
      Alert.alert('Missing Info', 'Fill all fields and add at least one time.');
      return;
    }

    const notificationIds = await Promise.all(
      pendingTimes.map((t) => scheduleDailyReminder(medicineName, dosage, t))
    );

    const newEntry: MedicineEntry = {
      id: Date.now().toString(),
      name: medicineName,
      dosage,
      times: pendingTimes,
      notificationIds,
    };

    setSchedule([...schedule, newEntry]);
    setMedicineName('');
    setDosage('');
    setPendingTimes([]);
  };

  const handleDelete = async (entry: MedicineEntry) => {
    for (const id of entry.notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    setSchedule(schedule.filter((e) => e.id !== entry.id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Medicine Schedule</Text>

      <TextInput
        style={styles.input}
        placeholder="Medicine Name"
        value={medicineName}
        onChangeText={setMedicineName}
      />
      <TextInput
        style={styles.input}
        placeholder="Dosage (e.g., 5mg)"
        value={dosage}
        onChangeText={setDosage}
      />

      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center' }]}
        onPress={() => setTimePickerVisible(true)}
      >
        <Text style={{ fontSize: 18, color: selectedTime ? '#000' : '#aaa' }}>
          {selectedTime || 'Select Time'}
        </Text>
      </TouchableOpacity>

      {timePickerVisible && (
        <DateTimePicker
          value={rawTime || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={(event, selectedDate) => {
            setTimePickerVisible(false);
            if (selectedDate) {
              setRawTime(selectedDate);
              const hours = selectedDate.getHours();
              const minutes = selectedDate.getMinutes();
              const formatted =
                (hours % 12 || 12) +
                ':' +
                minutes.toString().padStart(2, '0') +
                (hours >= 12 ? ' PM' : ' AM');
              setSelectedTime(formatted);
            }
          }}
        />
      )}

      {selectedTime && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddTime}>
          <Text style={styles.addButtonText}>Add Time</Text>
        </TouchableOpacity>
      )}

      {pendingTimes.length > 0 && (
        <Text style={styles.pendingTimes}>
          Times: {pendingTimes.join(', ')}
        </Text>
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddMedicine}>
        <Text style={styles.addButtonText}>Add to Schedule</Text>
      </TouchableOpacity>

      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryText}>
                <Text style={styles.bold}>{item.name}</Text> — {item.dosage}
              </Text>
              <Text style={styles.entryText}>
                Times: {item.times.join(', ')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)}>
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No medications added yet.</Text>
        }
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F3E7', padding: 24 },
  header: { fontSize: 34, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    fontSize: 18,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  pendingTimes: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  entryText: { fontSize: 16, color: '#333' },
  bold: { fontWeight: 'bold' },
  deleteText: { fontSize: 18, color: 'red' },
  emptyText: { textAlign: 'center', color: '#777', fontSize: 16, marginTop: 20 },
});