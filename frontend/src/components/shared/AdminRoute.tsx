import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  redirectTo = "/login" 
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Pendant le chargement
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Chargement des autorisations...</div>
      </div>
    );
  }

  // Si non authentifié, rediriger vers la route fournie
  if (!isAuthenticated) {
    console.log(`AdminRoute: Non authentifié, redirection vers ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  // Vérifier si l'utilisateur est admin ou superAdmin
  const isAdmin = user?.role === "admin" || user?.role === "superAdmin";
  
  if (!isAdmin) {
    console.log(`AdminRoute: Accès refusé. Rôle: ${user?.role}`);
    
    // Rediriger selon le rôle
    if (user?.role === "coordinator") {
      return <Navigate to="/coordinator" replace />;
    }
    
    // Pour les utilisateurs normaux
    return <Navigate to="/tasks" replace />;
  }

  // Si admin, afficher le contenu
  return <>{children}</>;
};

export default AdminRoute;