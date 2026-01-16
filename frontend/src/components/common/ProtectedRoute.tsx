import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'user' |'superAdmin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  // 1. Attendre la fin de la lecture du LocalStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 2. Si pas connecté -> Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

// 3. Vérification des rôles (Admin et superAdmin sont autorisés sur les routes 'admin')
  const userRole = user?.role;
  const isAuthorizedAdmin = role === 'admin' && (userRole === 'admin' || userRole === 'superAdmin');
  const isAuthorizedSuperAdmin = role === 'superAdmin' && userRole === 'superAdmin';
  const isAuthorizedUser = role === 'user' && userRole === 'user';

  const isAuthorized = !role || isAuthorizedAdmin || isAuthorizedSuperAdmin || isAuthorizedUser;


  // Si un rôle est requis mais que l'utilisateur n'a pas le bon
  if (!isAuthorized) {
    let redirectPath = '/user/missions';
    
    if (userRole === 'superAdmin') {
      redirectPath = '/super-admin/accounts'; // Sa page principale
    } else if (userRole === 'admin') {
      redirectPath = '/admin/dashboard';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;