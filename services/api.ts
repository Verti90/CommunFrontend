
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'http://192.168.4.91:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor — attach access token
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

// Handle token refresh queue to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor — refresh, logout, toast
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your internet connection.',
      });
      return Promise.reject(error);
    }

    // Handle 401: try refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('@Auth:refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}token/refresh/`, {
          refresh: refreshToken,
        });

        await AsyncStorage.setItem('@Auth:token', data.access);
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove([
          '@Auth:token',
          '@Auth:refreshToken',
          '@Auth:user',
        ]);
        if (__DEV__) console.warn('🔁 Token refresh failed. Logging out...');
        router.replace('/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other common errors with toast
    const status = error.response.status;
    let message = 'Something went wrong.';

    if (status === 403) message = 'You do not have permission to do that.';
    else if (status === 404) message = 'That resource was not found.';
    else if (status >= 500) message = 'Server error. Please try again later.';

    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
    });

    if (__DEV__) {
      console.warn(`🌐 API Error (${status}): ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default api;