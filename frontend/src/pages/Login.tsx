import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }
    
    try {
      const user = await login(email, password);
      // Rediriger selon le rôle
      if (user?.role === 'admin' || user?.role === 'superAdmin') {
        navigate('/admin');
      } else if (user?.role === 'coordinator') {
        navigate('/coordinator');
      } else {
        navigate('/tasks');
      }
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      setError(
        err.message || 
        err.response?.data?.message || 
        "Échec de la connexion. Vérifiez vos identifiants."
      );
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">TaskMe</h1>
          <p className="login-subtitle">Connexion à votre compte</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          
          <div className="login-footer">
            <p>
              Pas de compte ?{" "}
              <a 
                href="/register" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
              >
                S'inscrire
              </a>
            </p>
            <p>
              <a 
                href="/register-public" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register-public");
                }}
              >
                Créer un compte utilisateur
              </a>
            </p>
          </div>
        </form>
        
        <div className="demo-credentials">
          <h4>Démonstration :</h4>
          <p>Admin: admin@example.com / password123</p>
          <p>Coordinateur: coord@example.com / password123</p>
          <p>Utilisateur: user@example.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;