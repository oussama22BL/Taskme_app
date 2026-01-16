import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, Users } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';

const AccountManager = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', role: 'user', specialite: '', grade: '' });
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const res = await axiosInstance.get('/users/all');
    setUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/users/create-account', formData);
      alert("Succès : Email envoyé !");
      fetchUsers();
    } catch (err) { alert("Erreur lors de la création"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-8 rounded-[40px] text-white flex items-center justify-between shadow-2xl">
        <div>
          <h1 className="text-3xl font-black">Espace Super Admin</h1>
          <p className="text-slate-400">Contrôle des accès et sécurité système</p>
        </div>
        <ShieldCheck size={48} className="text-indigo-400 opacity-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULAIRE */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><UserPlus size={20}/> Créer un accès</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input placeholder="Prénom" onChange={e=>setFormData({...formData, prenom:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border-none text-sm" required />
            <input placeholder="Nom" onChange={e=>setFormData({...formData, nom:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border-none text-sm" required />
            <input type="email" placeholder="Email" onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border-none text-sm" required />

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Spécialité</label>
              <select onChange={e=>setFormData({...formData, specialite:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border-none text-sm">
                <option value="">Sélectionnez une spécialité</option>
                <option value="pédagogique">Pédagogique</option>
                <option value="orientation">Orientation</option>
                <option value="planification">Planification</option>
                <option value="financier">Financier</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Grade</label>
              <select onChange={e=>setFormData({...formData, grade:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border-none text-sm">
                <option value="">Sélectionnez un grade</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Rôle Système</label>
              <select onChange={e=>setFormData({...formData, role:e.target.value})} className="w-full p-3 bg-indigo-50 text-indigo-600 rounded-xl border-none font-bold text-sm">
                <option value="user">Auditeur (User)</option>
                <option value="admin">Coordinateur (Admin)</option>
              </select>
            </div>

            <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              {loading ? "Génération en cours..." : "Créer & Envoyer Email"}
            </button>
          </form>
        </div>

        {/* LISTE */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Users size={20}/> Membres actifs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr><th className="px-4 py-3">Utilisateur</th><th className="px-4 py-3">Rôle</th><th className="px-4 py-3">Email</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-sm text-slate-700">{u.nom} {u.prenom}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${u.role !== 'user' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-400 italic">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManager;