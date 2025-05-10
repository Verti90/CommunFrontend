import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@auth';
import apiClient from '@services/api';

export default function HomeScreen() {
  const { token, user } = useAuth();
  const [fullName, setFullName] = useState('Resident');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { first_name, last_name } = response.data;
        setFullName(`${first_name} ${last_name}`);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [token]);

  const isStaff = user?.role === 'staff';

  const icons = [
    ...(isStaff ? [{ name: 'Admin', label: 'Admin', source: require('@assets/images/admin.png'), route: 'admin' }] : []),
    { name: 'Dining', label: isStaff ? 'Manage Dining' : 'Dining', source: require('@assets/images/dining.png'), route: isStaff ? 'manage-dining' : 'dining' },
    { name: 'Activities', label: isStaff ? 'Manage Activities' : 'Activities', source: require('@assets/images/activities.png'), route: isStaff ? 'manage-activities' : 'activities' },
    { name: 'Maintenance', label: 'Maintenance', source: require('@assets/images/maintenance.png'), route: 'maintenance' },
    { name: 'Transportation', label: 'Transportation', source: require('@assets/images/transportation.png'), route: 'transportation' },
    { name: 'Wellness', label: 'Wellness', source: require('@assets/images/wellness.png'), route: 'wellness' },
  ].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>Welcome, {fullName}!</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    backgroundColor: '#F3F3E7',
    paddingHorizontal: 10,
  },
  welcome: {
    fontSize: 28,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  barButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    paddingVertical: 25,
    paddingHorizontal: 25,
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
    resizeMode: 'contain',
    marginRight: 20,
  },
  barLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  chevron: {
    marginLeft: 10,
  },
});