import axiosInstance from './axiosConfig';
import type { LoginCredentials, RegisterData, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await axiosInstance.put('/auth/profile', data);
    return response.data;
  },
};