import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'http://192.168.4.91:8000/api/',
});

// Interceptor for refreshing JWT token
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('@Auth:refreshToken');
        const response = await axios.post('http://192.168.4.91:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        await AsyncStorage.setItem('@Auth:token', access);

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers['Authorization'] = `Bearer ${access}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
