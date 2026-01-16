import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, Users, Power , PowerOff, UserIcon} from 'lucide-react';
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

  const handleToggleStatus = async (id: string) => {
    try {
      await axiosInstance.patch(`/users/${id}/toggle-status`);
      fetchUsers(); // Rafraîchir la liste après modification
    } catch (err) {
      alert("Erreur lors de la modification du statut");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 ">
      <div className="bg-slate-900 p-8 rounded-[40px] text-white flex items-center justify-between shadow-2xl">
        <div>
          <h1 className="text-3xl font-black">Espace de gestion des comptes</h1>
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
              {loading ? "Génération en cours..." : "Créer"}
            </button>
          </form>
        </div>

        {/* LISTE */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100  overflow-x-auto">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Users size={20}/> Membres actifs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2 ">
              <thead className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-3">Utilisateur</th>
                  <th className="px-6 py-3">Rôle</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-all group">
                    {/* Colonne Identité */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">
                          {u.nom.toUpperCase()} {u.prenom}
                        </span>
                        <span className="text-xs text-slate-400 italic font-medium">{u.email}</span>
                      </div>
                    </td>

                    {/* Colonne Rôle */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'admin' || u.role === 'superAdmin' 
                          ? 'bg-amber-100 text-amber-600' 
                          : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Colonne Statut (Badge dynamique) */}
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] font-bold uppercase tracking-tight">Compte Actif</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-500 rounded-full border border-rose-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                          <span className="text-[10px] font-bold uppercase tracking-tight">Désactivé</span>
                        </div>
                      )}
                    </td>

                    {/* Colonne Action (Bouton Toggle) */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`p-2.5 rounded-2xl transition-all duration-300 ${
                          u.isActive 
                            ? 'text-slate-300 hover:text-rose-600 hover:bg-rose-50' 
                            : 'text-emerald-600 bg-emerald-100 hover:bg-emerald-200 shadow-sm'
                        } disabled:opacity-0 disabled:cursor-not-allowed`}
                        title={u.isActive ? "Désactiver cet utilisateur" : "Réactiver cet utilisateur"}
                      >
                        {u.isActive ? <PowerOff size={20} /> : <Power size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="p-20 text-center text-slate-400">
                <p className="text-sm font-medium italic">Aucun membre enregistré dans la base de données.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManager;