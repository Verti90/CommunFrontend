import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://192.168.4.91:8000/api/', // Replace with your actual backend URL
    headers: {
        'Content-Type': 'application/json',
    },
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
