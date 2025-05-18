import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@auth';
import apiClient from '@services/api';
import * as Notifications from 'expo-notifications';

export default function HomeScreen() {
  const { token, user } = useAuth();
  const [fullName, setFullName] = useState('Resident');
  const [roomNumber, setRoomNumber] = useState('');
  const [announcements, setAnnouncements] = useState([]);

  const previousIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

useFocusEffect(
  useCallback(() => {
    const fetchEverything = async () => {
      if (!token) return; // Skip fetch if token is missing (user logged out)

      try {
        const profileResponse = await apiClient.get('profile/');
        const { first_name, last_name, room_number } = profileResponse.data;
        setFullName(`${first_name} ${last_name}`);
        setRoomNumber(room_number || '');

  const feedResponse = await apiClient.get('/feed/');
  const newAnnouncements = feedResponse.data;

  const newOnly = newAnnouncements.filter(a => !previousIdsRef.current.has(a.id));
  for (const a of newOnly) {
    await Notifications.scheduleNotificationAsync({
      content: { title: a.title, body: a.content, sound: true },
      trigger: null,
    });
    previousIdsRef.current.add(a.id);
  }

  setAnnouncements(newAnnouncements);

      } catch (error: any) {
        if (__DEV__) console.warn('❌ Home screen fetch failed:', error?.message || error);
        // Optionally show a toast or alert only if token still exists
        // Toast.show({ type: 'error', text1: 'Could not load profile' });
      }
    };

    fetchEverything();
  }, [token])
);

const isStaff = user?.role === 'staff';

const baseIcons = [
  { name: 'Admin', label: 'Admin', source: require('@assets/images/admin.png'), route: 'admin' },
  { name: 'Dining', label: 'Dining', source: require('@assets/images/dining.png'), route: 'dining' },
  { name: 'Activities', label: 'Activities', source: require('@assets/images/activities.png'), route: 'activities' },
  { name: 'Maintenance', label: 'Maintenance & Housekeeping', source: require('@assets/images/maintenance.png'), route: 'maintenance' },
  { name: 'Transportation', label: 'Transportation', source: require('@assets/images/transportation.png'), route: 'transportation' },
];

const extraIcon = isStaff
  ? {
      name: 'Reports',
      label: 'Reports',
      source: require('@assets/images/admin.png'),
      route: 'manage-reports',
    }
  : {
      name: 'Wellness',
      label: 'Wellness',
      source: require('@assets/images/wellness.png'),
      route: 'wellness',
    };

const filteredIcons = [...baseIcons, extraIcon];

const icons = filteredIcons.map(icon => {
  if (!isStaff) return icon;

  if (icon.name === 'Admin' || icon.name === 'Reports') return icon;

  if (icon.name === 'Maintenance') {
    return {
      ...icon,
      label: 'Manage Maintenance',
      route: 'manage-maintenance',
    };
  }

  return {
    ...icon,
    label: `Manage ${icon.label}`,
    route: `manage-${icon.route}`,
  };
});

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

    {isStaff && (
      <TouchableOpacity
        style={{ alignSelf: 'center', marginBottom: 10 }}
        onPress={() => router.push('/manage-feed')}
      >
        <Text style={{ color: 'blue', fontSize: 16 }}>+ Add New</Text>
      </TouchableOpacity>
    )}

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
            position: 'relative',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 15, color: '#333' }}>{item.content}</Text>

          {isStaff && (
            <TouchableOpacity
              onPress={async () => {
                try {
                  await apiClient.delete(`/feed/${item.id}/`);
                  setAnnouncements(prev => prev.filter(a => a.id !== item.id));
                } catch (err) {
                  Alert.alert('Error', 'Failed to delete announcement.');
                }
              }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                padding: 4,
              }}
            >
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>
          )}
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