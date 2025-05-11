import { Stack, router } from 'expo-router';
import { AuthProvider, useAuth } from '@auth';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

function InnerLayout() {
  const { loading, token } = useAuth();

  useEffect(() => {
    if (!loading && (!token || typeof token !== 'string')) {
      router.replace('/login');
    }
  }, [loading, token]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <>
        <InnerLayout />
        <Toast />
      </>
    </AuthProvider>
  );
}