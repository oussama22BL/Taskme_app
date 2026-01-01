export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  timestamp: string;
  type?: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
}
