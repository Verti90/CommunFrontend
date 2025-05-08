import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '@auth';
import { formatDateLocal } from '@utils/time';
import apiClient from '@services/api';
import { useRouter } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Meal {
  id: number;
  meal_type: string;
  description: string;
  items: string[];
}

interface MealSelection {
  id: number;
  meal_time: string;
  main_item: string;
  protein: string;
  drinks: string[];
  guest_name: string;
  guest_meal: string;
  allergies: string[];
  room_service: boolean;
  created_at: string;
}

export default function Dining() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const { token, logout } = useAuth();
  const [upcomingSelections, setUpcomingSelections] = useState<MealSelection[]>([]);
  const fetchUpcomingMeals = async () => {
    try {
      const response = await apiClient.get('meals/upcoming/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingSelections(response.data);
    } catch (error) {
      console.error('Error fetching upcoming meals:', error);
    }
  };  

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchMeals = async (selectedDate: Date) => {
    try {
      const formattedDate = formatDateLocal(selectedDate);
      const response = await apiClient.get('/daily-menus/', {
        params: { date: formattedDate },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeals(response.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Your session has expired, please log back in.", [
          { text: "OK", onPress: () => logout() }
        ]);
      }
    }
  };

  useEffect(() => {
    fetchMeals(date);
    fetchUpcomingMeals();
  }, [token, logout, date]);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>Meals for {formatDateLocal(date)} (Tap to change)</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={date}
        onConfirm={(selected) => {
          setDate(selected);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

{meals.map((meal) => {
  const selection = upcomingSelections.find(
    (sel) =>
      sel.meal_time.toLowerCase() === meal.meal_type.toLowerCase() &&
      new Date(sel.created_at).toDateString() === date.toDateString()
  );

  return (
    <View key={meal.id} style={styles.mealContainer}>
      <Text style={styles.mealType}>{meal.meal_type}</Text>
      <View style={styles.mealCard}>
      {selection ? (
  <>
    <Text style={styles.itemText}>Main: {selection.main_item}</Text>
    <Text style={styles.itemText}>Side: {selection.protein}</Text>
    <Text style={styles.itemText}>Drink: {selection.drinks?.join(', ')}</Text>
    {selection.room_service && <Text style={styles.itemText}>🛎️ Room Service</Text>}
    {selection.guest_name ? (
      <Text style={styles.itemText}>
        Guest: {selection.guest_name} – {selection.guest_meal}
      </Text>
    ) : null}
    {selection.allergies?.length > 0 && (
      <Text style={styles.itemText}>Allergies: {selection.allergies.join(', ')}</Text>
    )}
  </>
) : (
  <Text style={styles.itemText}>(No selections made)</Text>
)}

        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() =>
            router.push({
              pathname: '/meal-selection',
              params: {
                mealTime: meal.meal_type,
                items: JSON.stringify(meal.items),
              },
            })
          }
        >
          <Text style={styles.buttonText}>Make Selections →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
})}

      <TouchableOpacity onPress={() => Alert.alert(
        'Always Available Menu',
        'Toast\nCereal\nYogurt\nCoffee\nTea\nWater'
      )}>
        <Text style={styles.viewMenu}>View always available menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3E7',
    padding: 15,
  },
  dateButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  dateText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mealContainer: {
    marginBottom: 20,
  },
  mealType: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  mealCard: {
    backgroundColor: '#A3B899',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewMenu: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 15,
  },
});