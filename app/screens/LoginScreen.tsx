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
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../AuthContext';

const screenWidth = Dimensions.get('window').width;

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const { login } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkBiometricSupport();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricSupported(compatible && enrolled);
  };

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login with Face ID / Biometrics',
    });

    if (result.success) {
      const lastUsername = 'jtenbroeck'; // Replace later with SecureStore
      const lastPassword = 'your_password'; // Replace later with SecureStore
      const success = await login(lastUsername, lastPassword);
      if (success) {
        navigation.navigate('Main');
      } else {
        Alert.alert('Login Failed', 'Stored credentials are incorrect.');
      }
    } else {
      Alert.alert('Authentication Failed', 'Face ID cancelled or failed.');
    }
  };

  const handleLogin = async () => {
    const success = await login(username, password);
    if (success) {
      navigation.navigate('Main');
    } else {
      Alert.alert('Login Failed', 'Invalid username or password.');
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
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter username"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter password"
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {isBiometricSupported && (
              <TouchableOpacity
                style={styles.faceIdButton}
                onPress={handleBiometricLogin}
              >
                <Text style={styles.buttonText}>Login with Face ID</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.buttonText}>Register</Text>
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
  loginButton: {
    backgroundColor: '#2980b9',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  faceIdButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  registerButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginScreen;
