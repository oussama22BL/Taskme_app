import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const RegisterPublic = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    specialite: "pédagogique",
    grade: "A",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const resp = await authService.register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'user' | 'admin' | 'coordinator',
        specialite: formData.specialite,
        grade: formData.grade,
      });

      if (resp?.token && resp?.user) {
        // Store token & user and redirect
        localStorage.setItem('token', resp.token);
        localStorage.setItem('user', JSON.stringify(resp.user));
        setSuccess('Compte créé et connecté');
        setTimeout(() => {
          if (resp.user.role === 'coordinator') {
            navigate('/admin');
          } else if (resp.user.role === 'admin' || resp.user.role === 'superAdmin') {
            navigate('/admin');
          } else {
            navigate('/admin');
          }
          window.location.reload();
        }, 800);
      } else {
        setError('Réponse inattendue du serveur');
      }
    } catch (err: any) {
      console.error('Erreur création compte:', err);
      if (err?.response?.status === 403) {
        setError("Seul un administrateur peut créer des comptes 'admin' ou 'coordinateur'.");
      } else {
        const msg = err?.response?.data?.msg || err?.response?.data?.message || err?.message || 'Erreur lors de la création du compte';
        setError(msg);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-header">
            <h1 className="login-title">TaskMe</h1>
            <p className="login-subtitle">Création de compte</p>
            <p className="login-description">(Version de test - sans authentification)</p>
            <p className="login-hint" style={{ color: '#555' }}>
              <strong>Remarque :</strong> Les inscriptions publiques créent des comptes de type <strong>Utilisateur</strong>. Pour obtenir un compte <em>admin</em> ou <em>coordinator</em>, contactez un administrateur.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-row">
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required
                  placeholder="Doe"
                />
              </div>
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  required
                  placeholder="John"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="john.doe@example.com"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Confirmer *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            {/* Inscription publique: le rôle est forcé à 'user' côté client pour éviter les 403 du serveur */}

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/login")}
              >
                Retour à la connexion
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Créer le compte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPublic;