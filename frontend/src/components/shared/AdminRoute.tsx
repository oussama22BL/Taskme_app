import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Props {
  children: ReactNode;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || (user.role !== "admin" && user.role !== "superAdmin")) {
    // Non-admins are redirected to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
