import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@auth';
import apiClient from '@services/api';

const screenWidth = Dimensions.get('window').width;

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

const handleRegister = async () => {
  if (!firstName.trim() || !lastName.trim()) {
    return Alert.alert('Missing Name', 'Please enter both your first and last name.');
  }

  if (!username.trim()) {
    return Alert.alert('Missing Username', 'Please enter a username.');
  }

  if (!email.trim()) {
    return Alert.alert('Missing Email', 'Please enter an email address.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return Alert.alert('Invalid Email', 'Please enter a valid email address.');
  }

  if (!roomNumber.trim()) {
    return Alert.alert('Missing Room Number', 'Please enter your room number.');
  }

  if (!password || !confirmPassword) {
    return Alert.alert('Missing Password', 'Please enter and confirm your password.');
  }

  if (password.length < 6) {
    return Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
  }

  if (password !== confirmPassword) {
    return Alert.alert('Mismatch', 'Passwords do not match.');
  }

  setLoading(true);
  try {
    await apiClient.post('/register/', {
      username: username.trim(),
      email: email.trim(),
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      room_number: roomNumber.trim(),
    });

    Alert.alert('Registration Successful', 'You can now log in.');
    router.push('/login');
  } catch (error: any) {
    if (__DEV__) console.log('Registration error:', error);
    if (error.response) {
      const data = error.response.data;
      if (data.username?.includes('A user with that username already exists.')) {
        Alert.alert('Username Taken', 'Please choose another username.');
      } else if (data.email?.includes('user with this email address already exists.')) {
        Alert.alert('Email Taken', 'That email is already in use.');
      } else {
        const firstError = Object.values(data)[0]?.[0] || 'Please check your input.';
        Alert.alert('Registration Error', firstError);
      }
    } else {
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/commun-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerText}>Welcome to Commun</Text>
            <Text style={styles.tagline}>
              WHERE COMMUNITY MEETS COMMUNICATION & CONVENIENCE
            </Text>
          </View>

          <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Enter username"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter email"
            />

            <Text style={styles.label}>Room Number</Text>
            <TextInput
              style={styles.input}
              value={roomNumber}
              onChangeText={setRoomNumber}
              placeholder="Enter room number"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter password"
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm password"
            />

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginText}>Already have an account? Login</Text>
          </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3E7',
  },
  header: {
    backgroundColor: '#586259',
    paddingTop: 60,
    paddingBottom: 36,
    alignItems: 'center',
  },
  logo: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.4,
    marginBottom: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
    marginHorizontal: 16,
    letterSpacing: 0.5,
  },
  form: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },
  label: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#34495e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    backgroundColor: '#ffffff',
    marginBottom: 20,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: 16,
    fontSize: 18,
    borderRadius: 10,
  },
  registerButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 18,
    borderRadius: 10,
    marginTop: 12,
  },
  loginButton: {
    paddingVertical: 16,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginText: {
    color: '#2980b9',
    fontSize: 17,
    textAlign: 'center',
  },
});

export default RegisterScreen;