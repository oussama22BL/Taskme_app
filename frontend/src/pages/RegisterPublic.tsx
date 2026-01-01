import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "@/context/UsersContext";
import { useSettings } from "@/context/SettingsContext";

const RegisterPublic = () => {
  // lists from Settings
  const { specialites: availableSpecialites, grades: availableGrades } = useSettings();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    specialite: availableSpecialites[0] || "",
    grade: availableGrades[0] || "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const { addUser } = useUsers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    // Persist new user via UsersContext
    addUser({
      id: Date.now().toString(),
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      role: 'user',
      specialite: formData.specialite,
      grade: formData.grade,
      acceptanceRate: 0,
    });

    setSuccess("Compte créé avec succès");
    console.log("Compte créé:", formData);
    
    // Redirection après 2 secondes
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-header">
            <h1 className="login-title">TaskMe</h1>
            <p className="login-subtitle">Création de compte</p>
            <p className="login-description">(Version de test - sans authentification)</p>
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

            <div className="form-row">
              <div className="form-group">
                <label>Spécialité</label>
                <select value={formData.specialite} onChange={(e) => setFormData({...formData, specialite: e.target.value})}>
                  {availableSpecialites.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Grade</label>
                <select value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})}>
                  {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            
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
