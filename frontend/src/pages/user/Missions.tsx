import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Car, Calendar, Clock, FileText, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import type { Assignment } from '../../types';

const UserMissions: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [refuseJustification, setRefuseJustification] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAndSortAssignments();
  }, [assignments, activeFilter, sortBy]);

  const fetchAssignments = async () => {
    try {
      const response = await axiosInstance.get('/assignments/my');
      setAssignments(response.data);
      setFilteredAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAssignments = () => {
    let filtered = [...assignments];

    // Appliquer le filtre
    switch (activeFilter) {
      case 'pending':
        filtered = filtered.filter(a => a.statut === 'en_attente');
        break;
      case 'accepted':
        filtered = filtered.filter(a => a.statut === 'acceptée');
        break;
      case 'refused':
        filtered = filtered.filter(a => a.statut === 'refusée');
        break;
      case 'withVehicle':
        filtered = filtered.filter(a => a.vehicleId);
        break;
      default:
        break;
    }

    // Appliquer le tri
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'priority') {
        // Logique de priorité (date de début proche)
        return new Date(a.taskId.dateDebut).getTime() - new Date(b.taskId.dateDebut).getTime();
      }
      return 0;
    });

    setFilteredAssignments(filtered);
  };

  const handleAccept = async (assignmentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir accepter cette mission ?')) {
      try {
        // CORRECTION : Utiliser la route unifiée /respond avec le statut dans le body
        await axiosInstance.put(`/assignments/${assignmentId}/respond`, {
          statut: 'acceptée'
        });
        
        // Rafraîchir la liste et les stats
        fetchAssignments();
        alert("Mission acceptée avec succès !");
      } catch (error: any) {
        console.error('Error accepting assignment:', error);
        alert(error.response?.data?.message || "Erreur lors de l'acceptation.");
      }
    }
  };

  const handleRefuse = async () => {
    if (!refuseJustification.trim()) {
      alert('Veuillez fournir une justification pour le refus.');
      return;
    }

    try {
      // CORRECTION : Utiliser la route unifiée /respond avec statut 'refusée'
      await axiosInstance.put(`/assignments/${selectedAssignment?._id}/respond`, {
        statut: 'refusée',
        justificatifRefus: refuseJustification,
      });

      setShowRefuseModal(false);
      setRefuseJustification('');
      setSelectedAssignment(null);
      
      // Rafraîchir la liste
      fetchAssignments();
      alert("Mission refusée.");
    } catch (error: any) {
      console.error('Error refusing assignment:', error);
      alert(error.response?.data?.message || "Erreur lors du refus.");
    }
  };
  
  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'acceptée':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            <CheckCircle className="w-4 h-4" />
            Acceptée
          </span>
        );
      case 'refusée':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
            <XCircle className="w-4 h-4" />
            Refusée
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
            <AlertCircle className="w-4 h-4" />
            En attente
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mes Missions</h1>
          <p className="text-slate-600">
            Consultez et gérez vos missions d'audit
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">
            {assignments.length} mission(s) au total
          </span>
        </div>
      </div>

      {/* Filtres et tris */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">Filtrer par :</span>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'pending', label: 'En attente' },
                { id: 'accepted', label: 'Acceptées' },
                { id: 'refused', label: 'Refusées' },
                { id: 'withVehicle', label: 'Avec véhicule' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    activeFilter === filter.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-700">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
            >
              <option value="date">Date récente</option>
              <option value="priority">Priorité</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des missions */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <FileText className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Aucune mission trouvée
            </h3>
            <p className="text-slate-600">
              {activeFilter === 'all' 
                ? "Vous n'avez aucune mission pour le moment."
                : "Aucune mission ne correspond à ce filtre."}
            </p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <div key={assignment._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          {assignment.taskId.titre}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {assignment.taskId.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(assignment.taskId.dateDebut)} - {formatDate(assignment.taskId.dateFin)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {assignment.taskId.direction}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(assignment.statut)}
                        {assignment.mode && (
                          <span className="text-xs text-slate-500">
                            Mode: {assignment.mode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Détails véhicule */}
                    {assignment.vehicleId && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="w-5 h-5 text-blue-600" />
                          <h4 className="font-medium text-blue-900">Véhicule attribué</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-700">Modèle:</span>
                            <p className="font-medium">{assignment.vehicleId.modele}</p>
                          </div>
                          <div>
                            <span className="text-blue-700">Immatriculation:</span>
                            <p className="font-medium">{assignment.vehicleId.immatriculation}</p>
                          </div>
                          <div>
                            <span className="text-blue-700">Type:</span>
                            <p className="font-medium">{assignment.vehicleId.typeAttribution}</p>
                          </div>
                          <div>
                            <span className="text-blue-700">Disponibilité:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              assignment.vehicleId.disponibilite
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {assignment.vehicleId.disponibilite ? 'Disponible' : 'Indisponible'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rapport algorithme */}
                    {assignment.rapportAlgorithme && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-1">
                          Rapport d'algorithme
                        </h4>
                        <p className="text-sm text-purple-800">
                          {assignment.rapportAlgorithme}
                        </p>
                      </div>
                    )}

                    {/* Justificatif de refus */}
                    {assignment.justificatifRefus && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-1">
                          Justificatif de refus
                        </h4>
                        <p className="text-sm text-red-800">
                          {assignment.justificatifRefus}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {assignment.statut === 'en_attente' && (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <button
                        onClick={() => handleAccept(assignment._id)}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accepter la mission
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowRefuseModal(true);
                        }}
                        className="flex items-center justify-center gap-2 py-3 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        <XCircle className="w-5 h-5" />
                        Refuser la mission
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modale de refus */}
      {showRefuseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Refuser la mission
            </h3>
            <p className="text-slate-600 mb-4">
              Veuillez indiquer la raison du refus. Cette information sera transmise au coordinateur.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Justificatif *
              </label>
              <textarea
                value={refuseJustification}
                onChange={(e) => setRefuseJustification(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Ex: Disponibilité incompatible, compétences non correspondantes, etc."
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRefuseModal(false);
                  setRefuseJustification('');
                  setSelectedAssignment(null);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleRefuse}
                disabled={!refuseJustification.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMissions;