import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import apiClient from '../services/api';
import { useAuth } from '../AuthContext';

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
    backgroundColor: '#FAF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    marginBottom: 5,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    color: '#777',
  },
});
