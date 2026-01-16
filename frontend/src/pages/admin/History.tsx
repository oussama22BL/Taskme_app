import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';

const AdminHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axiosInstance.get('/assignments/history');
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getActionStyle = (action: string) => {
    switch(action) {
      case 'MISSION_ACCEPTEE': return 'bg-emerald-100 text-emerald-600';
      case 'MISSION_REFUSEE': return 'bg-rose-100 text-rose-600';
      case 'AFFECTATION_CREEE': return 'bg-indigo-100 text-indigo-600';
      case 'ACCEPTATION_AUTOMATIQUE': return 'bg-purple-100 text-purple-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Journal d'affectations</h1>
        <p className="text-slate-500">Traçabilité complète des actions système</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
            <tr>
              <th className="px-8 py-4">Action</th>
              <th className="px-8 py-4">Utilisateur concerné</th>
              <th className="px-8 py-4">Détails / Justification IA</th>
              <th className="px-8 py-4">Date & Heure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {history.map((log) => (
              <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${getActionStyle(log.action)}`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Users size={14}/></div>
                    <span className="text-sm font-bold text-slate-700">{log.performedBy?.nom} {log.performedBy?.prenom}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-xs text-slate-500 italic max-w-md">"{log.details || 'Aucun détail fourni'}"</p>
                </td>
                <td className="px-8 py-5 text-xs text-slate-400">
                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHistory;