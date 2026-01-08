import api from './api';

export interface MessagePayload {
  receiverId: string;
  content?: string;
  type?: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
}

export const messageService = {
  sendMessage: async (payload: MessagePayload) => {
    const resp = await api.post('/messages', payload);
    return resp.data;
  },

  getConversations: async () => {
    const resp = await api.get('/messages/conversations');
    return resp.data;
  },

  getMessagesForConversation: async (conversationId: string) => {
    const resp = await api.get(`/messages/conversations/${conversationId}`);
    return resp.data;
  },

  markAsRead: async (conversationId: string) => {
    const resp = await api.post(`/messages/conversations/${conversationId}/read`);
    return resp.data;
  }
};

export default messageService;