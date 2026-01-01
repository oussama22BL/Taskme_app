import type { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import { TaskProvider } from "./context/TaskContext";
import { UsersProvider } from "./context/UsersContext";
import { SettingsProvider } from "./context/SettingsContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ChatProvider } from "./context/ChatContext";
import ChatWidget from "./components/chat/ChatWidget";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Vehicles from "./pages/Vehicles";
import Reports from "./pages/Reports";
import UsersManagement from "./pages/UsersManagement";
import Settings from "./pages/Settings.tsx";
import AssignByGrade from "./pages/AssignByGrade";
import CoordinatorTasks from "./pages/CoordinatorTasks";
import MyTasks from "./pages/MyTasks";
import Profile from "./pages/Profile";
import "./App.css";

// Route protégée - vérifie si l'utilisateur est connecté
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// Route admin - vérifie les droits admin
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/" />;
  }

  if (user.role !== "admin" && user.role !== "superAdmin") {
    return <Navigate to="/tasks" />;
  }

  return <>{children}</>;
};

// Page d'accueil principale (non connectée)
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-content">
          <h1 className="home-title">TaskMe</h1>
          <p className="home-subtitle">Gestion intelligente des tâches collaboratives</p>
        </div>
        
        <nav className="home-nav">
          <button onClick={() => navigate("/login")} className="home-nav-btn">
            Connexion
          </button>
          <button onClick={() => navigate("/register")} className="home-nav-btn">
            Inscription
          </button>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="home-main">
        {/* Section principale */}
        <div className="hero-section">
          <div className="hero-content">
            <h2>Bienvenue sur TaskMe</h2>
            <p>La plateforme de gestion des tâches pour votre organisation</p>
            
            <div className="cta-buttons">
              <button onClick={() => navigate("/login")} className="cta-btn primary">
                Se connecter
              </button>
              <button onClick={() => navigate("/register")} className="cta-btn secondary">
                Créer un compte
              </button>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="features-section">
          <div className="feature">
            <div className="feature-icon">👑</div>
            <h3>Administration</h3>
            <p>Gestion complète des utilisateurs et tâches</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">📋</div>
            <h3>Coordination</h3>
            <p>Affectation et suivi des activités</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">✅</div>
            <h3>Suivi personnel</h3>
            <p>Gérez vos tâches et contributions</p>
          </div>
        </div>

        {/* Découvrir les fonctionnalités */}
        <div className="discover-section">
          <h3>Découvrez nos fonctionnalités :</h3>
          
          <div className="preview-cards">
            <div className="preview-card">
              <div className="preview-icon admin">👑</div>
              <h4>Espace Admin</h4>
              <p>Tableau de bord complet</p>
              <button 
                onClick={() => navigate("/login")} 
                className="preview-btn"
              >
                Accéder
              </button>
            </div>
            
            <div className="preview-card">
              <div className="preview-icon coordinator">📋</div>
              <h4>Coordination</h4>
              <p>Gestion des affectations</p>
              <button 
                onClick={() => navigate("/login")} 
                className="preview-btn"
              >
                Accéder
              </button>
            </div>
            
            <div className="preview-card">
              <div className="preview-icon tasks">✅</div>
              <h4>Mes Tâches</h4>
              <p>Suivi personnel</p>
              <button 
                onClick={() => navigate("/login")} 
                className="preview-btn"
              >
                Accéder
              </button>
            </div>
          </div>
          
          <p className="discover-note">
            <em>Connectez-vous pour accéder à toutes les fonctionnalités</em>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2024 TaskMe - Tous droits réservés</p>
        <p>Version démonstration</p>
      </footer>
    </div>
  );
};

// Composant App principal
function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <UsersProvider>
          <SettingsProvider>
        <NotificationProvider>
          <ChatProvider>
            <UIProvider>
            <Router>
              <div className="App">
                <Routes>
              {/* Page d'accueil (non connectée) */}
              <Route path="/" element={<HomePage />} />
              
              {/* Pages d'authentification */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Pages protégées */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route
                path="/vehicles"
                element={
                  <AdminRoute>
                    <Vehicles />
                  </AdminRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <AdminRoute>
                    <Reports />
                  </AdminRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <UsersManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <AdminRoute>
                    <Settings />
                  </AdminRoute>
                }
              />
              <Route
                path="/assign-by-grade"
                element={
                  <AdminRoute>
                    <AssignByGrade />
                  </AdminRoute>
                }
              />
              
              <Route 
                path="/coordinator" 
                element={
                  <ProtectedRoute>
                    <CoordinatorTasks />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <MyTasks />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirection par défaut */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            {/* Chat widget disponible globalement */}
            <ChatWidget />
          </div>
            </Router>
            </UIProvider>
          </ChatProvider>
        </NotificationProvider>
          </SettingsProvider>
        </UsersProvider>
      </TaskProvider>
    </AuthProvider>
  );
}



export default App;