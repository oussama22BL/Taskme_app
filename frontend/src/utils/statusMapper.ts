import { ASSIGNMENT_STATUS } from './constants';

const BACKEND_TO_UI: Record<string, string> = {
  pending: ASSIGNMENT_STATUS.EN_ATTENTE,
  accepted: ASSIGNMENT_STATUS.ACCEPTEE,
  refused: ASSIGNMENT_STATUS.REFUSEE,
  delegated: ASSIGNMENT_STATUS.DELEGUEE,
  cancelled: 'annulée'
};

const UI_TO_BACKEND: Record<string, string> = {
  [ASSIGNMENT_STATUS.EN_ATTENTE]: 'pending',
  [ASSIGNMENT_STATUS.ACCEPTEE]: 'accepted',
  [ASSIGNMENT_STATUS.REFUSEE]: 'refused',
  [ASSIGNMENT_STATUS.DELEGUEE]: 'delegated'
};

export const mapAssignmentStatusFromBackend = (status?: string) => {
  if (!status) return status;
  return BACKEND_TO_UI[status] || status;
};

export const mapAssignmentStatusToBackend = (status?: string) => {
  if (!status) return status;
  return UI_TO_BACKEND[status] || status;
};
