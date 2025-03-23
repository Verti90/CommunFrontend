import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './AuthContext';
import LoginScreen from './app/screens/LoginScreen';
import HomeScreen from './app/screens/HomeScreen'; // Ensure this is correctly imported

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} /> {/* Ensure this route is defined */}
          {/* Add other screens here */}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
