import React, { createContext, useState, useContext, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: "superAdmin" | "admin" | "user";
  specialite: string;
  grade: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
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
    // Charger l'utilisateur depuis localStorage au démarrage
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  });
  
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const login = async (email: string, password: string) => {
    try {
      // Simulation de connexion - REMPLACER PAR API RÉELLE
      // mark password as intentionally unused for now
      void password;
      console.log("Login attempt:", { email });
      
      const mockUser: User = {
        id: "1",
        email: email || "demo@taskme.com",
        nom: "Utilisateur",
        prenom: "Test",
        role: "admin", // Change selon besoin: "user", "admin", "superAdmin"
        specialite: "pédagogique",
        grade: "A",
      };
      
      const mockToken = "mock-jwt-token-" + Date.now();

      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("token", mockToken);
      
      setUser(mockUser);
      setToken(mockToken);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Login error:", error);
      return Promise.reject(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
