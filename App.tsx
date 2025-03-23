import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './AuthContext';
import LoginScreen from './app/screens/LoginScreen';
import IndexScreen from './app/index';
import RegisterScreen from './app/screens/RegisterScreen'; // Import RegisterScreen

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={IndexScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} /> {/* Add RegisterScreen */}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
