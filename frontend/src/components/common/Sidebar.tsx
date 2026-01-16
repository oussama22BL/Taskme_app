import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Car,
  History,
  Bell,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Correction: Vérifier admin OU superAdmin
  const isAdmin = user?.role === 'admin' ;
  const isSuperAdmin = user?.role === 'superAdmin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const superAdminNavItems = [
    { path: '/super-admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/super-admin/accounts', icon: UserIcon, label: 'Gestion Comptes' },
    { path: '/super-admin/tasks', icon: FileText, label: 'Gestion Tâches' },
    { path: '/admin/assignments', icon: ShieldCheck, label: 'Affectations' },
    { path: '/admin/vehicles', icon: Car, label: 'Parc Automobile' },
    { path: '/admin/history', icon: History, label: 'Historique Global' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/admin/tasks', icon: FileText, label: 'Gestion Tâches' },
    { path: '/admin/assignments', icon: ShieldCheck, label: 'Affectations' },
    { path: '/admin/vehicles', icon: Car, label: 'Parc Automobile' },
    { path: '/admin/history', icon: History, label: 'Historique Global' },
  ];

  const userNavItems = [
    { path: '/user/missions', icon: FileText, label: 'Mes Missions' },
    { path: '/user/notifications', icon: Bell, label: 'Notifications' },
    { path: '/user/history', icon: History, label: 'Mon Historique' },
  ];

  let navItems;
  if (isSuperAdmin) {
    navItems = superAdminNavItems;
  } else if (isAdmin) {
    navItems = adminNavItems;
  } else {
    navItems = userNavItems;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 w-64 border-r border-slate-800 flex-shrink-0">
      
      {/* HEADER : Logo */}
      <div className="p-8">
        <div className="flex justify-center items-center gap-3">
          <img src="/Taskme_logo.png" alt="Logo" className="w-20 h-20"  />
          {/*<div>
            <h1 className="text-xl font-bold tracking-tight text-white">Taskme</h1>
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">Audit System</p>
          </div>*/}
        </div>
      </div>

      {/* USER PROFILE CARD */}
      <div className="px-4 mb-6">
        <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 text-indigo-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate text-white">{user?.nom} {user?.prenom}</p>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded uppercase font-bold">
                {user?.role === 'superAdmin' ? 'Administrateur' : user?.role === 'admin' ? 'Coordinnateur' : 'Auditeur'}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-700/50 pt-2">
            <span>Grade: <b className="text-slate-300">{user?.grade || 'N/A'}</b></span>
            <span className="truncate ml-2">{user?.specialite}</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide no-scrollbar">
        <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;