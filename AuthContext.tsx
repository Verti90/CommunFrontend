import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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
      const storedRefreshToken = await AsyncStorage.getItem('@Auth:refreshToken');

      if (storedUser && storedToken && storedRefreshToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        console.log('🔐 Loaded user from storage:', JSON.parse(storedUser));
      } else {
        await AsyncStorage.clear();
        setUser(null);
        setToken(null);
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

      const { token: { access, refresh }, user } = response.data;

      setToken(access);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      await AsyncStorage.setItem('@Auth:user', JSON.stringify(user));
      await AsyncStorage.setItem('@Auth:token', access);
      await AsyncStorage.setItem('@Auth:refreshToken', refresh);

      console.log('✅ Navigating to Home after login');
      router.replace('/');
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
    router.replace('/login');
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
