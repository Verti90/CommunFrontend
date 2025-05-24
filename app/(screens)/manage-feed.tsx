import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import apiClient from '@services/api';
import { router } from 'expo-router';
import {
  isRequired,
  isLength,
  sanitize,
} from '@utils/validator';

const icons = ['🎉', '💉', '📚', '🚌', '🍽️', '🛠️'];

export default function ManageFeed() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(icons[0]);

  const handleSubmit = async () => {
    // Validate
    if (!isRequired(title)) {
      return Alert.alert('Missing Title', 'Please enter a title for your announcement.');
    }
    if (!isLength(title, 3, 200)) {
      return Alert.alert('Title Too Short', 'Title must be at least 3 characters and less than 200.');
    }
    if (!isRequired(content)) {
      return Alert.alert('Missing Message', 'Please enter the message for your announcement.');
    }
    if (!isLength(content, 5, 1000)) {
      return Alert.alert('Message Too Short', 'Message must be at least 5 characters and less than 1000.');
    }

    try {
      await apiClient.post('/feed/', {
        title: `${selectedIcon} ${sanitize(title)}`,
        content: sanitize(content),
      });
      Alert.alert('Success', 'Announcement added.');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit announcement.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={content}
        onChangeText={setContent}
        multiline
      />

      <Text style={styles.label}>Icon</Text>
      <View style={styles.iconRow}>
        {icons.map((icon) => (
          <TouchableOpacity
            key={icon}
            onPress={() => setSelectedIcon(icon)}
            style={[styles.icon, selectedIcon === icon && styles.selectedIcon]}
          >
            <Text style={{ fontSize: 24 }}>{icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Post Announcement</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#999', marginTop: 10 }]} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F3F3E7',
    flexGrow: 1,
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  icon: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  selectedIcon: {
    backgroundColor: '#cce5ff',
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '600',
  },
});