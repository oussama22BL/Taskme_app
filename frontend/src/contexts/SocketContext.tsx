import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  notifications: any[];
  sendNotification: (notification: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (token && !socket) {
      const newSocket = io('http://localhost:5000', {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('notification', (data) => {
        setNotifications((prev) => [data, ...prev.slice(0, 9)]);
      });

      newSocket.on('assignment_update', (data) => {
        console.log('Assignment update:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token]);

  const sendNotification = (notification: any) => {
    if (socket) {
      socket.emit('notification', notification);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, sendNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};