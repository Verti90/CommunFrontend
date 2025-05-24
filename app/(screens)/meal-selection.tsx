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
import { formatDateLocal } from '@utils/time';

export default function MealSelectionScreen() {
  const [mainItem, setMainItem] = useState('');
  const [sideItem, setSideItem] = useState('');
  const [dessertItem, setDessertItem] = useState('');
  const [drink, setDrink] = useState('');
  const [roomService, setRoomService] = useState(false);
  const [guestEnabled, setGuestEnabled] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestMain, setGuestMain] = useState('');
  const [guestSide, setGuestSide] = useState('');
  const [guestDrink, setGuestDrink] = useState('');
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const passedDate =
    typeof params.date === 'string' ? params.date : new Date().toISOString().split('T')[0];
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

  const drinkOptions = ['Coffee', 'OJ', 'Milk', 'Tea', 'Water', 'None'];
  const commonAllergens = ['Dairy', 'Eggs', 'Gluten', 'Peanuts', 'Tree Nuts', 'Soy', 'Shellfish', 'Fish', 'Sesame'];

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
      return Alert.alert('Missing Fields', 'Please complete all required selections.');
    }

    if (guestEnabled) {
      if (!guestName.trim() || !guestMain || !guestSide || !guestDrink) {
        return Alert.alert('Missing Guest Info', 'Please complete all guest selections.');
      }
    }

    const combinedAllergies = hasAllergies
      ? [...selectedAllergens, ...allergies.split(',').map((s) => s.trim())].filter(Boolean)
      : [];

    if (hasAllergies && combinedAllergies.length === 0) {
      return Alert.alert('Missing Allergies', 'You selected Yes for allergies but did not specify any.');
    }

    const payload = {
      meal_time: mealType,
      date: formatDateLocal(date),
      main_item: mainItem,
      protein: sideItem,
      drinks: [drink],
      guest_name: guestEnabled ? guestName.trim() : '',
      guest_meal: guestEnabled ? `${guestMain} with ${guestSide} and ${guestDrink}` : '',
      allergies: combinedAllergies,
      room_service: roomService,
    };

    try {
      await apiClient.post('/meal-selections/', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Success', 'Your meal selection has been submitted.');
      resetForm();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while submitting your selection.');
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
       <Text style={styles.label}>Drink</Text>
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

{renderDynamicCategory('Guest Main Course', categorizedItems['Main Course'], guestMain, setGuestMain)}
{renderDynamicCategory('Guest Side', categorizedItems['Sides'], guestSide, setGuestSide)}

<View style={{ marginTop: 12 }}>
  <Text style={styles.label}>Guest Drink</Text>
  <View style={styles.pillContainer}>
    {drinkOptions.map((opt) => (
      <TouchableOpacity
        key={`guest-drink-${opt}`}
        onPress={() => setGuestDrink(opt)}
        style={[styles.pill, guestDrink === opt && styles.pillSelected]}
      >
        <Text style={guestDrink === opt ? styles.pillTextSelected : styles.pillText}>
          {opt}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
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
  <>
    <Text style={styles.label}>Select Common Allergies</Text>
    <View style={styles.pillContainer}>
      {commonAllergens.map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() =>
            setSelectedAllergens((prev) =>
              prev.includes(item)
                ? prev.filter((a) => a !== item)
                : [...prev, item]
            )
          }
          style={[
            styles.pill,
            selectedAllergens.includes(item) && styles.pillSelected,
          ]}
        >
          <Text
            style={
              selectedAllergens.includes(item)
                ? styles.pillTextSelected
                : styles.pillText
            }
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    <Text style={[styles.label, { marginTop: 12 }]}>Other Allergies</Text>
    <TextInput
      placeholder="Comma-separated other allergies"
      value={allergies}
      onChangeText={setAllergies}
      style={styles.input}
    />
  </>
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