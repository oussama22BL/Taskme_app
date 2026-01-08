import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ["user", "coordinator", "admin", "superAdmin"],
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
        <div>Chargement...</div>
      </div>
    );
  }

  // Si non authentifié, rediriger
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Non authentifié");
    return <Navigate to={redirectTo} replace />;
  }

  // Vérifier si le rôle est autorisé
  if (user?.role && !allowedRoles.includes(user.role)) {
    console.log(`ProtectedRoute: Rôle non autorisé. Rôle: ${user.role}`);
    
    // Rediriger selon le rôle
    if (user.role === "admin" || user.role === "superAdmin") {
      return <Navigate to="/admin" replace />;
    } else if (user.role === "coordinator") {
      return <Navigate to="/coordinator" replace />;
    }
    
    return <Navigate to="/" replace />;
  }

  // Si autorisé, afficher le contenu
  return <>{children}</>;
};

export default ProtectedRoute;