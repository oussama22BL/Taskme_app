import React, { useState } from 'react';
import { Bell, Search, Menu, X, LogOut, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Note: Si tu n'as pas encore fait le SocketContext, 
  // tu peux charger les notifs via un useEffect ici.
  const [notifications, setNotifications] = useState<any[]>([]); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (id: string) => {
    try {
      // Optionnel: Appel API backend pour marquer comme lu
      // await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full">
      <div className="px-6 py-3 flex items-center justify-between">
        
        {/* Menu Mobile Toggle */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Barre de Recherche */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Droite : Notifs + Profil */}
        <div className="flex items-center gap-2">
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              className="p-2 hover:bg-slate-100 rounded-full relative transition"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                  <span className="font-bold text-sm">Notifications</span>
                  <button className="text-xs text-indigo-600 font-semibold">Tout marquer comme lu</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-8 text-center text-slate-400 text-sm">Aucune notification</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} onClick={() => markAsRead(n._id)} className="p-4 border-b hover:bg-slate-50 cursor-pointer">
                        <p className="text-sm text-slate-800">{n.message}</p>
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
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.prenom?.charAt(0)}
                {user?.nom?.charAt(0)}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2">
                <div className="px-4 py-3 border-b border-slate-100 mb-2">
                  <p className="text-sm font-bold text-slate-900">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                  <UserCircle className="w-4 h-4" /> Mon Profil
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                  <Settings className="w-4 h-4" /> Paramètres
                </button>
                <hr className="my-2 border-slate-100" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg font-semibold"
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