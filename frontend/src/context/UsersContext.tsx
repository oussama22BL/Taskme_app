import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface AppUser {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  role?: 'user' | 'admin' | 'superAdmin';
  grade?: string;
  specialite?: string;
  acceptanceRate?: number;
}

type UsersContextType = {
  users: AppUser[];
  addUser: (u: AppUser) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('mock_users');
    if (stored) {
      setUsers(JSON.parse(stored));
      return;
    }

    const initial: AppUser[] = [
      { id: 'u1', prenom: 'Fatima', nom: 'Zahra', grade: 'A', specialite: 'pédagogique', acceptanceRate: 92 },
      { id: 'u2', prenom: 'Karim', nom: 'Ben', grade: 'B', specialite: 'orientation', acceptanceRate: 78 },
      { id: 'u3', prenom: 'Leila', nom: 'Mansouri', grade: 'A', specialite: 'planification', acceptanceRate: 85 },
      { id: 'u4', prenom: 'Ahmed', nom: 'Ali', grade: 'C', specialite: 'financier', acceptanceRate: 60 },
    ];
    setUsers(initial);
    localStorage.setItem('mock_users', JSON.stringify(initial));
  }, []);

  useEffect(() => { localStorage.setItem('mock_users', JSON.stringify(users)); }, [users]);

  const addUser = (u: AppUser) => setUsers(prev => [...prev, u]);
  const updateUser = (id: string, updates: Partial<AppUser>) => setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used within UsersProvider');
  return ctx;
};

export default UsersContext;
