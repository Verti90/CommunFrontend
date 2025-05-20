import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '@auth';
import { formatDateLocal } from '@utils/time';
import apiClient from '@services/api';
import { useRouter } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { sendImmediateNotification } from '@utils/notifications';

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
      });
      setMeals(response.data);
    } catch (error) {
      if (__DEV__) console.warn('❌ Error fetching meals:', error);
      // Optional: Alert.alert('Error', 'Could not fetch meals.');
    }
  };

  useEffect(() => {
    fetchMeals(date);
    fetchUpcomingMeals();
  }, [token, logout, date]);

return (
  <ScrollView style={styles.container}>
    <Text style={styles.header}>Dining</Text>

    <TouchableOpacity
      onPress={() => setShowDatePicker(true)}
      style={styles.dateButton}
    >
      <Text style={styles.dateText}>
        Meals for {formatDateLocal(date)} (Tap to change)
      </Text>
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
          sel.date === formatDateLocal(date)
      );

      return (
        <View key={meal.id} style={styles.mealContainer}>
          <Text style={styles.mealType}>{meal.meal_type}</Text>
          <View style={styles.mealCard}>
            {selection ? (
              <>
                <Text style={styles.itemText}>Main: {selection.main_item}</Text>
                <Text style={styles.itemText}>Side: {selection.protein}</Text>
                <Text style={styles.itemText}>
                  Drink: {Array.isArray(selection.drinks) ? selection.drinks[0] || 'None' : selection.drinks || 'None'}
                </Text>
                <Text style={styles.itemText}>
                  Room Service: {selection.room_service ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.itemText}>
                  Add Guest: {selection.guest_name ? `Yes (${selection.guest_name} - ${selection.guest_meal})` : 'No'}
                </Text>
                <Text style={styles.itemText}>
                  Allergies: {selection.allergies?.length > 0 ? selection.allergies.join(', ') : 'No'}
                </Text>
              </>
            ) : (
              <Text style={styles.itemText}>(No selections made)</Text>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              {!selection && (
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={styles.selectionButton}
                    onPress={() =>
                      router.push({
                        pathname: '/meal-selection',
                        params: {
                          mealTime: meal.meal_type,
                          items: JSON.stringify(meal.items),
                          date: formatDateLocal(date),
                        },
                      })
                    }
                  >
                    <Text style={styles.buttonText}>Make Selections →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selection && (
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <TouchableOpacity
                    style={styles.selectionButton}
                    onPress={async () => {
                      try {
                        await apiClient.delete(`/meals/${selection.id}/`);
                        Alert.alert('Selection canceled');
                        await sendImmediateNotification(
                          'Dining Selection Canceled',
                          'Your meal selection has been removed.'
                        );
                        await fetchUpcomingMeals();
                        await fetchMeals(date);
                      } catch (err) {
                        if (__DEV__) console.warn('❌ Failed to cancel meal selection:', err);
                        Alert.alert('Error', 'Could not cancel your selection.');
                      }
                    }}
                  >
                    <Text style={[styles.buttonText, { color: '#FFEAEA', fontWeight: 'bold' }]}>
                      ← Cancel Selections
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    })}

    {/* Always Available Menu */}
    <TouchableOpacity
      onPress={() =>
        Alert.alert(
          'Always Available Menu',
          'Toast\nCereal\nYogurt\nCoffee\nTea\nWater'
        )
      }
    >
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
  header: {
  fontSize: 34,
  fontWeight: 'bold',
  marginBottom: 20,
  textAlign: 'center',
  color: '#333',
  },
});