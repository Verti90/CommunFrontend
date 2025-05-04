import { Stack } from 'expo-router';
import { AuthProvider } from '../AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}

export default Layout;