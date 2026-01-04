import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { taskService } from "../services/taskService";

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  isRemuneree: boolean;
  // Compatibilité ascendante / propriétés d'affectation
  remuneree?: boolean;
  affecteA?: string;
  dateAffectation?: string;
  modeAffectation?: string;
  justificationAffectation?: string;
  isCommune?: boolean;
  specialitesConcernees?: string[];
  gradesConcernes?: string[];
  besoinVehicule?: boolean;
  direction?: string;
  fichierJoint?: string;
  nombrePlaces?: number;
  status: "ouverte" | "en_cours" | "clôturée" | "affectée" | "acceptée" | "refusée" | "déléguée";
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Charger les tâches depuis l'API au montage
  useEffect(() => {
    let mounted = true;
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const apiTasks = await taskService.getAllTasks();
        if (mounted) setTasks(apiTasks.map(t => ({ ...t, id: t.id! })) as Task[]);
      } catch (err) {
        console.error("Erreur lors du chargement des tâches:", err);
        // fallback: garder la liste vide
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTasks();
    return () => { mounted = false; };
  }, []);

  const addTask = async (taskData: Omit<Task, "id">) => {
    setLoading(true);
    try {
      const created = await taskService.createTask(taskData as any);
      setTasks(prev => [...prev, created as Task]);
    } catch (err) {
      console.error("Erreur lors de la création de la tâche:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setLoading(true);
    try {
      const updated = await taskService.updateTask(id, updates as any);
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la tâche:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    return updateTask(id, { status });
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression de la tâche:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, updateTaskStatus, deleteTask, loading }}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;
