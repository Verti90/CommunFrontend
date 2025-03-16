import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../app/AuthContext";  // Ensure this works
import { ActivityIndicator, View } from "react-native";
import IndexScreen from "../app/index";
import ProfileScreen from "../app/profile";
import ActivitiesScreen from "../app/Activities";
import AdminScreen from "../app/Admin";
import DiningScreen from "../app/Dining";
import MaintenanceScreen from "../app/Maintenance";
import TransportationScreen from "../app/Transportation";
import WellnessScreen from "../app/Wellness";
import LoginScreen from "../app/screens/LoginScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={IndexScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const RootLayoutNav = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="Activities" component={ActivitiesScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="Dining" component={DiningScreen} />
          <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
          <Stack.Screen name="Transportation" component={TransportationScreen} />
          <Stack.Screen name="Wellness" component={WellnessScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default RootLayoutNav; // Ensure it's exported correctly
