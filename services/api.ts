import axios from 'axios';
import { useAuth } from '../AuthContext';

const apiClient = axios.create({
  baseURL: 'http://192.168.4.91:8000/api/',
});

export default apiClient;
