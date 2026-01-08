import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      // ON UTILISE LES MÊMES CLÉS PARTOUT
      const savedToken = localStorage.getItem('taskme_token');
      const savedUser = localStorage.getItem('taskme_user');
      
      if (savedToken && savedUser && savedUser !== "undefined") {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Erreur de lecture du stockage", error);
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    if (!newToken || !userData) return;

    setToken(newToken);
    setUser(userData);

    localStorage.setItem('taskme_token', newToken);
    localStorage.setItem('taskme_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('taskme_token');
    localStorage.removeItem('taskme_user');
  };

  // On vérifie les deux pour confirmer l'auth
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};