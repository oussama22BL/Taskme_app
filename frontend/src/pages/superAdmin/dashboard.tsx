import React, { useState, useEffect } from 'react';
import { Users, Car, FileCheck, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import type { Task, Assignment } from '../../types';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingAssignments: 0,
    activeAuditors: 0,
    availableVehicles: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tasksRes, assignmentsRes, auditorsRes, vehiclesRes] = await Promise.all([
          axiosInstance.get('/tasks'),
          axiosInstance.get('/assignments?statut=en_attente'),
          axiosInstance.get('/users?role=user'),
          axiosInstance.get('/vehicles?disponibilite=true'),
        ]);

        setStats({
          totalTasks: tasksRes.data.length,
          pendingAssignments: assignmentsRes.data.length,
          activeAuditors: auditorsRes.data.length,
          availableVehicles: vehiclesRes.data.length,
        });

        setRecentTasks(tasksRes.data.slice(0, 5));
        setPendingAssignments(assignmentsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tableau de Bord</h1>
          <p className="text-slate-500 mt-1">Résumé des opérations de contrôle</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Missions Totales', value: stats.totalTasks, icon: FileCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En attente d\'affectation', value: stats.pendingAssignments, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Auditeurs disponibles', value: stats.activeAuditors, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Flotte disponible', value: stats.availableVehicles, icon: Car, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`${stat.bg} p-4 rounded-2xl`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Missions Récentes */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Dernières Missions</h2>
            <button onClick={() => navigate('/admin/tasks')} className="text-indigo-600 text-sm font-bold flex items-center gap-1">Voir tout <ArrowRight size={14}/></button>
          </div>
          <div className="space-y-4">
            {recentTasks.map(task => (
              <div key={task._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{task.titre}</p>
                  <p className="text-xs text-slate-500">{task.direction} • {new Date(task.dateDebut).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${task.statut === 'ouverte' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {task.statut.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Affectations en attente */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Réponses attendues</h2>
          {pendingAssignments.length > 0 ? (
            <div className="space-y-4">
              {pendingAssignments.map(ass => (
                <div key={ass._id} className="p-4 border border-slate-100 rounded-2xl hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-indigo-900 text-sm">{ass.taskId?.titre}</p>
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">En attente</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users size={12}/> <span>Auditeur: {ass.userId?.nom} {ass.userId?.prenom}</span>
                    <span className="mx-1">•</span>
                    <span>Mode: {ass.mode}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <AlertCircle size={40} className="mb-2 opacity-20"/>
              <p className="text-sm">Aucune réponse en attente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;