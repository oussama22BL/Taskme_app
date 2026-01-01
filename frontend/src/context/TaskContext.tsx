import { createContext, useState, useContext, ReactNode } from "react";
import type { Task } from "@/types";

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
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
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Formation React Avancé",
      description: "Formation sur les concepts avancés de React",
      type: "Formateur",
      dateDebut: "2024-01-15",
      dateFin: "2024-01-20",
      isRemuneree: true,
      status: "ouverte",
    },
    {
      id: "2",
      title: "Audit pédagogique",
      description: "Audit des méthodes pédagogiques",
      type: "Observateur",
      dateDebut: "2024-01-25",
      dateFin: "2024-01-30",
      isRemuneree: false,
      status: "affectée",
    },
  ]);
  // setter unused for now
  const [loading] = useState(false);

  const addTask = (taskData: Omit<Task, "id">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, loading }}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;
