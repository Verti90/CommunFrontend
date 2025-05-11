import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Use your static IP or domain name here
const API_BASE_URL = 'http://192.168.4.91:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token before every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@Auth:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors and try to refresh token once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('@Auth:refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const refreshResponse = await axios.post(
          `${API_BASE_URL}token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = refreshResponse.data.access;
        await AsyncStorage.setItem('@Auth:token', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('🔁 Token refresh failed. Logging out...');
        await AsyncStorage.multiRemove([
          '@Auth:token',
          '@Auth:refreshToken',
          '@Auth:user',
        ]);
        router.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;