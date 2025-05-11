import apiClient from '@services/api';

export interface UserProfile {
  first_name: string;
  last_name: string;
  room_number?: string;
  username: string;
  email: string;
}

export const fetchProfile = async (token: string): Promise<UserProfile> => {
  const response = await apiClient.get('/profile/', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { first_name, last_name, room_number, username, email } = response.data;
  return { first_name, last_name, room_number, username, email };
};