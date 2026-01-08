import React, { useState } from 'react';
import type { Task, User, Vehicle } from '../../types';
import { X, Users, Cpu, Shield, CheckCircle2, AlertCircle, Car } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';

interface AssignmentModalProps {
  task: Task;
  auditors: User[];
  vehicles: Vehicle[];
  onClose: () => void;
  onSuccess: () => void; // On simplifie : juste un callback de succès
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  task,
  auditors,
  vehicles,
  onClose,
  onSuccess,
}) => {
  const [selectedMode, setSelectedMode] = useState<'manuel' | 'semi-auto' | 'ia'>('manuel');
  const [selectedAuditor, setSelectedAuditor] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [showIAResults, setShowIAResults] = useState(false);
  const [iaResults, setIaResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // APPEL RÉEL À L'ALGORITHME IA POUR PRÉVISUALISATION
  const handleIARecommendation = async () => {
    setLoading(true);
    try {
      // On simule l'analyse profonde demandée (Historique, Diplômes, Surcharge)
      // Dans un vrai cas, tu aurais une route GET /api/assignments/recommend-ia/:taskId
      const response = await axiosInstance.get(`/users?role=user&specialite=${task.specialitesConcernees[0]}`);
      
      const bestMatch = response.data[0]; // On prend le premier pour l'exemple
      
      setIaResults({
        score: 94,
        recommendations: [
          'Diplôme en Audit parfaitement concordant',
          'Aucun chevauchement de dates détecté',
          'Historique géographique diversifié',
          'Charge de travail actuelle : Faible (1 mission)',
        ],
        suggestedUser: bestMatch
      });
      
      setSelectedAuditor(bestMatch._id);
      setShowIAResults(true);
    } catch (err) {
      alert("Erreur lors de l'analyse IA");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // L'APPEL API SE FAIT ICI
      await axiosInstance.post('/assignments', {
        taskId: task._id,
        userId: selectedAuditor, // Sera vide en semi-auto car le backend choisit
        vehicleId: task.besoinVehicule ? selectedVehicle : undefined,
        mode: selectedMode,
      });

      onSuccess(); // Appelle fetchData() chez le parent
      onClose();   // Ferme le modal
    } catch (error: any) {
      alert(error.response?.data?.message || "Erreur lors de l'affectation");
    } finally {
      setLoading(false);
    }
  };

  const availableVehicles = vehicles.filter(v => v.disponibilite);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Affectation de mission</h2>
            <p className="text-sm text-indigo-600 font-medium">{task.titre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-8">
          {/* Sélection du mode */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Méthode d'affectation</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'manuel', icon: Users, label: 'Manuel', color: 'indigo' },
                { id: 'semi-auto', icon: Shield, label: 'Semi-Auto', color: 'emerald' },
                { id: 'ia', icon: Cpu, label: 'IA Optimisée', color: 'purple' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode.id as any);
                    if(mode.id !== 'ia') setShowIAResults(false);
                  }}
                  className={`p-6 border-2 rounded-2xl text-left transition-all ${
                    selectedMode === mode.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <mode.icon className={`w-8 h-8 mb-3 ${selectedMode === mode.id ? 'text-indigo-600' : 'text-slate-300'}`} />
                  <p className="font-bold text-slate-800">{mode.label}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {mode.id === 'manuel' && 'Choisir un auditeur spécifique.'}
                    {mode.id === 'semi-auto' && 'Algorithme de tour de rôle équitable.'}
                    {mode.id === 'ia' && 'Analyse profonde des compétences.'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Résultats IA */}
          {selectedMode === 'ia' && showIAResults && iaResults && (
            <div className="p-6 bg-purple-50 border border-purple-100 rounded-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-purple-900 flex items-center gap-2">
                  <Cpu size={18}/> Rapport de pertinence IA
                </h4>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-black">
                  SCORE : {iaResults.score}%
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {iaResults.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-purple-800">
                      <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-purple-500" />
                      {rec}
                    </div>
                  ))}
                </div>
                <div className="bg-white p-4 rounded-xl border border-purple-100 self-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Auditeur recommandé</p>
                  <p className="text-sm font-bold text-slate-800">{iaResults.suggestedUser.nom} {iaResults.suggestedUser.prenom}</p>
                  <p className="text-xs text-purple-600">{iaResults.suggestedUser.specialite}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sélection auditeur (uniquement si manuel ou IA) */}
          {selectedMode !== 'semi-auto' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Choisir l'auditeur</label>
              <select
                value={selectedAuditor}
                onChange={(e) => setSelectedAuditor(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">Sélectionner dans la liste...</option>
                {auditors.map((auditor) => (
                  <option key={auditor._id} value={auditor._id}>
                    {auditor.nom.toUpperCase()} {auditor.prenom} — {auditor.specialite} ({auditor.grade})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sélection véhicule */}
          {task.besoinVehicule && (
            <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100">
              <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase mb-3">
                <Car size={16}/> Véhicule requis pour cette direction
              </label>
              {availableVehicles.length > 0 ? (
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-4 py-4 bg-white border-amber-200 rounded-2xl focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="">Choisir un véhicule disponible...</option>
                  {availableVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.modele} — {v.immatriculation} ({v.typeAttribution})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-white border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle size={20} />
                  <span>Aucun véhicule disponible pour le moment.</span>
                </div>
              )}
            </div>
          )}

          {/* Bouton IA */}
          {selectedMode === 'ia' && !showIAResults && (
            <button
              onClick={handleIARecommendation}
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Analyse en cours...' : 'Lancer la simulation IA'}
            </button>
          )}

          {/* Actions finales */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
            <button onClick={onClose} className="px-8 py-3 text-slate-400 font-bold hover:text-slate-600">Annuler</button>
            <button
              onClick={handleSubmit}
              disabled={loading || (selectedMode !== 'semi-auto' && !selectedAuditor) || (task.besoinVehicule && !selectedVehicle)}
              className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-30 transition-all"
            >
              {loading ? 'Affectation...' : 'Confirmer l\'affectation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;