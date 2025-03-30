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
import { useAuth } from '../../AuthContext';

const LoginScreen = () => {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadRememberedCredentials = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('rememberedUsername');
        const savedPassword = await AsyncStorage.getItem('rememberedPassword');
        if (savedUsername && savedPassword) {
          setUsername(savedUsername);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading remembered credentials:', error);
      }
    };

    loadRememberedCredentials();
  }, []);

  const handleLogin = async () => {
    const success = await login(username, password);
    if (success) {
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedUsername', username);
        await AsyncStorage.setItem('rememberedPassword', password);
      } else {
        await AsyncStorage.removeItem('rememberedUsername');
        await AsyncStorage.removeItem('rememberedPassword');
      }
    } else {
      Alert.alert('Login Failed', 'Invalid username or password.');
    }
  };

  const handleRegister = () => {
    router.push('/RegisterScreen');
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
    paddingVertical: 40,
  },
  logo: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 11,
    fontStyle: 'italic',
    color: 'white',
    marginTop: 2,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  label: {
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2f80ed',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 8,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: 'bold',
    lineHeight: 18,
  },
  rememberMeText: {
    color: '#555',
  },
});
