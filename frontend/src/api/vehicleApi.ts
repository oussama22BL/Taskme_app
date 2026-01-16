import axiosInstance from './axiosConfig';
import type { Vehicle } from '../types';

export const vehicleApi = {
  getAllVehicles: async () => {
    const response = await axiosInstance.get('/vehicles');
    return response.data;
  },

  getAvailableVehicles: async () => {
    const response = await axiosInstance.get('/vehicles/available');
    return response.data;
  },

  createVehicle: async (vehicle: Omit<Vehicle, '_id' | 'createdAt'>) => {
    const response = await axiosInstance.post('/vehicles', vehicle);
    return response.data;
  },

  updateVehicle: async (id: string, vehicle: Partial<Vehicle>) => {
    const response = await axiosInstance.put(`/vehicles/${id}`, vehicle);
    return response.data;
  },

  deleteVehicle: async (id: string) => {
    const response = await axiosInstance.delete(`/vehicles/${id}`);
    return response.data;
  },

  toggleDisponibilite: async (id: string) => {
    const response = await axiosInstance.patch(`/vehicles/${id}/disponibilite`);
    return response.data;
  },
};