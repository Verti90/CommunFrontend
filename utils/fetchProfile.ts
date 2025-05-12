import apiClient from '@services/api';

export interface UserProfile {
  first_name: string;
  last_name: string;
  room_number?: string;
  username: string;
  email: string;
}

export const fetchProfile = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get('/profile/');
    const { first_name, last_name, room_number, username, email } = response.data;
    return { first_name, last_name, room_number, username, email };
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
};