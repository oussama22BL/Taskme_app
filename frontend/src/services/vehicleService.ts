import api from './api';
import { Vehicle } from '../types/vehicle';

export const listVehicles = async (): Promise<Vehicle[]> => {
  const res = await api.get('/vehicles');
  return res.data;
};

export const listAvailable = async (): Promise<Vehicle[]> => {
  const res = await api.get('/vehicles/available');
  return res.data;
};

export const getVehicle = async (id: string): Promise<Vehicle> => {
  const res = await api.get(`/vehicles/${id}`);
  return res.data;
};

export const createVehicle = async (payload: Partial<Vehicle>): Promise<Vehicle> => {
  const res = await api.post('/vehicles', payload);
  return res.data;
};

export const updateVehicle = async (id: string, payload: Partial<Vehicle>): Promise<Vehicle> => {
  const res = await api.put(`/vehicles/${id}`, payload);
  return res.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};

export const assignVehicle = async (id: string, body: any): Promise<Vehicle> => {
  const res = await api.post(`/vehicles/${id}/assign`, body);
  return res.data;
};

export const releaseVehicle = async (id: string): Promise<Vehicle> => {
  const res = await api.post(`/vehicles/${id}/release`);
  return res.data;
};

export default {
  listVehicles,
  listAvailable,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  assignVehicle,
  releaseVehicle
};