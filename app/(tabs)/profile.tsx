import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '@auth';
import apiClient from '@services/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          Alert.alert(
            "Session Expired",
            "Your session has expired, please log back in.",
            [
              {
                text: "OK",
                onPress: () => logout(),
              },
            ]
          );
        } else {
          console.error('Error fetching profile:', error);
          if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
          }
        }
      }
    };

    fetchProfile();
  }, [token, logout]);

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.label}>First Name:</Text>
      <Text style={styles.value}>{profile.first_name}</Text>

      <Text style={styles.label}>Last Name:</Text>
      <Text style={styles.value}>{profile.last_name}</Text>

      <Text style={styles.label}>Username:</Text>
      <Text style={styles.value}>{profile.username}</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{profile.email}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3E7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  label: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
  },
  value: {
    fontSize: 22,
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 22,
    color: '#777',
  },
});