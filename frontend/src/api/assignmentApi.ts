import axiosInstance from './axiosConfig';

export const assignmentApi = {
  createAssignment: async (data: {
    taskId: string;
    userId: string;
    vehicleId?: string;
    mode: 'manuel' | 'semi-auto' | 'ia';
  }) => {
    const response = await axiosInstance.post('/assignments', data);
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await axiosInstance.get('/assignments/my-assignments');
    return response.data;
  },

  acceptAssignment: async (id: string) => {
    const response = await axiosInstance.patch(`/assignments/${id}/accept`);
    return response.data;
  },

  refuseAssignment: async (id: string, justificatif: string) => {
    const response = await axiosInstance.patch(`/assignments/${id}/refuse`, {
      justificatifRefus: justificatif,
    });
    return response.data;
  },

  getAssignmentHistory: async () => {
    const response = await axiosInstance.get('/assignments/history');
    return response.data;
  },

  generateIAAssignment: async (taskId: string) => {
    const response = await axiosInstance.post(`/assignments/ia/${taskId}`);
    return response.data;
  },
};