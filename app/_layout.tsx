import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ tabBarLabel: 'Home', tabBarIcon: () => <Ionicons name="home" size={24} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile', tabBarIcon: () => <Ionicons name="person" size={24} /> }} />
      
      <Tabs.Screen name="Activities" options={{ href: null }} />
      <Tabs.Screen name="Admin" options={{ href: null }} />
      <Tabs.Screen name="Dining" options={{ href: null }} />
      <Tabs.Screen name="Maintenance" options={{ href: null }} />
      <Tabs.Screen name="Transportation" options={{ href: null }} />
      <Tabs.Screen name="Wellness" options={{ href: null }} />
    </Tabs>
  );
}
