import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Car, 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import type { Assignment } from '../../types';

const UserMissions: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour la modale de refus
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [refuseJustification, setRefuseJustification] = useState('');
  
  // États pour les filtres
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAndSortAssignments();
  }, [assignments, activeFilter, sortBy]);

  // 1. Récupération des missions depuis le Backend
  const fetchAssignments = async () => {
    try {
      // On utilise la route définie au backend pour l'auditeur connecté
      const response = await axiosInstance.get('/assignments/my');
      setAssignments(response.data);
      setFilteredAssignments(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Logique de filtrage et tri
  const filterAndSortAssignments = () => {
    let filtered = [...assignments];

    if (activeFilter === 'pending') filtered = filtered.filter(a => a.statut === 'en_attente');
    else if (activeFilter === 'accepted') filtered = filtered.filter(a => a.statut === 'acceptée');
    else if (activeFilter === 'refused') filtered = filtered.filter(a => a.statut === 'refusée');
    else if (activeFilter === 'withVehicle') filtered = filtered.filter(a => a.vehicleId);

    filtered.sort((a, b) => {
      const dateA = new Date(a.taskId?.dateDebut || 0).getTime();
      const dateB = new Date(b.taskId?.dateDebut || 0).getTime();
      return sortBy === 'date' ? dateB - dateA : dateA - dateB;
    });

    setFilteredAssignments(filtered);
  };

  // 3. Action : Accepter la mission
  const handleAccept = async (assignmentId: string) => {
    if (window.confirm('Voulez-vous accepter officiellement cette mission ?')) {
      try {
        await axiosInstance.put(`/assignments/${assignmentId}/respond`, {
          statut: 'acceptée'
        });
        alert("Mission acceptée ! Elle apparaît désormais dans vos missions actives.");
        fetchAssignments();
      } catch (error: any) {
        alert(error.response?.data?.message || "Erreur lors de l'acceptation");
      }
    }
  };

  // 4. Action : Refuser la mission (via modale)
  const handleRefuse = async () => {
    if (!refuseJustification.trim()) {
      alert('Veuillez fournir un motif de refus.');
      return;
    }

    try {
      await axiosInstance.put(`/assignments/${selectedAssignment?._id}/respond`, {
        statut: 'refusée',
        justificatifRefus: refuseJustification,
      });
      setShowRefuseModal(false);
      setRefuseJustification('');
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (error) {
      console.error('Erreur refus:', error);
    }
  };

  // 5. Action : Ouvrir le PDF
  const handleViewPDF = (filePath: string) => {
    // Nettoyage du chemin pour l'URL (Windows \ vers web /)
    const cleanPath = filePath.replace(/\\/g, '/');
    const url = `http://localhost:5000/${cleanPath}`;
    window.open(url, '_blank');
  };

  // 6. UI Helpers
  const getStatusBadge = (statut: string) => {
    const baseClass = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider";
    switch (statut) {
      case 'acceptée': return <span className={`${baseClass} bg-emerald-100 text-emerald-700`}><CheckCircle size={14}/> Acceptée</span>;
      case 'refusée': return <span className={`${baseClass} bg-rose-100 text-rose-700`}><XCircle size={14}/> Refusée</span>;
      default: return <span className={`${baseClass} bg-amber-100 text-amber-700`}><Clock size={14}/> En attente</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Chargement de vos missions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Mes Missions</h1>
          <p className="text-slate-500">Gérez votre planning d'audit et vos déplacements</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {['all', 'pending', 'accepted'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                activeFilter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'pending' ? 'À répondre' : 'Validées'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des missions */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
            <FileText className="mx-auto text-slate-200 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-400">Aucune mission trouvée</h3>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <div key={assignment._id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all overflow-hidden group">
              <div className="p-8">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  
                  {/* Infos Mission */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {assignment.taskId?.titre}
                        </h3>
                        <p className="text-slate-400 font-medium text-sm mt-1">{assignment.taskId?.direction}</p>
                      </div>
                      <div className="hidden sm:block">{getStatusBadge(assignment.statut)}</div>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <FileText size={16} className="text-indigo-500" /> {assignment.taskId?.type}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        Du {new Date(assignment.taskId?.dateDebut).toLocaleDateString()} au {new Date(assignment.taskId?.dateFin).toLocaleDateString()}
                      </div>
                    </div>

                    {/* ✅ BOUTON PDF */}
                    {assignment.taskId?.fichierJoint && (
                      <button 
                        onClick={() => {
                          if (assignment.taskId?.fichierJoint) {
                            handleViewPDF(assignment.taskId.fichierJoint);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition font-bold text-xs uppercase"
                      >
                        <ExternalLink size={14} /> Ouvrir l'ordre de mission (PDF)
                      </button>
                    )}

                    {/* Infos Véhicule */}
                    {assignment.vehicleId && (
                      <div className="p-4 bg-indigo-600 rounded-3xl text-white flex items-center justify-between shadow-lg shadow-indigo-100">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/20 rounded-2xl"><Car size={24} /></div>
                          <div>
                            <p className="text-[10px] font-black uppercase opacity-70">Véhicule de service attribué</p>
                            <p className="font-bold">{assignment.vehicleId.modele} — {assignment.vehicleId.immatriculation}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase italic">
                           {assignment.vehicleId.typeAttribution}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions de réponse */}
                  <div className="lg:w-64 flex flex-col justify-center gap-3">
                    {assignment.statut === 'en_attente' ? (
                      <>
                        <button
                          onClick={() => handleAccept(assignment._id)}
                          className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all transform hover:-translate-y-1"
                        >
                          ACCEPTER
                        </button>
                        <button
                          onClick={() => { setSelectedAssignment(assignment); setShowRefuseModal(true); }}
                          className="w-full py-4 bg-white border-2 border-rose-100 text-rose-500 rounded-2xl font-black hover:bg-rose-50 transition-all"
                        >
                          REFUSER
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date réponse</p>
                         <p className="text-sm font-bold text-slate-600">{new Date(assignment.updatedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modale de Refus */}
      {showRefuseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Refuser la mission</h3>
            <p className="text-slate-500 text-sm mb-6">
              Veuillez justifier votre refus. Cette information sera transmise au coordinateur.
            </p>
            
            <textarea
              value={refuseJustification}
              onChange={(e) => setRefuseJustification(e.target.value)}
              rows={4}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 text-sm mb-6"
              placeholder="Ex: Indisponibilité pour raisons personnelles, surcharge de travail..."
              required
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowRefuseModal(false); setRefuseJustification(''); }}
                className="flex-1 py-4 text-slate-400 font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleRefuse}
                disabled={!refuseJustification.trim()}
                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-100 hover:bg-rose-600 disabled:opacity-30 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMissions;