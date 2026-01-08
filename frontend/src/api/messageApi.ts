// src/api/messageApi.ts
import axiosInstance from './axiosConfig';

export interface Message {
  _id: string;
  sender: {
    _id: string;
    nom: string;
    prenom: string;
  };
  taskId: string | null;
  content: string;
  createdAt: string;
}

export const messageApi = {
  // Récupérer l'historique (taskId peut être "general" ou un ID de mission)
  getHistory: async (taskId: string): Promise<Message[]> => {
    const response = await axiosInstance.get(`/messages/${taskId}`);
    return response.data;
  }
};