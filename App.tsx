import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './AuthContext';
import LoginScreen from './app/LoginScreen';
import HomeScreen from './app/HomeScreen';
// Import other screens as needed

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          {/* Add other screens here */}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
