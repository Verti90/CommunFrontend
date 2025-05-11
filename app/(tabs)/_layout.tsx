import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarLabelStyle: {
            fontSize: 18,
            fontWeight: 'bold',
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarStyle: {
            height: 70,
            paddingBottom: 8,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" color={color} size={28} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-circle-outline" color={color} size={28} />
            ),
          }}
        />

        {/* Hidden routes */}
        <Tabs.Screen name="manage-dining" options={{ href: null }} />
        <Tabs.Screen name="admin" options={{ href: null }} />
        <Tabs.Screen name="manage-activities" options={{ href: null }} />
        <Tabs.Screen name="manage-maintenance" options={{ href: null }} />
        <Tabs.Screen name="manage-transportation" options={{ href: null }} />
        <Tabs.Screen name="manage-wellness" options={{ href: null }} />
        <Tabs.Screen name="dining" options={{ href: null }} />
        <Tabs.Screen name="activities" options={{ href: null }} />
        <Tabs.Screen name="maintenance" options={{ href: null }} />
        <Tabs.Screen name="transportation" options={{ href: null }} />
        <Tabs.Screen name="wellness" options={{ href: null }} />
      </Tabs>

      <Toast />
    </>
  );
}