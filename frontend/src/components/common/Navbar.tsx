import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, X, LogOut, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import { io } from 'socket.io-client'; // <--- AJOUTER

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<any[]>([]); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- NOUVEAU : CHARGER ET ECOUTER LES NOTIFICATIONS ---
  useEffect(() => {
    if (!user) return;

    // 1. Charger l'historique depuis le backend
    const fetchNotifs = async () => {
      try {
        const res = await axiosInstance.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error("Erreur chargement notifs", err);
      }
    };
    fetchNotifs();

    // 2. Configurer Socket.io pour le temps réel
    const socket = io('http://localhost:5000');
    
    // S'enregistrer auprès du serveur
    socket.emit('setup', user._id);

    // Ecouter l'événement "new_notification" que nous avons créé au backend
    socket.on('new_notification', (notif) => {
      // Ajouter la nouvelle notification en haut de la liste
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off('new_notification');
      socket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (id: string) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Compter les notifications non lues (champ 'isRead' dans notre modèle backend)
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full">
      <div className="px-6 py-3 flex items-center justify-between">
        
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        <div className="ml-auto flex items-center gap-2">
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              className="p-2 hover:bg-slate-100 rounded-full relative transition"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {/* Badge rouge si non lues */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-800">Notifications</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase">{unreadCount} Nouvelles</span>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                       <Bell size={32} className="mx-auto mb-2 opacity-20"/>
                       <p className="text-xs">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n._id} 
                        onClick={() => markAsRead(n._id)} 
                        className={`p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                      >
                        <div className="flex gap-3">
                           {!n.isRead && <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 flex-shrink-0"></div>}
                           <div>
                              <p className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'text-slate-500'}`}>{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-full transition"
            >
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-200">
                {user?.prenom?.charAt(0).toUpperCase()}{user?.nom?.charAt(0).toUpperCase()}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 mb-2">
                  <p className="text-sm font-bold text-slate-900">{user?.prenom} {user?.nom}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.role}</p>
                </div>
                <button onClick={() => navigate('/user/profile')} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-all">
                  <UserCircle className="w-4 h-4 text-slate-400" /> Mon Profil
                </button>
                <hr className="my-2 border-slate-50" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-all"
                >
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;