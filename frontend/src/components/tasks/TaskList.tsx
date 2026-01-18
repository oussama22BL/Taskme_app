import React from 'react';
import { Edit2, Trash2, Users, Calendar, FileText, Car, ExternalLink, AlertCircle } from 'lucide-react';
import type { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAssign: (task: Task) => void;
  loading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onAssign, loading }) => {
  
  // Fonction pour ouvrir le PDF dans un nouvel onglet
  const handleViewPDF = (filePath: string) => {
    // Le backend sert les fichiers statiques sur http://localhost:5000/uploads/...
    const url = `http://localhost:5000/${filePath.replace(/\\/g, '/')}`;
    window.open(url, '_blank');
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
      <p className="text-slate-500 font-medium">Chargement des missions...</p>
    </div>
  );

  if (tasks.length === 0) return (
    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
      <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
      <p className="text-slate-500 font-medium">Aucune mission n'a été créée pour le moment.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th className="px-6 py-5">Mission & Documents</th>
              <th className="px-6 py-5">Cibles</th>
              <th className="px-6 py-5">Période</th>
              <th className="px-6 py-5">Logistique</th>
              <th className="px-6 py-5">Statut</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tasks.map((task) => (
              <tr key={task._id} className="group hover:bg-slate-50/50 transition-colors">
                {/* Colonne Mission + PDF */}
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm">{task.titre}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{task.direction}</span>
                    {task.fichierJoint && (
                      <button 
                        onClick={() => handleViewPDF(task.fichierJoint!)}
                        className="mt-2 flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-[10px] font-black uppercase tracking-tight transition-colors"
                      >
                        <FileText size={14} /> Voir le PDF joint
                      </button>
                    )}
                  </div>
                </td>

                {/* Colonne Critères */}
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {task.specialitesConcernees?.map((s, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                        {s}
                      </span>
                    ))}
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                      Grade {task.gradesConcernes?.join('/')}
                    </span>
                  </div>
                </td>

                {/* Colonne Date */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(task.dateDebut).toLocaleDateString('fr-FR')}
                  </div>
                </td>

                {/* Colonne Logistique (Véhicule) */}
                <td className="px-6 py-5">
                  {task.besoinVehicule ? (
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <Car size={16} />
                      <span className="text-[10px] font-black uppercase">Requis</span>
                    </div>
                  ) : (
                    <span className="text-slate-300 text-[10px] font-bold italic">Non requis</span>
                  )}
                </td>

                {/* Colonne Statut */}
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    task.statut === 'ouverte' ? 'bg-emerald-100 text-emerald-600' : 
                    task.statut === 'fermée' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {task.statut}
                  </span>
                </td>

                {/* Colonne Actions */}
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onAssign(task)} 
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
                      title="Affecter des auditeurs"
                    >
                      <Users size={18}/>
                    </button>
                    <button 
                      onClick={() => onEdit(task)} 
                      className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                      title="Modifier la mission"
                    >
                      <Edit2 size={18}/>
                    </button>
                    <button 
                      onClick={() => onDelete(task._id)} 
                      className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;