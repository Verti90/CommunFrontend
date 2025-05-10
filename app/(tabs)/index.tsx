import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@auth';
import apiClient from '@services/api';

export default function HomeScreen() {
  const { token, user } = useAuth();
  const [fullName, setFullName] = useState('Resident');
  const [roomNumber, setRoomNumber] = useState('');

  const [announcements, setAnnouncements] = useState([
  {
    id: 1,
    title: 'Bingo Night 🎉',
    content: 'Join us this Friday at 6 PM in the Main Hall for Bingo and snacks!',
  },
  {
    id: 2,
    title: 'Flu Shots Available 💉',
    content: 'Free flu shots will be given in the Wellness Center Monday through Wednesday.',
  },
]);


useFocusEffect(
  useCallback(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { first_name, last_name, room_number } = response.data;
        setFullName(`${first_name} ${last_name}`);
        setRoomNumber(room_number || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [token])
);

  const isStaff = user?.role === 'staff';

const icons = [
  { name: 'Admin', label: 'Admin', source: require('@assets/images/admin.png'), route: 'admin' },
  { name: 'Dining', label: isStaff ? 'Manage Dining' : 'Dining', source: require('@assets/images/dining.png'), route: isStaff ? 'manage-dining' : 'dining' },
  { name: 'Activities', label: isStaff ? 'Manage Activities' : 'Activities', source: require('@assets/images/activities.png'), route: isStaff ? 'manage-activities' : 'activities' },
  { name: 'Maintenance', label: isStaff ? 'Manage Maintenance' : 'Maintenance & Housekeeping', source: require('@assets/images/maintenance.png'), route: isStaff ? 'manage-maintenance' : 'maintenance' },
  { name: 'Transportation', label: isStaff ? 'Manage Transportation' : 'Transportation', source: require('@assets/images/transportation.png'), route: isStaff ? 'manage-transportation' : 'transportation' },
  { name: 'Wellness', label: isStaff ? 'Manage Wellness' : 'Wellness', source: require('@assets/images/wellness.png'), route: isStaff ? 'manage-wellness' : 'wellness' },
].sort((a, b) => a.label.localeCompare(b.label));


return (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.welcome}>Welcome, {fullName}!</Text>

    {!isStaff && roomNumber && (
      <Text style={styles.room}>Room Number: {roomNumber}</Text>
    )}

    <Text style={styles.title}>Aravah Senior Living</Text>

    {icons.map((icon) => (
      <TouchableOpacity
        key={icon.name}
        style={styles.barButton}
        onPress={() => router.push(`/${icon.route}`)}
      >
        <View style={styles.barContent}>
          <Image source={icon.source} style={styles.barIcon} />
          <Text style={styles.barLabel}>{icon.label}</Text>
          <Ionicons name="chevron-forward" size={28} color="#777" style={styles.chevron} />
        </View>
      </TouchableOpacity>
    ))}

    <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 30, marginBottom: 10, textAlign: 'center' }}>
      Community Announcements
    </Text>

    <View style={{ paddingHorizontal: 10 }}>
      {announcements.map((item) => (
        <View
          key={item.id}
          style={{
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 15, color: '#333' }}>{item.content}</Text>
        </View>
      ))}
    </View>
  </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F3E7',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  welcome: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  room: {
    fontSize: 22,
    textAlign: 'center',
    color: '#555',
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  barButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 25,
    marginBottom: 20,
    elevation: 4,
  },
  barContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barIcon: {
    width: 40,
    height: 40,
    marginRight: 20,
    resizeMode: 'contain',
  },
  barLabel: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  chevron: {
    marginLeft: 10,
  },
});