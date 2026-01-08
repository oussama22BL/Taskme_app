// userApi.ts
import axiosInstance from './axiosConfig';

export const userApi = {
  // Récupérer les auditeurs pour l'affectation manuelle
  getAuditors: async () => {
    const response = await axiosInstance.get('/users?role=user');
    return response.data;
  }
};