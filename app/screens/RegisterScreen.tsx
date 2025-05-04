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
    if (password !== confirmPassword) {
      Alert.alert('Registration Error', 'Passwords do not match');
      return;
    }

    try {
      await apiClient.post('/register/', {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      Alert.alert('Registration Successful', 'You can now log in');
      router.push('/screens/LoginScreen');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        const data = error.response.data;
        if (data.username?.includes('A user with that username already exists.')) {
          Alert.alert('Registration Error', 'Username already exists. Please choose another.');
        } else if (data.email?.includes('user with this email address already exists.')) {
          Alert.alert('Registration Error', 'Email already exists. Please use a different email address.');
        } else {
          Alert.alert('Registration Error', `Error: ${JSON.stringify(data)}`);
        }
      } else {
        Alert.alert('Registration Error', 'An unexpected error occurred.');
      }
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

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/screens/LoginScreen')}
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
    paddingBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.4,
    marginBottom: 12,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    color: '#fff',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
    marginHorizontal: 16,
    letterSpacing: 0.5,
  },
  form: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    color: '#34495e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    backgroundColor: '#ffffff',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  registerButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  loginButton: {
    paddingVertical: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginText: {
    color: '#2980b9',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default RegisterScreen;
