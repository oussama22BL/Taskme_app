import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Car, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import type { Assignment } from '../../types';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    refused: 0,
    withVehicle: 0,
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axiosInstance.get('/assignments/my');
      setAssignments(response.data);
      
      // Calculer les statistiques
      const total = response.data.length;
      const pending = response.data.filter((a: Assignment) => a.statut === 'en_attente').length;
      const accepted = response.data.filter((a: Assignment) => a.statut === 'acceptée').length;
      const refused = response.data.filter((a: Assignment) => a.statut === 'refusée').length;
      const withVehicle = response.data.filter((a: Assignment) => a.vehicleId).length;
      
      setStats({ total, pending, accepted, refused, withVehicle });
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingAssignments = assignments.filter(a => a.statut === 'en_attente');
  const upcomingAssignments = assignments
    .filter(a => a.statut === 'acceptée' && new Date(a.taskId.dateDebut) > new Date())
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour, {user?.prenom} {user?.nom} 👋
            </h1>
            <p className="mt-2 opacity-90">
              {user?.grade} - {user?.specialite}
            </p>
            <p className="mt-4 text-sm opacity-80">
              Vous avez {stats.pending} mission(s) en attente de réponse
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total missions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">En attente</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Acceptées</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Refusées</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.refused}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avec véhicule</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.withVehicle}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missions en attente */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Missions en attente de réponse
            </h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
              {pendingAssignments.length}
            </span>
          </div>
          
          {pendingAssignments.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
              <p className="text-slate-600">Aucune mission en attente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAssignments.map((assignment) => (
                <div key={assignment._id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-900">
                      {assignment.taskId.titre}
                    </h3>
                    <span className="text-sm text-slate-500">
                      {new Date(assignment.taskId.dateDebut).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    {assignment.taskId.type} • {assignment.taskId.direction}
                  </p>
                  {assignment.taskId.besoinVehicule && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                      <Car className="w-4 h-4" />
                      <span>Véhicule requis</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                      Accepter
                    </button>
                    <button className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm">
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prochaines missions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Prochaines missions
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {upcomingAssignments.length}
            </span>
          </div>
          
          {upcomingAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <p className="text-slate-600">Aucune mission à venir</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment._id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 mb-1">
                        {assignment.taskId.titre}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {assignment.taskId.type}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(assignment.taskId.dateDebut).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {assignment.taskId.direction}
                        </div>
                      </div>
                    </div>
                    {assignment.vehicleId && (
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          <Car className="w-3 h-3" />
                          Véhicule attribué
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;