// NotificationContext.tsx - Gestion centralisée des notifications
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'assignment' | 'delegation' | 'modification';
  read: boolean;
  createdAt: Date;
  link?: string;
  userId?: string;
  metadata?: {
    taskId?: string;
    vehicleId?: string;
    fromUserId?: string;
    toUserId?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getNotificationsByUser: (userId: string) => Notification[];
  sendAssignmentNotification: (taskId: string, userId: string, fromUserId?: string) => void;
  sendDelegationNotification: (taskId: string, fromUserId: string, toUserId: string) => void;
  sendModificationNotification: (entityType: 'task' | 'vehicle', entityId: string, userId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved).map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt)
    })) : [];
  });

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Si le navigateur supporte les notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico'
      });
    }

    // Simuler l'envoi d'email (dans une application réelle, vous appelleriez une API)
    if (newNotification.type === 'assignment' || newNotification.type === 'delegation') {
      console.log(`Email sent for notification: ${newNotification.title}`);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  };

  const getNotificationsByUser = (userId: string) => {
    return notifications.filter(n => n.userId === userId);
  };

  // Fonctions spécifiques pour les types de notifications
  const sendAssignmentNotification = (taskId: string, userId: string, fromUserId?: string) => {
    addNotification({
      title: 'Nouvelle tâche affectée',
      message: 'Une nouvelle tâche vous a été affectée. Veuillez y répondre dans les 24h.',
      type: 'assignment',
      userId,
      link: `/tasks`,
      metadata: { taskId, fromUserId }
    });
  };

  const sendDelegationNotification = (taskId: string, fromUserId: string, toUserId: string) => {
    addNotification({
      title: 'Tâche déléguée',
      message: 'Une tâche vous a été déléguée par un collègue.',
      type: 'delegation',
      userId: toUserId,
      link: `/tasks`,
      metadata: { taskId, fromUserId, toUserId }
    });
  };

  const sendModificationNotification = (entityType: 'task' | 'vehicle', entityId: string, userId: string) => {
    const entityName = entityType === 'task' ? 'tâche' : 'véhicule';
    addNotification({
      title: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} modifié(e)`,
      message: `Une ${entityName} a été modifiée.`,
      type: 'modification',
      userId,
      metadata: { [`${entityType}Id`]: entityId }
    });
  };

  // Demander la permission pour les notifications push
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Simuler les notifications temps réel avec un intervalle
  useEffect(() => {
    const interval = setInterval(() => {
      // Dans une application réelle, vous récupéreriez les nouvelles notifications depuis une API
      // Pour l'exemple, nous n'ajoutons rien automatiquement
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        getNotificationsByType,
        getNotificationsByUser,
        sendAssignmentNotification,
        sendDelegationNotification,
        sendModificationNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};