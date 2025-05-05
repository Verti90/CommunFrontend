import { Stack, router } from 'expo-router';
import { AuthProvider, useAuth } from '../AuthContext';
import { View, Text, ActivityIndicator, useEffect } from 'react-native';

function InnerLayout() {
  const { loading, token } = useAuth();

  useEffect(() => {
    if (!loading && !token) {
      console.log('🔁 No token — redirecting to /login');
      router.replace('/login');
    }
  }, [loading, token]);

  if (loading || (!token && typeof token !== 'string')) {
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
    </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}