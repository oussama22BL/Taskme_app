import axiosInstance from './axiosConfig';

export const notificationApi = {
  // Récupérer toutes mes notifications
  getAll: async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },
  // Marquer une notification comme lue
  markAsRead: async (id: string) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },
  // Tout marquer comme lu
  markAllAsRead: async () => {
    const response = await axiosInstance.patch('/notifications/read-all');
    return response.data;
  }
};