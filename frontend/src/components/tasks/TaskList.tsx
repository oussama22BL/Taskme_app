import React from 'react';
import { Edit2, Trash2, Users, Calendar } from 'lucide-react';
import type { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAssign: (task: Task) => void;
  loading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onAssign, loading }) => {
  if (loading) return <div className="h-40 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
          <tr>
            <th className="px-6 py-4">Détails Mission</th>
            <th className="px-6 py-4">Critères</th>
            <th className="px-6 py-4">Période</th>
            <th className="px-6 py-4">Statut</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {tasks.map((task) => (
            <tr key={task._id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5">
                <p className="font-bold text-slate-800 text-sm">{task.titre}</p>
                <p className="text-xs text-slate-400 mt-0.5">{task.direction}</p>
              </td>
              <td className="px-6 py-5">
                <div className="flex gap-1">
                  {task.specialitesConcernees.slice(0, 1).map(s => <span key={s} className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold">{s}</span>)}
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">Grade {task.gradesConcernes[0]}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                   <Calendar size={14}/> {new Date(task.dateDebut).toLocaleDateString('fr-FR')}
                </div>
              </td>
              <td className="px-6 py-5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${task.statut === 'ouverte' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {task.statut.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onAssign(task)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Affecter">
                    <Users size={18}/>
                  </button>
                  <button onClick={() => onEdit(task)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                    <Edit2 size={18}/>
                  </button>
                  <button onClick={() => onDelete(task._id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;