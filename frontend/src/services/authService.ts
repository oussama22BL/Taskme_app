import api from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: "admin" | "user";
  specialite: string;
  grade: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: string;
    specialite: string;
    grade: string;
  };
}

export const authService = {
  // Connexion
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  // Inscription (pour les admins)
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response.data;
  },

  // Vérification du token
  verifyToken: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>("/auth/verify");
    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem("token");
  },

  // Mot de passe oublié
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Réinitialisation du mot de passe
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/reset-password", { token, newPassword });
    return response.data;
  },
};

export default authService;
