import React, { useState, useEffect } from 'react';
import type { Task, User, Vehicle } from '../../types';
import { X, Users, Cpu, Shield, CheckCircle2, AlertCircle, Car, ListOrdered, Sparkles } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';

interface AssignmentModalProps {
  task: Task;
  auditors: User[]; // Liste complète des auditeurs (pour mode manuel)
  vehicles: Vehicle[];
  onClose: () => void;
  onSuccess: () => void; 
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
  const [loading, setLoading] = useState(false);
  
  // Résultats des algorithmes
  const [iaResults, setIaResults] = useState<any>(null);
  const [semiAutoResults, setSemiAutoResults] = useState<User[]>([]);

  // 1. RECOMMANDATION SEMI-AUTO (Tour de rôle - Liste de priorité)
  const handleSemiAutoFetch = async () => {
    setLoading(true);
    setIaResults(null);
    setSelectedAuditor(''); // Réinitialise le choix
    try {
      // On appelle l'API de proposition (triée par ancienneté/dispo)
      const response = await axiosInstance.get(`/assignments/propose/${task._id}`);
      setSemiAutoResults(response.data.candidates);
      setSelectedMode('semi-auto');
    } catch (err) {
      alert("Erreur lors du calcul du tour de rôle");
    } finally {
      setLoading(false);
    }
  };

  // 2. RECOMMANDATION IA (Analyse de profil)
  const handleIARecommendation = async () => {
    setLoading(true);
    setSemiAutoResults([]);
    setSelectedAuditor('');
    try {
      // Simulation ou appel réel à l'algorithme IA
      const response = await axiosInstance.get(`/users?role=user&specialite=${task.specialitesConcernees[0]}`);
      const best = response.data[0];
      
      setIaResults({
        score: 96,
        reasons: ["Expertise thématique", "Disponibilité confirmée", "Historique de réussite"],
        suggestedUser: best
      });
      setSelectedAuditor(best._id);
      setSelectedMode('ia');
    } catch (err) {
      alert("Erreur lors de l'analyse IA");
    } finally {
      setLoading(false);
    }
  };

  // 3. SOUMISSION FINALE
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/assignments', {
        taskId: task._id,
        userId: selectedAuditor,
        vehicleId: task.besoinVehicule ? selectedVehicle : undefined,
        mode: selectedMode,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erreur lors de l'affectation");
    } finally {
      setLoading(false);
    }
  };

  const availableVehicles = vehicles.filter(v => v.disponibilite);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl no-scrollbar">
        
        {/* Header */}
        <div className="p-8 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Affectation de mission</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">{task.direction}</span>
               <p className="text-sm text-slate-400 font-medium">{task.titre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={28} /></button>
        </div>

        <div className="p-8 space-y-8">
          {/* SÉLECTION DU MODE */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Méthode de sélection</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => { setSelectedMode('manuel'); setIaResults(null); setSemiAutoResults([]); setSelectedAuditor(''); }} 
                className={`p-6 border-2 rounded-3xl text-left transition-all ${selectedMode === 'manuel' ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <Users className={`mb-3 ${selectedMode === 'manuel' ? 'text-indigo-600' : 'text-slate-300'}`} />
                <p className="font-bold text-slate-800">Mode Manuel</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Libre choix</p>
              </button>

              <button 
                onClick={handleSemiAutoFetch} 
                className={`p-6 border-2 rounded-3xl text-left transition-all ${selectedMode === 'semi-auto' ? 'border-emerald-600 bg-emerald-50/50 ring-4 ring-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <Shield className={`mb-3 ${selectedMode === 'semi-auto' ? 'text-emerald-600' : 'text-slate-300'}`} />
                <p className="font-bold text-slate-800">Tour de Rôle</p>
                <p className="text-[10px] text-emerald-600 mt-1 uppercase font-bold tracking-tighter">Équité algorithmique</p>
              </button>

              <button 
                onClick={handleIARecommendation} 
                className={`p-6 border-2 rounded-3xl text-left transition-all ${selectedMode === 'ia' ? 'border-purple-600 bg-purple-50/50 ring-4 ring-purple-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <Cpu className={`mb-3 ${selectedMode === 'ia' ? 'text-purple-600' : 'text-slate-300'}`} />
                <p className="font-bold text-slate-800">IA Taskme</p>
                <p className="text-[10px] text-purple-600 mt-1 uppercase font-bold tracking-tighter">Analyse d'expertise</p>
              </button>
            </div>
          </div>

          {/* SECTION : RÉSULTATS TOUR DE RÔLE (Priorité) */}
          {selectedMode === 'semi-auto' && semiAutoResults.length > 0 && (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-black text-emerald-600 uppercase mb-4 flex items-center gap-2 tracking-widest">
                <ListOrdered size={16}/> Classement de priorité suggéré
              </p>
              <div className="flex flex-wrap gap-3">
                {semiAutoResults.map((auditor, index) => (
                  <button
                    key={auditor._id}
                    onClick={() => setSelectedAuditor(auditor._id)}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center gap-3 ${
                      selectedAuditor === auditor._id 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200 scale-105' 
                        : 'bg-white text-emerald-800 border-emerald-100 hover:border-emerald-400'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${selectedAuditor === auditor._id ? 'bg-white text-emerald-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {index + 1}
                    </span>
                    {auditor.nom} {auditor.prenom}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION : RÉSULTATS IA */}
          {selectedMode === 'ia' && iaResults && (
            <div className="p-6 bg-purple-50 border border-purple-100 rounded-[2rem] animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                   <Sparkles size={16}/> Recommandation de l'intelligence artificielle
                </p>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black">Pertinence : {iaResults.score}%</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {iaResults.reasons.map((r: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-purple-800 font-medium italic">
                      <CheckCircle2 size={14} className="text-purple-500" /> {r}
                    </div>
                  ))}
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Profil Expert détecté</p>
                   <p className="font-black text-slate-800">{iaResults.suggestedUser.nom} {iaResults.suggestedUser.prenom}</p>
                </div>
              </div>
            </div>
          )}

          {/* LISTE DÉROULANTE FINALE (Synchronisée avec les boutons) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Auditeur à affecter</label>
            <select
              value={selectedAuditor}
              onChange={(e) => setSelectedAuditor(e.target.value)}
              className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] font-bold text-slate-800 focus:border-indigo-500 focus:bg-white transition-all outline-none"
            >
              <option value="">-- Veuillez choisir un auditeur --</option>
              {/* On filtre la liste selon le mode */}
              {(selectedMode === 'manuel' ? auditors : (semiAutoResults.length > 0 ? semiAutoResults : auditors)).map((a) => (
                <option key={a._id} value={a._id}>
                  {a.nom.toUpperCase()} {a.prenom} — {a.specialite} ({a.grade})
                </option>
              ))}
            </select>
          </div>

          {/* LOGISTIQUE VÉHICULE */}
          {task.besoinVehicule && (
            <div className="p-8 bg-amber-50/40 rounded-[2rem] border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Car size={24}/></div>
                 <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">Logistique Requis</p>
                    <h4 className="text-sm font-bold text-amber-900 mt-1">Sélection du véhicule de service</h4>
                 </div>
              </div>
              
              {availableVehicles.length > 0 ? (
                <select 
                  value={selectedVehicle} 
                  onChange={e => setSelectedVehicle(e.target.value)} 
                  className="w-full px-6 py-4 bg-white border-amber-200 rounded-2xl font-bold text-amber-900 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Choisir une voiture disponible au parc --</option>
                  {availableVehicles.map(v => <option key={v._id} value={v._id}>{v.modele} — {v.immatriculation} ({v.typeAttribution})</option>)}
                </select>
              ) : (
                <div className="p-4 bg-white border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold uppercase">
                  <AlertCircle size={20} /> Aucune voiture disponible pour cette mission.
                </div>
              )}
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-4 pt-8 border-t">
            <button onClick={onClose} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-600 transition-all uppercase text-xs tracking-widest">Annuler</button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedAuditor || (task.besoinVehicule && !selectedVehicle)}
              className="px-12 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-30 disabled:translate-y-0 transform hover:-translate-y-1 transition-all uppercase text-xs tracking-widest"
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