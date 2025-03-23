import React from 'react';
import { useAuth } from '../AuthContext';
import { ActivityIndicator, View, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import IndexScreen from '../app/index';
import ProfileScreen from '../app/profile';
import ActivitiesScreen from '../app/Activities';
import AdminScreen from '../app/Admin';
import DiningScreen from '../app/Dining';
import MaintenanceScreen from '../app/Maintenance';
import TransportationScreen from '../app/Transportation';
import WellnessScreen from '../app/Wellness';
import LoginScreen from '../app/screens/LoginScreen';
import RegisterScreen from '../app/screens/RegisterScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator for additional screens
const OtherScreensNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Activities" component={ActivitiesScreen} />
    <Stack.Screen name="Admin" component={AdminScreen} />
    <Stack.Screen name="Dining" component={DiningScreen} />
    <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
    <Stack.Screen name="Transportation" component={TransportationScreen} />
    <Stack.Screen name="Wellness" component={WellnessScreen} />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="Home"
      component={IndexScreen}
      options={{
        tabBarIcon: ({ size, color }) => (
          <Image
            source={require('../assets/images/Home.png')}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
      }}
    />
    <Tab.Screen
      name="More"
      component={OtherScreensNavigator}
      options={{ tabBarButton: () => null }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ size, color }) => (
          <Image
            source={require('../assets/images/Profile.png')}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

// Authentication stack (Login/Register)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Root Layout Navigator
const RootLayoutNav = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default RootLayoutNav;
