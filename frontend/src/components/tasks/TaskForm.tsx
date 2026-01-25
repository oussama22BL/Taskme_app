import React, { useState } from 'react';
import { X, Upload} from 'lucide-react';
import type { Task } from '../../types';
import axiosInstance from '../../api/axiosConfig';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
  onSuccess: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titre: task?.titre || '',
    type: task?.type || 'Formateur',
    dateDebut: task?.dateDebut ? new Date(task.dateDebut).toISOString().split('T')[0] : '',
    dateFin: task?.dateFin ? new Date(task.dateFin).toISOString().split('T')[0] : '',
    besoinVehicule: task?.besoinVehicule || false,
    direction: task?.direction || 'Rabat-Casa',
    specialitesConcernees: task?.specialitesConcernees || [] as string[],
    gradesConcernes: task?.gradesConcernes || [] as string[],
    fichierJoint: null as File | null,
    isRemuneree: task?.isRemuneree || false,
    nombrePlaces: task?.nombrePlaces || 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const taskTypes = ['Formateur', 'Jury', 'Bénéficiaire', 'Observateur', 'Concepteur'];
  const directions = ['Rabat-Casa', 'Meknès-Errachidia', 'Marrakech-Agadir'];
  const specs = ['pédagogique', 'orientation', 'planification', 'financier'];
  const grades = ['A', 'B', 'C'];

  const toggleItem = (list: string[], item: string, key: string) => {
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setFormData({ ...formData, [key]: newList });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.specialitesConcernees.length === 0) {
      return setError("Sélectionnez au moins une spécialité");
    }

    if (new Date(formData.dateDebut) > new Date(formData.dateFin)) {
      setError("La date de début doit être anférieure à la date de fin");
      return;
    }

    if(new Date(formData.dateDebut) < new Date(Date.now() + 48 * 60 * 60 * 1000)) {
      setError("La date de début doit être au moins 48h dans le futur");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      
      // Ajout des champs simples
      data.append('titre', formData.titre);
      data.append('type', formData.type);
      data.append('dateDebut', formData.dateDebut);
      data.append('dateFin', formData.dateFin);
      data.append('direction', formData.direction);
      data.append('besoinVehicule', String(formData.besoinVehicule));
      data.append('isRemuneree', String(formData.isRemuneree));
      data.append('nombrePlaces', String(formData.nombrePlaces));
      console.log('Sending nombrePlaces:', formData.nombrePlaces);
      console.log('Sending nombrePlaces:',typeof formData.nombrePlaces);

      // Ajout des tableaux : On utilise le MÊME nom de clé plusieurs fois
      // C'est la méthode standard pour envoyer des tableaux en FormData
      formData.specialitesConcernees.forEach(s => data.append('specialitesConcernees', s));
      formData.gradesConcernes.forEach(g => data.append('gradesConcernes', g));

      // 🚨 AJOUT DU FICHIER : La clé doit être "pdf" (comme dans ta route backend)
      console.log('formData.fichierJoint:', formData.fichierJoint); // Debug: vérifier si le fichier est sélectionné
      console.log('formData.isRemuneree:', formData.isRemuneree); 
      if (formData.fichierJoint) {
        data.append('pdf', formData.fichierJoint);
        console.log('File appended to FormData'); // Debug: confirmer l'ajout
      }

      // Envoi au serveur
      if (task) {
        await axiosInstance.put(`/tasks/${task._id}`, data);
      } else {
        await axiosInstance.post('/tasks', data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">{task ? 'Modifier la mission' : 'Nouvelle mission'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Titre de la mission *</label>
            <input type="text" value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" required />
          </div>

          {/* Type et Direction (LES CHAMPS QUI MANQUAIENT) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Type de mission</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200">
                {taskTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Région / Direction</label>
              <select value={formData.direction} onChange={e => setFormData({...formData, direction: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200">
                {directions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Spécialités et Grades */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Spécialités *</label>
              <div className="flex flex-wrap gap-2">
                {specs.map(s => (
                  <button type="button" key={s} onClick={() => toggleItem(formData.specialitesConcernees, s, 'specialitesConcernees')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.specialitesConcernees.includes(s) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Grades *</label>
              <div className="flex flex-wrap gap-2">
                {grades.map(g => (
                  <button type="button" key={g} onClick={() => toggleItem(formData.gradesConcernes, g, 'gradesConcernes')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.gradesConcernes.includes(g) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de places</label>
              <input type="number" value={formData.nombrePlaces} onChange={e => setFormData({...formData, nombrePlaces: parseInt(e.target.value, 10)})} className="w-full px-4 py-3 rounded-xl border border-slate-200" required />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date début</label>
              <input type="date" value={formData.dateDebut} onChange={e => setFormData({...formData, dateDebut: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date fin</label>
              <input type="date" value={formData.dateFin} onChange={e => setFormData({...formData, dateFin: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" required />
            </div>
          </div>

          {/* Upload PDF (L'INPUT QUI MANQUAIT) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Document de mission (PDF)</label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 hover:border-indigo-400 transition-colors group">
              <input type="file" accept="application/pdf" onChange={e => setFormData({...formData, fichierJoint: e.target.files?.[0] || null})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center justify-center py-2">
                <Upload size={24} className="text-slate-400 group-hover:text-indigo-500 mb-2"/>
                <span className="text-sm text-slate-500">
                  {formData.fichierJoint ? formData.fichierJoint.name : "Cliquez ou glissez le PDF ici"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center p-4 bg-slate-50 rounded-2xl">
            <input type="checkbox" id="vehicule" checked={formData.besoinVehicule} onChange={e => setFormData({...formData, besoinVehicule: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded-lg" />
            <label htmlFor="vehicule" className="ml-3 text-sm font-semibold text-slate-700 cursor-pointer">Nécessite un véhicule de service</label>
          </div>

          <div className="flex items-center p-4 bg-slate-50 rounded-2xl">
            <input type="checkbox" id="remuneree" checked={formData.isRemuneree} onChange={e => setFormData({...formData, isRemuneree: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded-lg" />
            <label htmlFor="remuneree" className="ml-3 text-sm font-semibold text-slate-700 cursor-pointer">Mission rémunérée</label>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold">Annuler</button>
            <button type="submit" disabled={loading} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50">
              {loading ? 'Traitement...' : 'Valider la mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;