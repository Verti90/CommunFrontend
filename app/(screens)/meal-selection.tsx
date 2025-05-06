import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { useAuth } from '@auth';

export default function MealSelectionScreen() {
  const [mainItem, setMainItem] = useState('');
  const [protein, setProtein] = useState('');
  const [drinks, setDrinks] = useState<string[]>([]);
  const [roomService, setRoomService] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestMeal, setGuestMeal] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({});

  const { token } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const passedMealTime =
    typeof params.mealTime === 'string' ? params.mealTime : 'Breakfast';

  const parsedItems = Array.isArray(params.items)
    ? params.items
    : typeof params.items === 'string'
    ? JSON.parse(params.items)
    : [];

  const [mealTime, setMealTime] = useState(passedMealTime);

  useEffect(() => {
    axios
      .get('/api/profile/preferences/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setGuestName(res.data.default_guest_name || '');
        setGuestMeal(res.data.default_guest_meal || '');
        setAllergies(res.data.default_allergies || []);
      });
  }, []);

  const toggleDrink = (item: string) => {
    setDrinks((prev) => {
      if (prev.includes(item)) {
        return prev.filter((d) => d !== item);
      } else if (prev.length < 2) {
        return [...prev, item];
      } else {
        Alert.alert('Limit Reached', 'You can only select up to 2 drinks.');
        return prev;
      }
    });
  };

  const submit = async () => {
    if (!mainItem || !protein || drinks.length === 0) {
      return Alert.alert(
        'Missing fields',
        'Please complete all required selections.'
      );
    }

    setLoading(true);
    try {
      await axios.post(
        '/api/meals/',
        {
          meal_time: mealTime,
          main_item: mainItem,
          protein,
          drinks,
          room_service: roomService,
          guest_name: guestName,
          guest_meal: guestMeal,
          allergies,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Meal selection submitted.', [
        { text: 'OK', onPress: () => router.replace('/dining') },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{mealTime} Selection</Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Main Course <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          placeholder="e.g., Eggs, Pancakes"
          value={mainItem}
          onChangeText={setMainItem}
          style={styles.input}
        />

        {parsedItems.length > 0 && (
          <>
            <Text style={styles.hint}>Quick picks:</Text>
            <View style={styles.pillContainer}>
              {parsedItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setMainItem(item)}
                  style={styles.pill}
                >
                  <Text style={styles.pillText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {parsedItems.some((i) => allergies.includes(i)) && (
              <Text style={styles.warning}>
                ⚠ Some items may contain your allergies
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Protein <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          placeholder="e.g., Bacon, Ham"
          value={protein}
          onChangeText={setProtein}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Drinks (Choose up to 2) <Text style={styles.required}>*</Text>
        </Text>
        {['Coffee', 'OJ', 'Milk', 'Tea'].map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => toggleDrink(d)}
            style={{ paddingVertical: 6 }}
          >
            <Text style={drinks.includes(d) ? styles.selectedDrink : styles.drink}>
              {drinks.includes(d) ? '☑' : '☐'} {d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Room Service?</Text>
        <TouchableOpacity onPress={() => setRoomService(!roomService)}>
          <Text style={styles.roomServiceText}>
            {roomService ? '✅ Yes' : '❌ No'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Guest Name (optional)</Text>
        <TextInput
          value={guestName}
          onChangeText={setGuestName}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Guest Meal</Text>
        <TextInput
          value={guestMeal}
          onChangeText={setGuestMeal}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Allergies</Text>
        <TextInput
          placeholder="comma-separated (e.g., peanuts, gluten)"
          value={allergies.join(', ')}
          onChangeText={(val) =>
            setAllergies(val.split(',').map((s) => s.trim()))
          }
          style={styles.input}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={submit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Submitting…' : 'Submit'}
          </Text>
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
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
  },
  hint: {
    fontSize: 13,
    color: '#666',
    marginTop: 10,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    backgroundColor: '#e0f0ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 6,
  },
  pillText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  warning: {
    color: '#c00',
    fontSize: 12,
    marginTop: 6,
  },
  drink: {
    fontSize: 16,
    color: '#333',
  },
  selectedDrink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  roomServiceText: {
    fontSize: 16,
    marginTop: 8,
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