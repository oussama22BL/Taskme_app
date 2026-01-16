import axiosInstance from './axiosConfig';


export const taskApi = {
  getAllTasks: async () => {
    const response = await axiosInstance.get('/tasks');
    return response.data;
  },

  getTaskById: async (id: string) => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: FormData) => {
    const response = await axiosInstance.post('/tasks', task, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateTask: async (id: string, task: FormData) => {
    const response = await axiosInstance.put(`/tasks/${id}`, task, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await axiosInstance.delete(`/tasks/${id}`);
    return response.data;
  },

  getTasksByDirection: async (direction: string) => {
    const response = await axiosInstance.get(`/tasks/direction/${direction}`);
    return response.data;
  },
};