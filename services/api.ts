import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'http://192.168.4.91:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
});

// Attach access token to each request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@Auth:token');

    // Only attach token to protected routes
    if (
      token &&
      config.url &&
      !config.url.includes('/login') &&
      !config.url.includes('/register')
    ) {
      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh queue
type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: any) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.config) return Promise.reject(error);

    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest.url?.includes('/login') ||
      originalRequest.url?.includes('/token/refresh');

    // Attempt token refresh on 401 errors (excluding login/refresh routes)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (!originalRequest.headers) originalRequest.headers = {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('@Auth:refreshToken');
        if (!refreshToken) {
          console.warn('❌ No refresh token found — skipping refresh.');
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_BASE_URL}token/refresh/`, {
          refresh: refreshToken,
        });

        await AsyncStorage.setItem('@Auth:token', data.access);
        processQueue(null, data.access);

        if (!originalRequest.headers) originalRequest.headers = {};
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

    // Show error toast (skip for login endpoint)
    const status = error.response?.status;
    const isLoginError = originalRequest.url?.includes('/login');

    if (!isLoginError) {
      let message = 'Something went wrong.';
      if (status === 403) message = 'You do not have permission to do that.';
      else if (status === 404) message = 'That resource was not found.';
      else if (status >= 500) message = 'Server error. Please try again later.';

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    }

    if (__DEV__) {
      console.warn(`🌐 API Error (${status}): ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default api;