import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { format } from 'date-fns';

interface MedicineEntry {
  id: string;
  name: string;
  dosage: string;
  datetime: Date;
  frequency: string;
  notificationId: string;
}

export default function Wellness() {
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [frequency, setFrequency] = useState('Once');
  const [schedule, setSchedule] = useState<MedicineEntry[]>([]);

  useEffect(() => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.HIGH, // for Android
    }),
  });

  // Request permissions for notifications
  Notifications.requestPermissionsAsync();
}, []);

  useFocusEffect(
  React.useCallback(() => {
    setMedicineName('');
    setDosage('');
    setDateTime(null);
    setFrequency('Once');
  }, [])
);

  const scheduleReminder = async (
    name: string,
    dosage: string,
    date: Date,
    frequency: string
  ): Promise<string> => {
    let trigger: any;

    if (frequency === 'Once') {
      trigger = date;
    } else if (frequency === 'Daily') {
      trigger = {
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeats: true,
      };
    } else if (frequency === 'Weekly') {
      trigger = {
        weekday: date.getDay() === 0 ? 7 : date.getDay(), // Sunday = 7 for iOS
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeats: true,
      };
    } else if (frequency === 'Monthly') {
      trigger = {
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeats: true,
      };
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to take: ${name}`,
        body: `Dosage: ${dosage}`,
        sound: true,
      },
      trigger,
    });

    return id;
  };

  const handleAddMedicine = async () => {
    if (!medicineName.trim() || !dosage.trim() || !dateTime) {
      Alert.alert('Missing Info', 'Please complete all fields.');
      return;
    }

    const notificationId = await scheduleReminder(medicineName, dosage, dateTime, frequency);

    const newEntry: MedicineEntry = {
      id: Date.now().toString(),
      name: medicineName,
      dosage,
      datetime: dateTime,
      frequency,
      notificationId,
    };

    setSchedule([...schedule, newEntry]);
    setMedicineName('');
    setDosage('');
    setDateTime(null);
    setFrequency('Once');
  };

  const handleDelete = async (entry: MedicineEntry) => {
    await Notifications.cancelScheduledNotificationAsync(entry.notificationId);
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
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ fontSize: 18, color: dateTime ? '#000' : '#aaa' }}>
          {dateTime ? format(dateTime, 'PPpp') : 'Select Start Date & Time'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        date={dateTime || new Date()}
        onConfirm={(date) => {
          setDateTime(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      <Text style={styles.label}>Frequency</Text>
      <Picker
        selectedValue={frequency}
        onValueChange={(itemValue) => setFrequency(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Once" value="Once" />
        <Picker.Item label="Daily" value="Daily" />
        <Picker.Item label="Weekly" value="Weekly" />
        <Picker.Item label="Monthly" value="Monthly" />
      </Picker>

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
                {format(item.datetime, 'PPpp')} ({item.frequency})
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
  label: { fontSize: 18, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    fontSize: 18,
    marginBottom: 12,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 10,
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