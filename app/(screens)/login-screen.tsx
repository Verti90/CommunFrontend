import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@auth';
import apiClient from '@services/api';

const LoginScreen = () => {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [savedUsername, savedPassword] = await Promise.all([
          AsyncStorage.getItem('rememberedUsername'),
          AsyncStorage.getItem('rememberedPassword'),
        ]);

        if (savedUsername && savedPassword) {
          setUsername(savedUsername);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading remembered credentials:', error);
      }
    })();
  }, []);

  const handleLogin = async () => {
    try {
      await login(username, password);

      if (rememberMe) {
        await AsyncStorage.setItem('rememberedUsername', username);
        await AsyncStorage.setItem('rememberedPassword', password);
      } else {
        await AsyncStorage.multiRemove(['rememberedUsername', 'rememberedPassword']);
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An unexpected error occurred.');
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/commun-logo.png')}
          style={[styles.logo, { width: width * 0.4, height: width * 0.4 }]}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to Commun</Text>
        <Text style={styles.subtitle}>
          WHERE COMMUNITY MEETS COMMUNICATION & CONVENIENCE
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          placeholder="Enter username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rememberMe}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={styles.checkbox}>
            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.rememberMeText}>Remember Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3e6',
  },
  header: {
    backgroundColor: '#586259',
    alignItems: 'center',
    paddingVertical: 50,
  },
  logo: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'white',
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: 24,
    paddingTop: 36,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 18,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2f80ed',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
    lineHeight: 22,
  },
  rememberMeText: {
    color: '#555',
    fontSize: 16,
  },
});