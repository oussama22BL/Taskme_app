// AppProviders.tsx - Regroupement de tous les providers
import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { TaskProvider } from './TaskContext';
import { NotificationProvider } from './NotificationContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composant qui regroupe tous les providers de l'application
 * Simplifie l'imbrication des providers dans App.tsx
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <TaskProvider>
          {children}
        </TaskProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

// Exporter les hooks pour une utilisation facile
export { useAuth } from './AuthContext';
export { useTasks } from './TaskContext';
export { useNotifications } from './NotificationContext';