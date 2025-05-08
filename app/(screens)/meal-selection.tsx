import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import apiClient from '@services/api';
import { useAuth } from '@auth';

export default function MealSelectionScreen() {
  const [mainItem, setMainItem] = useState('');
  const [sideItem, setSideItem] = useState('');
  const [dessertItem, setDessertItem] = useState('');
  const [drink, setDrink] = useState('');
  const [roomService, setRoomService] = useState(false);
  const [guestEnabled, setGuestEnabled] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestMeal, setGuestMeal] = useState('');
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();

  const validMealTimes = ['Breakfast', 'Lunch', 'Dinner'];
  const passedMealTime =
    typeof params.mealTime === 'string' && validMealTimes.includes(params.mealTime)
      ? params.mealTime
      : 'Breakfast';

  const parsedItems = Array.isArray(params.items)
    ? params.items
    : typeof params.items === 'string'
    ? JSON.parse(params.items)
    : [];

  const [mealTime] = useState(passedMealTime);

  const drinkOptions = ['Coffee', 'OJ', 'Milk', 'Tea', 'Water'];

  const categorizedItems = {
    'Main Course': [],
    Sides: [],
    Dessert: [],
  };

  parsedItems.forEach((item) => {
    const [label, value] = item.split(':').map((s) => s.trim());
    if (label.startsWith('Main Course')) categorizedItems['Main Course'].push(value);
    else if (label.startsWith('Sides')) categorizedItems['Sides'].push(value);
    else if (label.startsWith('Dessert')) categorizedItems['Dessert'].push(value);
  });

  // Always include 'None' as a fallback option
  Object.keys(categorizedItems).forEach((key) => {
    if (!categorizedItems[key].includes('None')) {
      categorizedItems[key].push('None');
    }
  });

  const handleSubmit = async () => {
    if (!mainItem || !sideItem || !drink) {
      return Alert.alert('Missing fields', 'Please complete all required selections.');
    }

    setLoading(true);
    try {
      await apiClient.post(
        '/meals/',
        {
          meal_time: mealTime,
          main_item: `${mainItem}${dessertItem ? `, Dessert: ${dessertItem}` : ''}`,
          protein: sideItem,
          drinks: [drink],
          room_service: roomService,
          guest_name: guestEnabled ? guestName : '',
          guest_meal: guestEnabled ? guestMeal : '',
          allergies: hasAllergies ? allergies.split(',').map((s) => s.trim()) : [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Meal selection submitted.', [
        { text: 'OK', onPress: () => router.replace('/dining') },
      ]);
    } catch (err) {
      console.error('❌ Submission Error:', err);
      Alert.alert('Error', 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderDynamicCategory = (label, options, selected, setSelected) => (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pillContainer}>
        {options.length > 0 ? (
          options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.pill, selected === opt && styles.pillSelected]}
              onPress={() => setSelected(opt)}
            >
              <Text style={selected === opt ? styles.pillTextSelected : styles.pillText}>{opt}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ fontStyle: 'italic', color: '#888' }}>No options available</Text>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{mealTime} Selection</Text>

      {renderDynamicCategory('Main Course', categorizedItems['Main Course'], mainItem, setMainItem)}
      {renderDynamicCategory('Side', categorizedItems['Sides'], sideItem, setSideItem)}
      {mealTime === 'Dinner' && renderDynamicCategory('Dessert', categorizedItems['Dessert'], dessertItem, setDessertItem)}

      <View style={styles.card}>
        <Text style={styles.label}>Drink (Choose One)</Text>
        <View style={styles.pillContainer}>
          {drinkOptions.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDrink(d)}
              style={[styles.pill, drink === d && styles.pillSelected]}
            >
              <Text style={drink === d ? styles.pillTextSelected : styles.pillText}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Room Service?</Text>
        <View style={styles.pillContainer}>
          {['Yes', 'No'].map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setRoomService(opt === 'Yes')}
              style={[styles.pill, roomService === (opt === 'Yes') && styles.pillSelected]}
            >
              <Text style={roomService === (opt === 'Yes') ? styles.pillTextSelected : styles.pillText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Add Guest?</Text>
        <View style={styles.pillContainer}>
          {['Yes', 'No'].map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setGuestEnabled(opt === 'Yes')}
              style={[styles.pill, guestEnabled === (opt === 'Yes') && styles.pillSelected]}
            >
              <Text style={guestEnabled === (opt === 'Yes') ? styles.pillTextSelected : styles.pillText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {guestEnabled && (
          <>
            <TextInput
              placeholder="Guest Name"
              value={guestName}
              onChangeText={setGuestName}
              style={styles.input}
            />
            <TextInput
              placeholder="Guest Meal"
              value={guestMeal}
              onChangeText={setGuestMeal}
              style={[styles.input, { marginTop: 10 }]}
            />
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Allergies?</Text>
        <View style={styles.pillContainer}>
          {['Yes', 'No'].map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setHasAllergies(opt === 'Yes')}
              style={[styles.pill, hasAllergies === (opt === 'Yes') && styles.pillSelected]}
            >
              <Text style={hasAllergies === (opt === 'Yes') ? styles.pillTextSelected : styles.pillText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {hasAllergies && (
          <TextInput
            placeholder="Comma-separated allergies"
            value={allergies}
            onChangeText={setAllergies}
            style={styles.input}
          />
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Submitting…' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0e5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  pillSelected: {
    backgroundColor: '#c1e1c1',
  },
  pillText: {
    color: '#333',
  },
  pillTextSelected: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelBtn: {
    backgroundColor: '#999',
    flex: 1,
    padding: 14,
    borderRadius: 10,
  },
  submitBtn: {
    backgroundColor: '#2f80ed',
    flex: 1,
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});