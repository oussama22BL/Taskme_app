import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

// Données mockées
const MOCK_USERS: ChatUser[] = [
  { id: '1', name: 'Admin Super', role: 'superAdmin', avatar: '👑', isOnline: true },
  { id: '2', name: 'Sophie Martin', role: 'admin', avatar: '👩‍💼', isOnline: true },
  { id: '3', name: 'Jean Dupont', role: 'user', avatar: '👨‍🏫', isOnline: true },
  { id: '4', name: 'Marie Curie', role: 'user', avatar: '👩‍🔬', isOnline: false },
  { id: '5', name: 'Pierre Durand', role: 'user', avatar: '👨‍💻', isOnline: true },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: '3',
    content: 'Bonjour Jean, pouvez-vous prendre en charge la formation React ?',
    timestamp: new Date('2024-01-15T10:30:00'),
    read: true,
    type: 'text'
  },
  {
    id: '2',
    senderId: '3',
    receiverId: '1',
    content: 'Bonjour, oui je suis disponible. Quelle est la date prévue ?',
    timestamp: new Date('2024-01-15T10:32:00'),
    read: true,
    type: 'text'
  },
  {
    id: '3',
    senderId: '2',
    receiverId: '3',
    content: 'Le document de formation est prêt.',
    timestamp: new Date('2024-01-15T14:20:00'),
    read: false,
    type: 'text'
  }
];

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([
    {
      id: 'conv1',
      participantIds: ['1', '3'],
      lastMessage: MOCK_MESSAGES[0],
      unreadCount: 0,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'conv2',
      participantIds: ['2', '3'],
      lastMessage: MOCK_MESSAGES[2],
      unreadCount: 1,
      createdAt: new Date('2024-01-15')
    }
  ]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>(MOCK_USERS);
  const [isTyping, setIsTyping] = useState(false);

  // WebSocket simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simuler des changements de statut en ligne
      setOnlineUsers(prev => prev.map(u => ({
        ...u,
        isOnline: Math.random() > 0.3
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = (receiverId: string, content: string, type: ChatMessage['type'] = 'text', file?: File) => {                                                                                                                                               
    // `file` may be supported later; mark it as intentionally unused for now
    void file;
    if (!user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId,
      content,
      timestamp: new Date(),
      read: false,
      type
    };

    // Ajouter le message aux conversations
    const conversationId = `conv_${[user.id, receiverId].sort().join('_')}`;
    
    setConversations(prev => {
      const existingConv = prev.find(c => c.id === conversationId);
      if (existingConv) {
        return prev.map(c => 
          c.id === conversationId 
            ? { ...c, lastMessage: newMessage, unreadCount: c.unreadCount + 1 }
            : c
        );
      } else {
        return [...prev, {
          id: conversationId,
          participantIds: [user.id, receiverId],
          lastMessage: newMessage,
          unreadCount: 1,
          createdAt: new Date()
        }];
      }
    });

    // Ajouter au messages actifs
    if (activeConversation?.participantIds.includes(receiverId)) {
      setMessages(prev => [...prev, newMessage]);
    }

    // Simuler une réponse
    setTimeout(() => {
      const responses = [
        "Merci pour l'information",
        "Je vais vérifier cela",
        "Parfait, je prends en charge",
        "Pouvez-vous me donner plus de détails ?"
      ];
      
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: receiverId,
        receiverId: user.id,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(Date.now() + 1000),
        read: false,
        type: 'text'
      };

      setMessages(prev => [...prev, responseMessage]);
      
      // Mettre à jour la conversation
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId 
            ? { ...c, lastMessage: responseMessage, unreadCount: c.unreadCount + 1 }
            : c
        )
      );
    }, 2000);
  };

  const startConversation = (userId: string) => {
    const conversationId = `conv_${[user?.id, userId].sort().join('_')}`;
    const existingConv = conversations.find(c => c.id === conversationId);
    
    if (existingConv) {
      setActiveConversation(existingConv);
      // Charger les messages de cette conversation
      const convMessages = MOCK_MESSAGES.filter(m => 
        (m.senderId === user?.id && m.receiverId === userId) ||
        (m.senderId === userId && m.receiverId === user?.id)
      );
      setMessages(convMessages);
      markAsRead(conversationId);
    } else {
      const newConv: ChatConversation = {
        id: conversationId,
        participantIds: [user?.id || '', userId],
        lastMessage: null,
        unreadCount: 0,
        createdAt: new Date()
      };
      setConversations(prev => [...prev, newConv]);
      setActiveConversation(newConv);
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
    setIsTyping
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