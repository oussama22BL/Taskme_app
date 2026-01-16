// userApi.ts
import type { User } from '../types';
import axiosInstance from './axiosConfig';

export const userApi = {
  // Récupérer les auditeurs pour l'affectation manuelle
  getAuditors: async () => {
    const response = await axiosInstance.get('/users?role=user');
    return response.data;
  },

  // Récupérer les infos complètes de l'utilisateur connecté
  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },
  // Mettre à jour (nom, prenom, diplomes, formations)
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  }
};