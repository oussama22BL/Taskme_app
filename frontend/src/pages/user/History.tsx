import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, User, Car, FileText } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import type { Assignment } from '../../types';

const History: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statut: '',
    dateDebut: '',
    dateFin: '',
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [filters, assignments]);

  const fetchHistory = async () => {
    try {
      // Un auditeur ne voit que SON historique via ses missions
      const response = await axiosInstance.get('/assignments/my');
      // On ne garde que celles qui ne sont plus 'en_attente' pour l'historique
      const pastMissions = response.data.filter((a: any) => a.statut !== 'en_attente');
      setAssignments(pastMissions);
      setFilteredAssignments(pastMissions);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filterAssignments = () => {
    let filtered = [...assignments];

    if (filters.statut) {
      filtered = filtered.filter(a => a.statut === filters.statut);
    }

    if (filters.dateDebut) {
      const startDate = new Date(filters.dateDebut);
      filtered = filtered.filter(a => new Date(a.createdAt) >= startDate);
    }

    if (filters.dateFin) {
      const endDate = new Date(filters.dateFin);
      filtered = filtered.filter(a => new Date(a.createdAt) <= endDate);
    }

    setFilteredAssignments(filtered);
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'acceptée': return 'bg-green-100 text-green-800';
      case 'refusée': return 'bg-red-100 text-red-800';
      case 'en_attente': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'ia': return '🤖';
      case 'semi-auto': return '⚙️';
      case 'manuel': return '👤';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Historique</h1>
          <p className="text-slate-600">Traçabilité des actions et affectations</p>
        </div>
        <button
          onClick={() => {
            // Export functionality
            const csv = assignments.map(a => ({
              Mission: a.taskId.titre,
              Auditeur: `${a.userId.prenom} ${a.userId.nom}`,
              Statut: a.statut,
              Mode: a.mode,
              Date: new Date(a.createdAt).toLocaleDateString(),
            }));
            console.log('Export CSV:', csv);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
        >
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">Tous les statuts</option>
              <option value="acceptée">Acceptée</option>
              <option value="refusée">Refusée</option>
              <option value="en_attente">En attente</option>
            </select>
            <input
              type="date"
              placeholder="Date début"
              value={filters.dateDebut}
              onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            />
            <input
              type="date"
              placeholder="Date fin"
              value={filters.dateFin}
              onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            />
            <button
              onClick={() => setFilters({ statut: '', dateDebut: '', dateFin: '' })}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste historique */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun historique</h3>
            <p className="text-slate-600">Aucune activité enregistrée pour le moment.</p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <div key={assignment._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {assignment.taskId.titre}
                      </h3>
                      <p className="text-sm text-slate-600">{assignment.taskId.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Auditeur:</span>
                      {assignment.userId.prenom} {assignment.userId.nom}
                    </div>
                    
                    {assignment.vehicleId && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Car className="w-4 h-4" />
                        <span className="font-medium">Véhicule:</span>
                        {assignment.vehicleId.modele} ({assignment.vehicleId.immatriculation})
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Date:</span>
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(assignment.statut)}`}>
                    {assignment.statut.charAt(0).toUpperCase() + assignment.statut.slice(1)}
                  </span>
                  <span className="text-sm text-slate-600">
                    {getModeIcon(assignment.mode)} {assignment.mode}
                  </span>
                </div>
              </div>
              
              {assignment.justificatifRefus && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Justificatif de refus:</p>
                  <p className="text-sm text-red-700">{assignment.justificatifRefus}</p>
                </div>
              )}
              
              {assignment.rapportAlgorithme && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Rapport d'algorithme:</p>
                  <p className="text-sm text-blue-700">{assignment.rapportAlgorithme}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;