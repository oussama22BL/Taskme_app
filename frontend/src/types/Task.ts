export type TaskStatus = 'ouverte' | 'en_cours' | 'clôturée' | 'affectée';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type?: string;
  dateDebut?: string;
  dateFin?: string;
  isRemuneree?: boolean;
  isCommune?: boolean;
  specialitesConcernees?: string[];
  gradesConcernes?: string[];
  besoinVehicule?: boolean;
  direction?: string;
  assignedTo?: string;
  fichierJoint?: string;
  nombrePlaces?: number;
  status: TaskStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
