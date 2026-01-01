export type UserRole = 'user' | 'admin' | 'superAdmin';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  specialite?: string;
  grade?: string;
  diplomas?: string[];
  formations?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
