import api from "./api";
import type { Task as TaskType, Assignment as AssignmentType } from "@/types";
import { mapMongoArray, mapMongoId } from "@/utils/mapper";

export const taskService = {
  // Tâches
  getAllTasks: async (): Promise<TaskType[]> => {
    const response = await api.get<TaskType[]>("/tasks");
    return mapMongoArray(response.data) as unknown as TaskType[];
  },

  getTaskById: async (id: string): Promise<TaskType> => {
    const response = await api.get<TaskType>(`/tasks/${id}`);
    return mapMongoId(response.data) as unknown as TaskType;
  },

  createTask: async (taskData: Omit<TaskType, "id">): Promise<TaskType> => {
    const response = await api.post<TaskType>("/tasks", taskData);
    return mapMongoId(response.data) as unknown as TaskType;
  },

  updateTask: async (id: string, taskData: Partial<TaskType>): Promise<TaskType> => {
    const response = await api.put<TaskType>(`/tasks/${id}`, taskData);
    return mapMongoId(response.data) as unknown as TaskType;
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Affectations
  assignTask: async (assignmentData: Omit<AssignmentType, "id">): Promise<AssignmentType> => {
    const response = await api.post<AssignmentType>("/assignments", assignmentData);
    return mapMongoId(response.data) as unknown as AssignmentType;
  },

  getUserAssignments: async (userId: string): Promise<AssignmentType[]> => {
    const response = await api.get<AssignmentType[]>(`/assignments/user/${userId}`);
    return mapMongoArray(response.data) as unknown as AssignmentType[];
  },

  respondToAssignment: async (assignmentId: string, response: "accept" | "refuse" | "delegate", data?: any): Promise<AssignmentType> => {
    const apiResponse = await api.post<AssignmentType>(`/assignments/${assignmentId}/respond`, { response, data });
    return mapMongoId(apiResponse.data) as unknown as AssignmentType;
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
