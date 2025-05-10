import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@auth';
import apiClient from '@services/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  room_number?: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const { token, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
        setOriginalProfile(response.data);
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>

  <View style={styles.fieldGroup}>
    <Text style={styles.label}>First Name</Text>
    <Text style={styles.value}>{profile.first_name}</Text>

    <Text style={styles.label}>Last Name</Text>
    <Text style={styles.value}>{profile.last_name}</Text>

    <Text style={styles.label}>Username</Text>
    <Text style={styles.value}>{profile.username}</Text>

    <Text style={styles.label}>Email</Text>
    <TextInput
      style={[styles.emailInput, !isEditing && { backgroundColor: '#eee' }]}
      value={profile.email}
      editable={isEditing}
      onChangeText={(text) =>
        setProfile((prev) => prev ? { ...prev, email: text } : prev)
      }
      keyboardType="email-address"
      placeholder="Enter email"
    />

    <Text style={styles.label}>Room Number</Text>
    <TextInput
      style={[styles.roomInput, !isEditing && { backgroundColor: '#eee' }]}
      value={profile.room_number || ''}
      editable={isEditing}
      onChangeText={(text) =>
        setProfile((prev) => prev ? { ...prev, room_number: text } : prev)
      }
      keyboardType="numeric"
      placeholder="Enter room"
    />
  </View>

  <TouchableOpacity
    style={styles.saveButton}
    onPress={async () => {
      if (!isEditing) {
        setIsEditing(true);
        return;
      }
      try {
        await apiClient.post(
          'profile/preferences/',
          {
            email: profile.email,
            ...(profile.room_number !== undefined && profile.room_number !== ''
              ? { room_number: profile.room_number }
              : {}),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert('Success', 'Profile updated.');
        setOriginalProfile(profile);
        setIsEditing(false);
      } catch (error) {
        console.error('Update failed:', error);
        Alert.alert('Error', 'Failed to update profile.');
      }
    }}
  >
    <Text style={styles.saveText}>{isEditing ? 'Save' : 'Edit'}</Text>
  </TouchableOpacity>

{isEditing && (
  <TouchableOpacity
    style={[styles.saveButton, { backgroundColor: '#aaa', marginTop: 10 }]}
    onPress={() => {
      setProfile(originalProfile);
      setIsEditing(false);
    }}
  >
    <Text style={styles.saveText}>Cancel</Text>
  </TouchableOpacity>
)}

  <TouchableOpacity style={styles.logoutButton} onPress={logout}>
    <Text style={styles.logoutText}>Logout</Text>
  </TouchableOpacity>
</ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F3E7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  fieldGroup: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 26,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  value: {
    fontSize: 26,
    marginBottom: 12,
    textAlign: 'center',
    color: '#444',
  },
  emailInput: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 16,
    width: '80%',
    textAlign: 'center',
  },
  roomInput: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 16,
    width: '20%',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
    marginTop: 24,
  },
  saveText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#FF6B6B',
    paddingVertical: 18,
    paddingHorizontal: 44,
    borderRadius: 12,
  },
  logoutText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 26,
    color: '#777',
    textAlign: 'center',
  },
});