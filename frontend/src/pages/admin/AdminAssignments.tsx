import  { useEffect, useState } from 'react';
import { Trash2, Car} from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const res = await axiosInstance.get('/assignments'); // Route GET globale
      setAssignments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Annuler cette affectation ?")) {
      await axiosInstance.delete(`/assignments/${id}`);
      fetchAll();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Gestion des Affectations</h1>
      
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-8 py-4">Mission</th>
              <th className="px-8 py-4">Auditeur</th>
              <th className="px-8 py-4">Véhicule</th>
              <th className="px-8 py-4">Statut</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {assignments.map(ass => (
              <tr key={ass._id} className="hover:bg-slate-50/50">
                <td className="px-8 py-5 font-bold text-sm text-slate-800">{ass.taskId?.titre}</td>
                <td className="px-8 py-5 text-sm text-slate-600">{ass.userId?.nom} {ass.userId?.prenom}</td>
                <td className="px-8 py-5">
                  {ass.vehicleId ? (
                    <span className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                      <Car size={14}/> {ass.vehicleId.immatriculation}
                    </span>
                  ) : <span className="text-slate-300 text-xs">Aucun</span>}
                </td>
                <td className="px-8 py-5">
                   <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                     ass.statut === 'acceptée' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                   }`}>{ass.statut}</span>
                </td>
                <td className="px-8 py-5 text-right flex justify-end gap-2">
                  <button onClick={() => handleDelete(ass._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAssignments;