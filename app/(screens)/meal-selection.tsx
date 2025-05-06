import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const passedMealTime = typeof params.mealTime === 'string' ? params.mealTime : 'Breakfast';

  const parsedItems = Array.isArray(params.items)
    ? params.items
    : typeof params.items === 'string'
      ? JSON.parse(params.items)
      : [];

  const [mealTime, setMealTime] = useState(passedMealTime);

  useEffect(() => {
    axios.get('/api/profile/preferences/', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setProfile(res.data);
      setGuestName(res.data.default_guest_name || '');
      setGuestMeal(res.data.default_guest_meal || '');
      setAllergies(res.data.default_allergies || []);
    });
  }, []);

  const toggleDrink = (item: string) => {
    setDrinks(prev => {
      if (prev.includes(item)) {
        return prev.filter(d => d !== item);
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
      return Alert.alert('Missing fields', 'Please complete all required selections.');
    }

    setLoading(true);
    try {
      await axios.post('/api/meals/', {
        meal_time: mealTime,
        main_item: mainItem,
        protein,
        drinks,
        room_service: roomService,
        guest_name: guestName,
        guest_meal: guestMeal,
        allergies,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Meal selection submitted.', [
        { text: 'OK', onPress: () => router.replace('/dining') }
      ]);
    } catch (err) {
      Alert.alert('Error', 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="bg-green-100 flex-1 px-4 py-6">
      <Text className="text-2xl font-bold text-center mb-4">{mealTime} Selection</Text>

      {/* Main Course */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <Text className="text-xl font-bold mb-2">
          Main Course <Text className="text-red-600">*</Text>
        </Text>
        <TextInput
          placeholder="e.g., Eggs, Pancakes"
          value={mainItem}
          onChangeText={setMainItem}
          className="border p-2 rounded mb-2"
        />
        {parsedItems.length > 0 && (
          <>
            <Text className="text-sm text-gray-500 mb-1">Quick picks:</Text>
            {parsedItems.map((item: string, index: number) => (
              <TouchableOpacity key={index} onPress={() => setMainItem(item)} className="py-1">
                <Text className="text-blue-600 underline">{item}</Text>
              </TouchableOpacity>
            ))}
            {parsedItems.some(i => allergies.includes(i)) && (
              <Text className="text-red-600 text-xs mt-1">
                ⚠ Some items may contain your allergies
              </Text>
            )}
          </>
        )}
      </View>

      {/* Protein */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <Text className="text-xl font-bold mb-2">
          Protein <Text className="text-red-600">*</Text>
        </Text>
        <TextInput
          placeholder="e.g., Bacon, Ham"
          value={protein}
          onChangeText={setProtein}
          className="border p-2 rounded"
        />
      </View>

      {/* Drinks */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <Text className="text-xl font-bold mb-2">
          Drinks (Choose up to 2) <Text className="text-red-600">*</Text>
        </Text>
        {['Coffee', 'OJ', 'Milk', 'Tea'].map(d => (
          <TouchableOpacity key={d} onPress={() => toggleDrink(d)} className="py-1">
            <Text className={drinks.includes(d) ? 'font-bold text-green-700 text-lg' : 'text-lg'}>
              {drinks.includes(d) ? '☑' : '☐'} {d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Room Service */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <Text className="text-xl font-bold mb-2">Room Service?</Text>
        <TouchableOpacity onPress={() => setRoomService(!roomService)} className="py-2">
          <Text>{roomService ? '✅ Yes' : '❌ No'}</Text>
        </TouchableOpacity>
      </View>

      {/* Guest Info */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <Text className="text-xl font-bold mb-2">Guest Name (optional)</Text>
        <TextInput value={guestName} onChangeText={setGuestName} className="border p-2 rounded" />

        <Text className="text-xl font-bold mt-4 mb-2">Guest Meal</Text>
        <TextInput value={guestMeal} onChangeText={setGuestMeal} className="border p-2 rounded" />
      </View>

      {/* Allergies */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <Text className="text-xl font-bold mb-2">Allergies</Text>
        <TextInput
          placeholder="comma-separated (e.g., peanuts, gluten)"
          value={allergies.join(', ')}
          onChangeText={(val) => setAllergies(val.split(',').map(s => s.trim()))}
          className="border p-2 rounded"
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        onPress={submit}
        className={`bg-green-600 rounded-full p-4 mb-8 ${loading ? 'opacity-50' : ''}`}
        disabled={loading}
      >
        <Text className="text-center text-white text-lg font-bold">
          {loading ? 'Submitting…' : 'Submit Selection'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}