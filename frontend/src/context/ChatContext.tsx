import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import messageService from '../services/messageService';
import { userService } from '../services/userService';

export interface ChatUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
}

export interface ChatConversation {
  id: string;
  participantIds: string[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  createdAt: Date;
}

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  onlineUsers: ChatUser[];
  sendMessage: (receiverId: string, content: string, type?: ChatMessage['type'], file?: File) => void;
  startConversation: (userId: string) => void;
  markAsRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  // Widget control
  widgetOpen: boolean;
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);

  // Load contacts for chat when authenticated
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const loadContacts = async () => {
      try {
        const contacts = await userService.listContacts();
        if (!mounted) return;
        const mapped = (contacts || []).map((c: any) => ({
          id: c.id || c._id,
          name: c.name || `${c.prenom || ''} ${c.nom || ''}`.trim(),
          role: c.role || 'user',
          avatar: (c.prenom ? c.prenom[0] : '?') || '👤',
          isOnline: true
        } as ChatUser));
        // remove current user from contacts
        setOnlineUsers(mapped.filter((m: ChatUser) => String(m.id) !== String(user.id)));
      } catch (err) {
        console.error('Failed to load chat contacts', err);
      }
    };

    loadContacts();

    return () => { mounted = false; };
  }, [user]);
  const openWidget = () => setWidgetOpen(true);
  const closeWidget = () => setWidgetOpen(false);
  const toggleWidget = () => setWidgetOpen(v => !v);

  // Periodic online status update (kept for UX)
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => prev.map(u => ({ ...u, isOnline: Math.random() > 0.3 })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Poll conversations periodically so different clients can see updates
  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const loadConversations = async () => {
      try {
        const convs = await messageService.getConversations();
        if (!mounted) return;

        // If there's an active conversation and its lastMessage changed, we'll refresh messages
        const activeConvId = activeConversation?.id;
        const updatedConv = convs.find((c: any) => c.id === activeConvId);
        setConversations(convs);

        if (activeConvId && updatedConv && updatedConv.lastMessage && String(updatedConv.lastMessage.id) !== String(activeConversation?.lastMessage?.id)) {
          // refresh messages for active conversation
          try {
            const msgs = await messageService.getMessagesForConversation(activeConvId);
            const mapped = msgs.map((m: any) => ({
              id: m.id || m._id,
              senderId: m.senderId || m.sender,
              receiverId: m.receiverId || m.receiver,
              content: m.content,
              timestamp: new Date(m.timestamp || m.createdAt),
              read: m.read,
              type: m.type
            } as ChatMessage));
            setMessages(mapped);
          } catch (e) {
            console.error('Failed to refresh messages for active conversation', e);
          }
        }
      } catch (err) {
        console.error('Failed to poll conversations', err);
      }
    };

    // Initial load
    loadConversations();
    const convInterval = window.setInterval(loadConversations, 5000);

    return () => {
      mounted = false;
      clearInterval(convInterval);
    };
  }, [user, activeConversation]);

  // Poll messages for active conversation (keeps chat in sync)
  useEffect(() => {
    if (!activeConversation) return;

    let mounted = true;
    const loadMessages = async () => {
      try {
        const msgs = await messageService.getMessagesForConversation(activeConversation.id);
        if (!mounted) return;
        const mapped = msgs.map((m: any) => ({
          id: m.id || m._id,
          senderId: m.senderId || m.sender,
          receiverId: m.receiverId || m.receiver,
          content: m.content,
          timestamp: new Date(m.timestamp || m.createdAt),
          read: m.read,
          type: m.type
        } as ChatMessage));
        setMessages(mapped);
        // mark as read on server
        await messageService.markAsRead(activeConversation.id);
        setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c));
      } catch (err) {
        console.error('Failed to poll messages', err);
      }
    };

    loadMessages();
    const msgInterval = window.setInterval(loadMessages, 2000);
    return () => {
      mounted = false;
      clearInterval(msgInterval);
    };
  }, [activeConversation]);

  const sendMessage = async (receiverId: string, content: string, type: ChatMessage['type'] = 'text', _file?: File) => {
    if (!user) return;
    // Basic validation: receiverId should be a Mongo ObjectId
    const oidRegex = /^[0-9a-fA-F]{24}$/;
    if (!oidRegex.test(String(receiverId))) {
      alert('ID destinataire invalide. Veuillez sélectionner un utilisateur valide.');
      return;
    }

    try {
      const resp = await messageService.sendMessage({ receiverId, content, type });
      const newMessage: ChatMessage = {
        id: resp._id,
        senderId: resp.sender._id || resp.sender.id || resp.sender,
        receiverId: resp.receiver._id || resp.receiver.id || resp.receiver,
        content: resp.content,
        timestamp: new Date(resp.createdAt || resp.createdAt),
        read: resp.read || false,
        type: resp.type || 'text',
        fileUrl: resp.fileUrl,
        fileName: resp.fileName
      };

      const conversationId = `conv_${[user.id, receiverId].sort().join('_')}`;

      // Update local conversations and messages immediately
      setConversations(prev => {
        const existing = prev.find(c => c.id === conversationId);
        if (existing) {
          return prev.map(c => c.id === conversationId ? { ...c, lastMessage: newMessage } : c);
        }
        return [...prev, { id: conversationId, participantIds: [user.id, receiverId], lastMessage: newMessage, unreadCount: 0, createdAt: new Date() }];
      });

      if (activeConversation?.id === conversationId) {
        setMessages(prev => [...prev, newMessage]);
        // mark as read on server for this conversation (sender marks messages sent)
        await messageService.markAsRead(conversationId);
      }

      // Refresh conversations from server to get canonical state (counts, timestamps)
      try {
        const convs = await messageService.getConversations();
        setConversations(convs);
        if (activeConversation?.id === conversationId) {
          const msgs = await messageService.getMessagesForConversation(conversationId);
          const mapped = msgs.map((m: any) => ({
            id: m.id || m._id,
            senderId: m.senderId || m.sender,
            receiverId: m.receiverId || m.receiver,
            content: m.content,
            timestamp: new Date(m.timestamp || m.createdAt),
            read: m.read,
            type: m.type
          } as ChatMessage));
          setMessages(mapped);
        }
      } catch (e) {
        console.warn('Failed to refresh after send', e);
      }
    } catch (err: any) {
      console.error('Failed to send message', err?.response?.data || err);
    }
  };

  const startConversation = async (userId: string) => {
    if (!user) return;
    const conversationId = `conv_${[user.id, userId].sort().join('_')}`;

    const existingConv = conversations.find(c => c.id === conversationId);
    if (existingConv) {
      setActiveConversation(existingConv);
    } else {
      const newConv: ChatConversation = {
        id: conversationId,
        participantIds: [user.id, userId],
        lastMessage: null,
        unreadCount: 0,
        createdAt: new Date()
      };
      setConversations(prev => [...prev, newConv]);
      setActiveConversation(newConv);
    }

    try {
      const msgs = await messageService.getMessagesForConversation(conversationId);
      // map to ChatMessage if necessary
      const mapped = msgs.map((m: any) => ({
        id: m.id || m._id,
        senderId: m.senderId || m.sender,
        receiverId: m.receiverId || m.receiver,
        content: m.content,
        timestamp: new Date(m.timestamp || m.createdAt),
        read: m.read,
        type: m.type
      } as ChatMessage));
      setMessages(mapped);
      await messageService.markAsRead(conversationId);
      // update unread count locally
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c));
    } catch (err) {
      console.error('Failed to load messages for conversation', err);
      setMessages([]);
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
      setMessages([]);
    }
  };

  const value: ChatContextType = {
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    sendMessage,
    startConversation,
    markAsRead,
    deleteConversation,
    isTyping,
    setIsTyping,
    widgetOpen,
    openWidget,
    closeWidget,
    toggleWidget
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};