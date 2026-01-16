import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Briefcase, GraduationCap, Save, Edit2, X, Plus, CheckCircle, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../api/userApi';
import type { User } from '../../types';

const Profile: React.FC = () => {
  const { login } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // États pour les inputs d'ajout
  const [tempDiploma, setTempDiploma] = useState('');
  const [tempFormation, setTempFormation] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userApi.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Erreur chargement profil", err);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const updatedUser = await userApi.updateProfile(profile);
      // Mettre à jour le contexte (Sidebar/Navbar)
      const token = localStorage.getItem('taskme_token') || "";
      login(token, updatedUser);
      setIsEditing(false);
      alert("Profil mis à jour avec succès !");
    } catch (err) {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  // Ajout/Suppression sécurisée pour TypeScript
  const addExpertise = (type: 'diplomes' | 'formations') => {
    if (!profile) return;
    const val = type === 'diplomes' ? tempDiploma : tempFormation;
    if (!val.trim()) return;

    const currentList = type === 'diplomes' ? (profile.diplomes || []) : (profile.formations || []);
    
    setProfile({
      ...profile,
      [type]: [...currentList, val]
    });

    if (type === 'diplomes') setTempDiploma('');
    else setTempFormation('');
  };

  const removeExpertise = (type: 'diplomes' | 'formations', index: number) => {
    if (!profile) return;
    const currentList = type === 'diplomes' ? (profile.diplomes || []) : (profile.formations || []);
    const newList = currentList.filter((_, i) => i !== index);
    setProfile({ ...profile, [type]: newList });
  };

  if (!profile) return <div className="p-10 text-center text-slate-400">Chargement du profil...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Mon Profil</h1>
          <p className="text-slate-500 mt-1">Identité et expertise professionnelle</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
            <Edit2 size={18} /> Modifier
          </button>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-400 font-bold">Annuler</button>
            <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-2.5 rounded-2xl font-bold hover:bg-black transition disabled:opacity-50">
              <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : INFOS DE BASE */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <UserIcon size={40} className="text-indigo-600" />
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <input value={profile.nom} onChange={e => setProfile({...profile, nom: e.target.value})} className="w-full text-center p-2 bg-slate-50 rounded-xl border-none font-bold text-lg" placeholder="Nom" />
                <input value={profile.prenom} onChange={e => setProfile({...profile, prenom: e.target.value})} className="w-full text-center p-2 bg-slate-50 rounded-xl border-none font-bold text-lg" placeholder="Prénom" />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{profile.nom} {profile.prenom}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest">{profile.role}</span>
              </>
            )}
            
            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4 text-left">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={16} /></div>
                <span className="text-sm font-medium">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Briefcase size={16} /></div>
                <span className="text-sm font-medium">{profile.specialite} — <b className="text-indigo-600">Grade {profile.grade}</b></span>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : EXPERTISE (UTILISÉ PAR L'IA) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DIPLOMES */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><GraduationCap size={20}/></div>
                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Diplômes & Certifications</h3>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 mb-6">
                <input value={tempDiploma} onChange={e => setTempDiploma(e.target.value)} placeholder="Ex: Master en Audit Interne..." className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" />
                <button onClick={() => addExpertise('diplomes')} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"><Plus size={20}/></button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {profile.diplomes?.length === 0 && <p className="text-slate-300 text-xs italic">Aucun diplôme enregistré.</p>}
              {profile.diplomes?.map((d, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 group">
                  <Award size={14} className="text-indigo-400" />
                  {d}
                  {isEditing && <X size={14} className="cursor-pointer text-rose-500 hover:scale-125 transition" onClick={() => removeExpertise('diplomes', i)} />}
                </div>
              ))}
            </div>
          </div>

          {/* FORMATIONS */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={20}/></div>
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Formations Spécialisées</h3>
            </div>

            {isEditing && (
              <div className="flex gap-2 mb-6">
                <input value={tempFormation} onChange={e => setTempFormation(e.target.value)} placeholder="Ex: Analyse des risques bancaires..." className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500" />
                <button onClick={() => addExpertise('formations')} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"><Plus size={20}/></button>
              </div>
            )}

            <div className="space-y-2">
              {profile.formations?.length === 0 && <p className="text-slate-300 text-xs italic">Aucune formation enregistrée.</p>}
              {profile.formations?.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all hover:bg-slate-100">
                  <span className="text-sm font-semibold text-slate-700">{f}</span>
                  {isEditing && <X size={16} className="cursor-pointer text-rose-400" onClick={() => removeExpertise('formations', i)} />}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;