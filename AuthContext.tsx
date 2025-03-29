import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router'; // ✅ Use router for navigation
import api from './services/api';

type User = {
  username: string;
  email: string;
  id?: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@Auth:user');
        const storedToken = await AsyncStorage.getItem('@Auth:token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          console.log('🔐 Loaded user from storage:', JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting backend login with username:', username);
      const response = await api.post('/login/', { username, password });
      console.log('🔐 Backend login response:', response.data);

      const { token, user } = response.data;

      setToken(token.access);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token.access}`;

      await AsyncStorage.setItem('@Auth:user', JSON.stringify(user));
      await AsyncStorage.setItem('@Auth:token', token.access);

      console.log('✅ Navigating to Home after login');
      router.replace('/'); // ✅ Go to home screen
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@Auth:user');
    await AsyncStorage.removeItem('@Auth:token');
    setUser(null);
    setToken(null);

    console.log('🚪 Logged out, navigating to Login');
    router.replace('/login'); // ✅ Go to login screen
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
