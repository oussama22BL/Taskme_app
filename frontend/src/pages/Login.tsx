import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; // Import du fichier CSS séparé

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulation de connexion
      // REMPLACE CE CODE PAR L'APPEL API RÉEL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Pour le test, on accepte n'importe quelle connexion
      console.log("Connexion avec:", { email, password: "***" });
      
      // Stocker l'utilisateur mock dans localStorage
      const mockUser = {
        id: "1",
        email: email || "demo@taskme.com",
        nom: "Doe",
        prenom: "John",
        role: "admin", // Change pour tester différents rôles
        specialite: "pédagogique",
        grade: "A",
      };
      
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("token", "mock-jwt-token");
      
      // Redirection selon le rôle
      if (mockUser.role === "superAdmin" || mockUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/tasks");
      }
      
    } catch (err) {
      setError("Identifiants incorrects. Utilisez n'importe quels identifiants pour le test.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">TaskMe</div>
            <h1 className="login-title">Connexion</h1>
            <p className="login-subtitle">Application de gestion des tâches</p>
            <p className="login-tagline">Accédez à votre espace personnel</p>
          </div>

          <div className="divider"></div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="votre@email.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div className="password-input-group">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`form-input ${error ? 'error' : ''}`}
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => {}}
                >
                  Afficher
                </button>
              </div>
            </div>
            
            <div className="options-row">
              <label className="remember-me">
                <input type="checkbox" />
                Se souvenir de moi
              </label>
              <a href="#" className="forgot-password">
                Mot de passe oublié ?
              </a>
            </div>
            
            <button 
              type="submit" 
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
            
            <div className="demo-info">
              <h4>Mode démo</h4>
              <p>Utilisez n'importe quel email et mot de passe pour tester</p>
            </div>

            <div className="admin-section">
              <p className="admin-text">Vous êtes administrateur ?</p>
              <Link to="/register" className="admin-link">
                Créer un nouveau compte utilisateur
              </Link>
            </div>
          </form>

          <div className="login-footer">
            <p className="copyright">© 2025 TaskMe - Tous droits réservés</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;