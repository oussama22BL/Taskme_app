import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTasks: 0,
    completedTasks: 0,
    pendingAssignments: 0,
    totalRevenue: 0,
    averageAcceptanceRate: 0
  });

  useEffect(() => {
    // Simuler des données de stats
    setStats({
      totalUsers: 156,
      activeTasks: tasks.filter(t => t.status === "ouverte" || t.status === "affectée").length,
      completedTasks: tasks.filter(t => t.status === "clôturée").length,
      pendingAssignments: 12,
      totalRevenue: 45800,
      averageAcceptanceRate: 92
    });
  }, [tasks]);

  const handleCreateAccount = () => {
    navigate("/register");
  };

  const handleManageUsers = () => {
    navigate('/users');
  };

  const handleSystemSettings = () => {
    alert("Paramètres système - À implémenter");
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />
        
        <main className="main-content-area">
          {/* En-tête */}
          <div className="content-header">
            <div className="header-title-section">
              <h1 className="dashboard-title">Tableau de bord Administrateur</h1>
              <div className="user-welcome-info">
                <span className="welcome-text">Bienvenue,</span>
                <span className="user-name-highlight">{user?.prenom} {user?.nom}</span>
                <span className="separator">|</span>
                <span className="role-label">Rôle:</span>
                <span className="user-role-tag">{user?.role}</span>
                <span className="separator">|</span>
                <span className="grade-label">Grade:</span>
                <span className="user-grade">{user?.grade}</span>
              </div>
            </div>
            <div className="header-action-section">
              <button 
                className="action-button primary-action" 
                onClick={() => navigate("/register")}
              >
                <span className="button-icon">+</span>
                <span className="button-text">Nouvel utilisateur</span>
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="statistics-section">
            <div className="stats-grid-layout">
              <div className="stat-card stat-card-users">
                <div className="stat-card-icon">👥</div>
                <div className="stat-card-content">
                  <h3 className="stat-number">{stats.totalUsers}</h3>
                  <p className="stat-label">Utilisateurs</p>
                </div>
              </div>
              
              <div className="stat-card stat-card-tasks">
                <div className="stat-card-icon">📋</div>
                <div className="stat-card-content">
                  <h3 className="stat-number">{stats.activeTasks}</h3>
                  <p className="stat-label">Tâches actives</p>
                </div>
              </div>
              
              <div className="stat-card stat-card-completed">
                <div className="stat-card-icon">✅</div>
                <div className="stat-card-content">
                  <h3 className="stat-number">{stats.completedTasks}</h3>
                  <p className="stat-label">Tâches terminées</p>
                </div>
              </div>
              
              <div className="stat-card stat-card-pending">
                <div className="stat-card-icon">⏰</div>
                <div className="stat-card-content">
                  <h3 className="stat-number">{stats.pendingAssignments}</h3>
                  <p className="stat-label">Affectations en attente</p>
                </div>
              </div>
              
              <div className="stat-card stat-card-revenue">
                <div className="stat-card-icon">💰</div>
                <div className="stat-card-content">
                  <h3 className="stat-number">{stats.totalRevenue.toLocaleString()} DH</h3>
                  <p className="stat-label">Revenu total</p>
                </div>
              </div>
              
              <div className="stat-card stat-card-acceptance">
                <div className="stat-card-icon">📊</div>
                <div className="stat-card-content">
                  <h3 className="stat-number">{stats.averageAcceptanceRate}%</h3>
                  <p className="stat-label">Taux d'acceptation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="quick-actions-section">
            <h2 className="section-title">Actions rapides</h2>
            <div className="actions-grid-layout">
              <button className="quick-action-card" onClick={handleCreateAccount}>
                <div className="action-icon-wrapper">
                  <span className="action-icon">➕</span>
                </div>
                <span className="action-title">Créer un compte</span>
              </button>
              
              <button className="quick-action-card" onClick={handleManageUsers}>
                <div className="action-icon-wrapper">
                  <span className="action-icon">👥</span>
                </div>
                <span className="action-title">Gérer les utilisateurs</span>
              </button>
              
              <button className="quick-action-card" onClick={() => navigate("/coordinator")}>
                <div className="action-icon-wrapper">
                  <span className="action-icon">📋</span>
                </div>
                <span className="action-title">Voir les tâches</span>
              </button>
              
              <button className="quick-action-card" onClick={handleSystemSettings}>
                <div className="action-icon-wrapper">
                  <span className="action-icon">⚙️</span>
                </div>
                <span className="action-title">Paramètres système</span>
              </button>
              
              <button className="quick-action-card" onClick={() => navigate('/reports')}>
                <div className="action-icon-wrapper">
                  <span className="action-icon">📈</span>
                </div>
                <span className="action-title">Générer rapports</span>
              </button>
              
              <button className="quick-action-card" onClick={() => alert("Audit - À implémenter")}>
                <div className="action-icon-wrapper">
                  <span className="action-icon">🔍</span>
                </div>
                <span className="action-title">Audit système</span>
              </button>
            </div>
          </div>

          {/* Dernières activités */}
          <div className="recent-activities-section">
            <h2 className="section-title">Activités récentes</h2>
            <div className="activities-list-container">
              <div className="activity-item">
                <div className="activity-icon activity-icon-success">✓</div>
                <div className="activity-content">
                  <p className="activity-description">
                    <strong>Ahmed Ali</strong> a accepté la tâche "Formation React"
                  </p>
                  <span className="activity-time">Il y a 2 heures</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon activity-icon-warning">⚠</div>
                <div className="activity-content">
                  <p className="activity-description">
                    <strong>Fatima Zahra</strong> a refusé une tâche avec justificatif
                  </p>
                  <span className="activity-time">Il y a 4 heures</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon activity-icon-info">🔄</div>
                <div className="activity-content">
                  <p className="activity-description">
                    <strong>Karim Benjelloun</strong> a délégué une tâche à <strong>Leila Mansouri</strong>
                  </p>
                  <span className="activity-time">Il y a 6 heures</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon activity-icon-primary">➕</div>
                <div className="activity-content">
                  <p className="activity-description">
                    Nouvelle tâche créée: "Audit pédagogique - Casablanca"
                  </p>
                  <span className="activity-time">Il y a 1 jour</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;