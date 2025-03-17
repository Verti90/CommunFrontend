import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
    baseURL: 'http://192.168.4.91:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Authorization header to every request
apiClient.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('No token found in AsyncStorage');
        }
    } catch (error) {
        console.error('Error retrieving token from AsyncStorage:', error);
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Authentication methods
export const loginUser = async (username: string, password: string) => {
    const response = await apiClient.post('login/', { username, password });
    return response.data;
};

// Activities methods
export const getActivities = async (startDate?: string, endDate?: string) => {
    const response = await apiClient.get('activities/', {
        params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
};

export const signupActivity = async (activityId: number) => {
    const response = await apiClient.post(`activities/${activityId}/signup/`);
    return response.data;
};

export const unregisterActivity = async (activityId: number) => {
    const response = await apiClient.post(`activities/${activityId}/unregister/`);
    return response.data;
};

export default apiClient;
