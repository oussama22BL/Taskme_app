export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'user' | 'superAdmin';
  specialite: string;
  grade: string;
  diplomes?: string[];
  formations?: string[];
  createdAt?: Date;
}

export interface Task {
  _id: string;
  titre: string;
  type: string;
  dateDebut: Date;
  dateFin: Date;
  besoinVehicule: boolean;
  direction: string;
  fichierJoint?: string;
  createdBy?: string;
  createdAt?: Date;
  specialitesConcernees: string[];
  gradesConcernes: string[];
  statut: 'ouverte' | 'fermée';
}

export interface Vehicle {
  _id: string;
  modele: string;
  immatriculation: string;
  disponibilite: boolean;
  typeAttribution: 'individuelle' | 'partagée';
  directionActuelle: string;
  createdAt?: Date;
}

export interface Assignment {
  _id: string;
  taskId: Task;
  userId: User;
  vehicleId?: Vehicle;
  mode: 'manuel' | 'semi-auto' | 'ia';
  statut: 'en_attente' | 'acceptée' | 'refusée';
  rapportAlgorithme?: string;
  justificatifRefus?: string;
  createdAt: Date;
}

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  type: 'assignment' | 'system' | 'alert';
  read: boolean;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  nom: string;
  prenom: string;
  specialite: string;
  grade: string;
}