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
import { formatDateLocal } from '@utils/time';
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
  const [menusByType, setMenusByType] = useState({});
  const [categoryInputs, setCategoryInputs] = useState({});

  useEffect(() => {
    fetchMenusForDate();
  }, [date]);

  const fetchMenusForDate = async () => {
    try {
      const res = await apiClient.get('/daily-menus/', {
        params: { date: formatDateLocal(date) },
        headers: { Authorization: `Bearer ${token}` },
      });

      const grouped = { Breakfast: [], Lunch: [], Dinner: [] };
      for (const entry of res.data) {
        if (grouped[entry.meal_type]) {
          grouped[entry.meal_type].push(...entry.items.map((item, idx) => ({
            name: item,
            id: entry.id,
            index: idx,
          })));
        }
      }

      setMenusByType(grouped);
    } catch (err) {
      console.error('Error loading menus:', err);
    }
  };

  const deleteMenuItem = async (menuId, itemIndex) => {
    try {
      await apiClient.delete(`/daily-menus/${menuId}/`, {
        data: { item_index: itemIndex },
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn('Menu not found; it may have already been deleted.');
      } else {
        console.error('Delete failed:', err);
        Alert.alert('Error', 'Could not delete menu item.');
      }
    } finally {
      fetchMenusForDate();
    }
  };  

  const handleSubmit = async () => {
    const itemsArray = [];
    const labelsSet = new Set();
    let duplicateLabel = null;
  
    for (const [category, options] of Object.entries(categoryInputs)) {
      options?.forEach((opt, idx) => {
        if (opt?.trim()) {
          const label = `${category} Option ${String.fromCharCode(65 + idx)}`;
          if (labelsSet.has(label)) {
            duplicateLabel = label;
          }
          labelsSet.add(label);
          itemsArray.push(`${label}: ${opt.trim()}`);
        }
      });
    }
  
    if (duplicateLabel) {
      return Alert.alert('Duplicate Entry', `You already added "${duplicateLabel}". Please remove it before adding a new one.`);
    }
  
    if (!itemsArray.length) {
      return Alert.alert('Validation Error', 'Please enter at least one menu item.');
    }
  
    const existingLabels = new Set(
      menusByType[mealType]?.map((item) => item.name.split(':')[0].trim())
    );
  
    for (const item of itemsArray) {
      const label = item.split(':')[0].trim();
      if (existingLabels.has(label)) {
        const [category, , optionLetter] = label.split(' ');
        const index = optionLetter.charCodeAt(0) - 65;
  
        setCategoryInputs((prev) => {
          const updated = [...(prev[category] || ['', '', ''])];
          updated[index] = ' ';
          const newState = { ...prev, [category]: updated };
  
          setTimeout(() => {
            setCategoryInputs((latest) => {
              const refreshed = [...(latest[category] || ['', '', ''])];
              if (refreshed[index] === ' ') {
                refreshed[index] = '';
                return { ...latest, [category]: refreshed };
              }
              return latest;
            });
          }, 0);
  
          return newState;
        });
  
        return Alert.alert(
          'Duplicate Entry',
          `"${label}" already exists for ${mealType} on ${formatDateLocal(date)}.\nThat field has been cleared. Please delete the original first if you want to change it.`
        );
      }
    }
  
    try {
      await apiClient.post(
        '/daily-menus/',
        {
          meal_type: mealType,
          date: formatDateLocal(date),
          items: itemsArray,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      Alert.alert('Success', 'Daily menu created successfully.');
      setCategoryInputs({});
      fetchMenusForDate();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create daily menu.');
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Dining</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setDatePickerVisible(true)}
        >
          <Text>{formatDateLocal(date)}</Text>
        </TouchableOpacity>
      </View>

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

      {['Main Course', 'Sides', ...(mealType === 'Dinner' ? ['Dessert'] : [])].map((category) => (
        <View key={category} style={styles.card}>
          <Text style={styles.label}>{category} Options (A, B, C or leave blank)</Text>
          {[0, 1, 2].map((i) => (
            <TextInput
              key={`${category}-${i}`}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              value={(categoryInputs[category] && categoryInputs[category][i]) || ''}
              onChangeText={(text) =>
                setCategoryInputs((prev) => {
                  const updated = [...(prev[category] || ['', '', ''])];
                  updated[i] = text;
                  return { ...prev, [category]: updated };
                })
              }
              style={styles.input}
            />
          ))}
        </View>
      ))}


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
      <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 20 }}>
        Showing menus for: {formatDateLocal(date)}
      </Text>
      <View style={{ marginTop: 30 }}>
        {mealOptions.map((type) => (
          <View key={type} style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{type}</Text>
            {menusByType[type]?.length ? (
              menusByType[type].map((item, i) =>
                item?.id != null && (
                  <View key={`${item.id}-${item.index}`} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                    <TouchableOpacity onPress={() => deleteMenuItem(item.id, item.index)}>
                      <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 20, marginRight: 10 }}>✖</Text>
                    </TouchableOpacity>
                    <Text>{item.name}</Text>
                  </View>
                )
              )
            ) : (
  <Text style={{ fontStyle: 'italic', color: '#888' }}>No items</Text>
)}
          </View>
        ))}
      </View>
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