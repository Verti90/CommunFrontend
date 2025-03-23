import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(username, password);
    } catch (error) {
      console.error("Login error:", error); // Add this line for debugging
      if (error.response && error.response.status === 401) {
        Alert.alert('Login Error', 'Invalid credentials');
      } else {
        Alert.alert('Login Error', 'An error occurred during login');
      }
    }
  };

  return (
    <View>
      <Text>Username</Text>
      <TextInput value={username} onChangeText={setUsername} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
