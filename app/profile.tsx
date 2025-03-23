import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import apiClient from '../services/api';
import { useAuth } from '../AuthContext';

interface UserProfile {
  id: number;
  username: string;
  email: string;
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
          console.error('Error fetching profile:', error);
          if (error.response) {
            console.error('Response data:', error.response.data); // Log response data
            console.error('Response status:', error.response.status); // Log response status
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
      <Text style={styles.label}>Username:</Text>
      <Text style={styles.value}>{profile.username}</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{profile.email}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5DC',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  loadingText: {
    fontSize: 18,
    color: '#777',
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FF6347',
    borderRadius: 5,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});
