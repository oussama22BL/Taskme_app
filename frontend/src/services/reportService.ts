import api from './api';

export interface ReportPayload {
  title: string;
  type?: 'individual' | 'global' | 'algorithm' | 'assignment';
  targetUser?: string;
  period?: { from?: string; to?: string };
  tasks?: any[];
  assignments?: any[];
  algorithmReports?: any[];
  refusals?: any[];
  delegations?: any[];
  tags?: string[];
  attachments?: any[];
  status?: 'draft' | 'published' | 'archived';
  metadata?: any;
}

export const reportService = {
  listReports: async (params?: Record<string, any>) => {
    const resp = await api.get('/reports', { params });
    return resp.data;
  },

  getReport: async (id: string) => {
    const resp = await api.get(`/reports/${id}`);
    return resp.data;
  },

  createReport: async (payload: ReportPayload) => {
    const resp = await api.post('/reports', payload);
    return resp.data;
  },

  updateReport: async (id: string, payload: Partial<ReportPayload>) => {
    const resp = await api.put(`/reports/${id}`, payload);
    return resp.data;
  },

  deleteReport: async (id: string) => {
    const resp = await api.delete(`/reports/${id}`);
    return resp.data;
  },

  uploadAttachment: async (id: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const resp = await api.post(`/reports/${id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return resp.data;
  },

  exportReport: async (id: string, format: 'csv' | 'pdf') => {
    const resp = await api.get(`/reports/${id}/export`, { params: { format }, responseType: 'blob' });
    return resp.data;
  }
};

export default reportService;