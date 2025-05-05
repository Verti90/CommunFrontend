import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '@auth';
import apiClient from '@services/api';
import { useRouter } from 'expo-router';

interface Meal {
  id: number;
  meal_type: string;
  description: string;
  items: string[];
}

export default function Dining() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await apiClient.get('meals/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetch meals response:", response.data);
        setMeals(response.data);
      } catch (error) {
        console.error('Error fetching meals:', error);
        if (error.response && error.response.status === 401) {
          // Handle token expiration or invalid token
          Alert.alert(
            "Session Expired",
            "Your session has expired, please log back in.",
            [
              {
                text: "OK",
                onPress: () => {
                  logout();
                }
              }
            ]
          );
        } else {
          console.error('Response data:', error.response?.data); // Log response data
          console.error('Response status:', error.response?.status); // Log response status
        }
      }
    };

    fetchMeals();
  }, [token, logout]);

  return (
    <ScrollView style={styles.container}>
      {meals.map((meal) => (
        <View key={meal.id} style={styles.mealContainer}>
          <Text style={styles.mealType}>{meal.meal_type}</Text>
          <View style={styles.mealCard}>
            {meal.items.map((item, index) => (
              <Text key={index} style={styles.itemText}>{item}</Text>
            ))}
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
      ))}

      <TouchableOpacity>
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
