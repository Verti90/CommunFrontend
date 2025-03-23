import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Registration Error', 'Passwords do not match');
      return;
    }

    try {
      // Replace the URL with the actual registration endpoint
      await axios.post('https://your-backend-url/api/register/', {
        username,
        password,
      });
      Alert.alert('Registration Successful', 'You can now log in');
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error("Registration error:", error); // Add this line for debugging
      Alert.alert('Registration Error', 'An error occurred during registration');
    }
  };

  return (
    <View>
      <Text>Username</Text>
      <TextInput value={username} onChangeText={setUsername} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Text>Confirm Password</Text>
      <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;
