import axios from 'axios';

// Centralized API Base URL
export const API_BASE_URL = 'http://192.168.4.91:8000/api'; // Update as needed

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Optional: Add request interceptor for token management if needed
// apiClient.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem('@Auth:token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default apiClient;
