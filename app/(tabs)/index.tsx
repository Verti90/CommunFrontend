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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { first_name, last_name } = response.data;
        setFullName(`${first_name} ${last_name}`);
      } catch (error) {
        console.error('Error fetching profile for Home screen:', error);
      }
    };

    fetchProfile();
  }, [token]);

  const icons = [
    ...(user?.role === 'staff'
      ? [
          { name: 'Admin', source: require('@assets/images/Admin.jpg') },
          { name: 'ManageMenus', source: require('@assets/images/icon-manage-menus.png') },
        ]
      : []),
    ...(user?.role !== 'staff'
      ? [{ name: 'Dining', source: require('@assets/images/Dining.jpg') }]
      : []),
      {
        name: 'Activities',
        source: require('@assets/images/Activities.jpg'),
        route: user?.role === 'staff' ? 'StaffActivities' : 'Activities',
      },
    { name: 'Maintenance', source: require('@assets/images/Maintenance.jpg') },
    { name: 'Transportation', source: require('@assets/images/Transportation.jpg') },
    { name: 'Wellness', source: require('@assets/images/Wellness.jpg') },
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
      onPress={() => {
        const routeName = icon.route || (icon.name === 'ManageMenus' ? 'AddDailyMenuScreen' : icon.name);
        router.push(`/${routeName}`);
      }}    
    >
      <Image source={icon.source} style={styles.iconImage} />
      <Text>
  {icon.name === 'ManageMenus'
    ? 'Manage Menus'
    : icon.name === 'Activities' && user?.role === 'staff'
    ? 'Manage Activities'
    : icon.name}
</Text>
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
  welcome: { fontSize: 24, marginBottom: 10 },
  title: { fontSize: 30, fontWeight: 'bold', marginBottom: 20 },
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