// HomePage.tsx - Page d'accueil extraite de App.tsx
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

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
          
          <div className="feature">
            <div className="feature-icon">🚗</div>
            <h3>Gestion des véhicules</h3>
            <p>Parc automobile et affectations</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🔔</div>
            <h3>Notifications</h3>
            <p>Alertes en temps réel et emails</p>
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
            
            <div className="preview-card">
              <div className="preview-icon vehicles">🚗</div>
              <h4>Véhicules</h4>
              <p>Gestion du parc automobile</p>
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
        <p>Version démonstration - Système complet de gestion des tâches</p>
      </footer>
    </div>
  );
};

export default HomePage;