import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from '@services/api';
import { InteractionManager } from 'react-native';

type User = {
  username: string;
  email: string;
  id?: number;
  is_staff: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@Auth:user');
        const storedToken = await AsyncStorage.getItem('@Auth:token');
        const storedRefreshToken = await AsyncStorage.getItem('@Auth:refreshToken');

        if (storedUser && storedToken && storedRefreshToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            console.warn('⚠️ Could not parse stored user:', e);
            await AsyncStorage.removeItem('@Auth:user');
            setUser(null);
          }

          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
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
      const response = await api.post('/login/', { username, password });
      const { token: { access, refresh }, user } = response.data;

      setToken(access);
      setRefreshToken(refresh);
      setUser(user);

      await AsyncStorage.setItem('@Auth:user', JSON.stringify(user));
      await AsyncStorage.setItem('@Auth:token', access);
      await AsyncStorage.setItem('@Auth:refreshToken', refresh);

      router.replace('/');
      return true;
    } catch (error: any) {
      console.warn('Login error:', error);

      const status = error?.response?.status;

      if (status === 401 || status === 400) {
        throw new Error('Invalid username or password.');
      } else if (error?.message) {
        throw new Error(error.message);
      } else {
        throw new Error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@Auth:user');
    await AsyncStorage.removeItem('@Auth:token');
    await AsyncStorage.removeItem('@Auth:refreshToken');
    setRefreshToken(null);
    setUser(null);
    setToken(null);

    InteractionManager.runAfterInteractions(() => {
      router.replace('/login');
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout, loading }}>
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