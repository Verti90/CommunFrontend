import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
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
    ...(isStaff
      ? [
          {
            name: 'Admin',
            label: 'Admin',
            source: require('@assets/images/Admin.jpg'),
            route: 'admin',
          },
          {
            name: 'ManageMenus',
            label: 'Manage Menus',
            source: require('@assets/images/icon-manage-menus.png'),
            route: 'manage-menus',
          },
        ]
      : [
          {
            name: 'Dining',
            label: 'Dining',
            source: require('@assets/images/Dining.jpg'),
            route: 'dining',
          },
        ]),
    {
      name: 'Activities',
      label: isStaff ? 'Manage Activities' : 'Activities',
      source: require('@assets/images/Activities.jpg'),
      route: isStaff ? 'manage-activities' : 'activities',
    },
    {
      name: 'Maintenance',
      label: 'Maintenance',
      source: require('@assets/images/Maintenance.jpg'),
      route: 'maintenance',
    },
    {
      name: 'Transportation',
      label: 'Transportation',
      source: require('@assets/images/Transportation.jpg'),
      route: 'transportation',
    },
    {
      name: 'Wellness',
      label: 'Wellness',
      source: require('@assets/images/Wellness.jpg'),
      route: 'wellness',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>Welcome, {fullName}!</Text>
      <Text style={styles.title}>Aravah Senior Living</Text>
      <View style={styles.iconContainer}>
        {icons.map((icon) => (
          <TouchableOpacity
            key={icon.name}
            style={styles.iconButton}
            onPress={() => router.push(`/${icon.route}`)}
          >
            <Image source={icon.source} style={styles.iconImage} />
            <Text>{icon.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f0f0e5',
  },
  welcome: {
    fontSize: 24,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconButton: {
    width: '40%',
    padding: 10,
    margin: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    elevation: 3,
  },
  iconImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});