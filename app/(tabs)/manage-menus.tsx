import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useAuth } from '@auth';
import apiClient from '@services/api';

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
  
  const today = new Date().toISOString().split('T')[0];

  const [mealType, setMealType] = useState('Breakfast');
  const [date, setDate] = useState(today);
  const [itemsText, setItemsText] = useState('');

  const handleSubmit = async () => {
    const itemsArray = itemsText.split(',').map(item => item.trim()).filter(Boolean);

    if (!itemsArray.length) {
      return Alert.alert('Validation Error', 'Please enter at least one menu item.');
    }

    try {
      await axios.post('/api/daily-menus/', {
        meal_type: mealType,
        date,
        items: itemsArray,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Success', 'Daily menu created successfully.');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create daily menu.');
    }
  };

  return (
    <ScrollView className="bg-green-100 flex-1 px-4 py-6">
      <Text className="text-2xl font-bold text-center mb-4">Manage Menus</Text>
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <Text className="font-semibold mb-2">Meal Type</Text>
        {mealOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setMealType(option)}
            className={`py-2 ${mealType === option ? 'bg-green-200 rounded' : ''}`}
          >
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <Text className="font-semibold mb-2">Date (YYYY-MM-DD)</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          className="border p-2 rounded"
        />
      </View>

      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <Text className="font-semibold mb-2">Menu Items (comma-separated)</Text>
        <TextInput
          placeholder="e.g., Eggs, Bacon, Toast"
          value={itemsText}
          onChangeText={setItemsText}
          className="border p-2 rounded"
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-green-600 rounded-full p-4 mt-4"
      >
        <Text className="text-white text-center font-bold text-lg">Submit Menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}