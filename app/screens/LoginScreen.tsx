import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../AuthContext"; // Adjusted the import path
import axios from 'axios';

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.4.91:8000/api/token/', { username, password });
      const { refresh, access } = response.data;
      await login({ username }, access);
      navigation.replace("Home"); // Ensure this matches the defined route name
    } catch (error) {
      console.error("Login error", error);
      // Handle login error (e.g., show an error message)
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
});
