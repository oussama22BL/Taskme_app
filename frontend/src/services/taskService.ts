import api from "./api";

export interface Task {
  id?: string;
  title: string;
  description: string;
  type: "Formateur" | "Jury" | "Bénéficiaire" | "Observateur" | "Concepteur";
  dateDebut: string;
  dateFin: string;
  isRemuneree: boolean;
  isCommune: boolean;
  specialitesConcernees: string[];
  gradesConcernes: string[];
  besoinVehicule: boolean;
  direction?: string;
  fichierJoint?: string;
  nombrePlaces: number;
  status: "ouverte" | "en_cours" | "clôturée";
}

export interface Assignment {
  id?: string;
  taskId: string;
  userId: string;
  mode: "manuel" | "semi-auto" | "ia";
  status: "en_attente" | "acceptée" | "refusée" | "déléguée";
  justificatifRefus?: string;
  dateAffectation: string;
  rapportAlgorithme?: string;
  delegueA?: string;
}

export const taskService = {
  // Tâches
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>("/tasks");
    return response.data;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData: Omit<Task, "id">): Promise<Task> => {
    const response = await api.post<Task>("/tasks", taskData);
    return response.data;
  },

  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Affectations
  assignTask: async (assignmentData: Omit<Assignment, "id">): Promise<Assignment> => {
    const response = await api.post<Assignment>("/assignments", assignmentData);
    return response.data;
  },

  getUserAssignments: async (userId: string): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>(`/assignments/user/${userId}`);
    return response.data;
  },

  respondToAssignment: async (assignmentId: string, response: "accept" | "refuse" | "delegate", data?: any): Promise<Assignment> => {
    const apiResponse = await api.post<Assignment>(`/assignments/${assignmentId}/respond`, { response, data });
    return apiResponse.data;
  },

  // Algorithmes d'affectation
  getSemiAutoAssignment: async (taskId: string): Promise<{ users: any[]; rapport: string }> => {
    const response = await api.post(`/assignments/semi-auto/${taskId}`);
    return response.data;
  },

  getAutoAssignment: async (taskId: string): Promise<{ users: any[]; rapport: string }> => {
    const response = await api.post(`/assignments/auto/${taskId}`);
    return response.data;
  },

  // Véhicules
  getAvailableVehicles: async (direction?: string): Promise<any[]> => {
    const url = direction ? `/vehicles/available?direction=${direction}` : "/vehicles/available";
    const response = await api.get(url);
    return response.data;
  },

  assignVehicle: async (vehicleId: string, assignmentId: string): Promise<any> => {
    const response = await api.post(`/vehicles/${vehicleId}/assign`, { assignmentId });
    return response.data;
  },
};

export default taskService;
