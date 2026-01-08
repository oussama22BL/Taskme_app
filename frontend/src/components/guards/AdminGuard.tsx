import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
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
        <div>Chargement...</div>
      </div>
    );
  }

  // Si non authentifié, rediriger vers login
  if (!isAuthenticated) {
    console.log("Non authentifié, redirection vers /login");
    return <Navigate to="/login" replace />;
  }

  // Vérifier si l'utilisateur est admin ou superAdmin
  const isAdmin = user?.role === "admin" || user?.role === "superAdmin";
  
  if (!isAdmin) {
    console.log(`Accès refusé. Rôle: ${user?.role}, Redirection selon le rôle`);
    
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

export default AdminGuard;