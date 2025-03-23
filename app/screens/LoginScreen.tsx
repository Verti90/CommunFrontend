import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.4.91:8000/api/token/', { username, password });
      const { access, refresh } = response.data;
      setUser({ access, refresh });
      navigation.replace('Home');
    } catch (error) {
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
