import api from './api';

export interface UserPayload {
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'user' | 'superAdmin';
  specialite: string;
  grade: string;
  diplomes?: string[];
  formations?: string[];
  password?: string;
}

export interface User extends UserPayload {
  id?: string;
  _id?: string;
  // active field removed — activation handled outside of this service in future if needed
}

export const userService = {
  createUser: async (data: UserPayload) => {
    const resp = await api.post('/users', data);
    return resp.data;
  },

  listUsers: async (params?: Record<string, any>) => {
    const resp = await api.get('/users', { params });
    return resp.data;
  },

  getUser: async (id: string) => {
    const resp = await api.get(`/users/${id}`);
    return resp.data;
  },

  updateUser: async (id: string, data: Partial<UserPayload>) => {
    const resp = await api.put(`/users/${id}`, data);
    return resp.data;
  },

  deleteUser: async (id: string) => {
    const resp = await api.delete(`/users/${id}`);
    return resp.data;
  },
  // setUserActive removed — activation/deactivation feature cancelled
};

export default userService;
