import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Notification } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('new_notification', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      // Optionnel : Ajouter un son ou un toast ici
    });

    return () => { socket.disconnect(); };
  }, []);

  return { notifications };
};