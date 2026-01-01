export type AssignmentStatus = 'pending' | 'accepted' | 'refused' | 'delegated' | 'cancelled';

export interface Assignment {
  id: string;
  taskId: string;
  userId: string;
  mode?: 'manuel' | 'semi-auto' | 'ia';
  status: AssignmentStatus;
  justificatifRefus?: string;
  dateAffectation?: string;
  rapportAlgorithme?: string;
  delegueA?: string;
  createdAt?: string;
  updatedAt?: string;
}
