import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import apiClient from '@services/api';
import { useRouter } from 'expo-router';
import { useAuth } from '@auth';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const mealOptions = ['Breakfast', 'Lunch', 'Dinner'];

export default function AddDailyMenuScreen() {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'staff') {
      Alert.alert('Access Denied', 'You are not authorized to access this screen.');
      router.back();
    }
  }, [user]);

  const [mealType, setMealType] = useState('Breakfast');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [itemsText, setItemsText] = useState('');

  const handleSubmit = async () => {
    const itemsArray = itemsText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!itemsArray.length) {
      return Alert.alert('Validation Error', 'Please enter at least one menu item.');
    }

    try {
      await apiClient.post(
        '/daily-menus/',
        {
          meal_type: mealType,
          date: date.toISOString().split('T')[0],
          items: itemsArray,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Daily menu created successfully.');
      setItemsText('');
      setMealType('Breakfast');
      setDate(new Date());
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create daily menu.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Menus</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Meal Type</Text>
        {mealOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setMealType(option)}
            style={[
              styles.optionButton,
              mealType === option && styles.optionButtonSelected,
            ]}
          >
            <Text style={mealType === option ? styles.optionTextSelected : styles.optionText}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setDatePickerVisible(true)}
        >
          <Text>{date.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Menu Items (comma-separated)</Text>
        <TextInput
          placeholder="e.g., Eggs, Bacon, Toast"
          value={itemsText}
          onChangeText={setItemsText}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Menu</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={date}
        onConfirm={(selected) => {
          setDate(selected);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0e5',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  optionButtonSelected: {
    backgroundColor: '#cde8ce',
  },
  optionText: {
    fontSize: 15,
  },
  optionTextSelected: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2f7a34',
  },
  submitButton: {
    backgroundColor: '#2f80ed',
    borderRadius: 32,
    padding: 16,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
});