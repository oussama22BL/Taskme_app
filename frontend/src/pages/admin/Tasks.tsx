import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import TaskForm from '../../components/tasks/TaskForm';
import TaskList from '../../components/tasks/TaskList';
import AssignmentModal from '../../components/tasks/AssignmentModal';
import axiosInstance from '../../api/axiosConfig';
import type { Task, User, Vehicle } from '../../types';

const AdminTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [auditors, setAuditors] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // CORRECTION : Charger TOUTES les données nécessaires
  const fetchData = async () => {
    setLoading(true);
    try {
      // On lance les 3 requêtes en parallèle pour gagner du temps
      const [tasksRes, usersRes, vehiclesRes] = await Promise.all([
        axiosInstance.get('/tasks'),
        axiosInstance.get('/users?role=user'),
        axiosInstance.get('/vehicles?disponibilite=true') // On ne prend que les véhicules libres
      ]);

      setTasks(tasksRes.data);
      setAuditors(usersRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
      alert("Impossible de charger les données. Vérifiez que le backend est lancé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Gestion de la suppression
  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette mission ?')) {
      try {
        await axiosInstance.delete(`/tasks/${id}`);
        // Mise à jour locale pour éviter un rechargement complet
        setTasks(prev => prev.filter(t => t._id !== id));
      } catch (err) {
        console.error("Erreur suppression :", err);
        alert("Erreur lors de la suppression de la tâche.");
      }
    }
  };

  // Gestion de l'ouverture pour modification
  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  // Gestion de l'ouverture pour affectation
  const handleOpenAssign = (task: Task) => {
    setSelectedTask(task);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Missions d'Audit</h1>
          <p className="text-slate-500">Planification et affectation des contrôles</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData} 
            className="p-3 text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => { setSelectedTask(null); setIsTaskFormOpen(true); }}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus size={20}/> Créer une mission
          </button>
        </div>
      </div>

      <TaskList 
        tasks={tasks}
        loading={loading}
        onAssign={handleOpenAssign}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteTask}
      />

      {/* Formulaire : Création OU Modification */}
      {isTaskFormOpen && (
        <TaskForm 
          task={selectedTask || undefined} 
          onClose={() => {
            setIsTaskFormOpen(false);
            setSelectedTask(null);
          }} 
          onSuccess={() => {
            fetchData();
            setIsTaskFormOpen(false);
          }} 
        />
      )}

      {/* Modale d'Affectation : IA / Semi-auto / Manuel */}
      {isAssignModalOpen && selectedTask && (
        <AssignmentModal 
          task={selectedTask}
          auditors={auditors}
          vehicles={vehicles}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            fetchData();
            setIsAssignModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminTasks;