// context/AuthContext.tsx - Version corrigée
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { authService } from "../services/authService";

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: "superAdmin" | "admin" | "user" | "coordinator";
  specialite: string;
  grade: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>; // Retourne User
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  });
  
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        // Mettre en place l'état local avant la vérification pour s'assurer que
        // l'entête Authorization est présent (si on utilise un intercepteur axios)
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // ignore parse errors
        }

        try {
          // Vérifie si le token est toujours valide
          const resp = await authService.verifyToken();
          if (resp?.token && resp?.user) {
            // Mettre à jour avec la version renvoyée par le serveur (rafraîchir si besoin)
            setToken(resp.token);
            setUser(resp.user);
            localStorage.setItem('token', resp.token);
            localStorage.setItem('user', JSON.stringify(resp.user));
          } else {
            // Token invalide, déconnexion
            handleCleanup();
          }
        } catch (error: any) {
          console.error("Token verification failed:", error.response?.status, error.message || error);
          handleCleanup();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleCleanup = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const resp = await authService.login({ email, password });
      if (resp?.token && resp?.user) {
        localStorage.setItem("token", resp.token);
        localStorage.setItem("user", JSON.stringify(resp.user));
        setToken(resp.token);
        setUser(resp.user);
        return resp.user; // Retourne l'utilisateur pour la navigation
      }
      throw new Error('Réponse invalide du serveur');
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    handleCleanup();
    window.location.href = "/login"; // OK pour logout
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
