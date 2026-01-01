import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { useSettings } from "@/context/SettingsContext";
import { useUsers } from "@/context/UsersContext";

const Register = () => {
  const navigate = useNavigate();
  
  const { specialites: availableSpecialites, grades: availableGrades } = useSettings();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "user",
    specialite: "",
    grade: ""
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    general: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addUser } = useUsers();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    let isValid = true;

    // Validation nom/prenom
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
      isValid = false;
    }
    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
      isValid = false;
    }

    // Validation du nom d'utilisateur
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
      isValid = false;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }

    // Validation du mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
      isValid = false;
    }

    // Validation de la confirmation du mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      isValid = false;
    }

    // Validation du téléphone (optionnel)
    if (formData.phone && !/^[\d\s+\-()]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Numéro de téléphone invalide";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors(prev => ({ ...prev, general: "" }));

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add user to local UsersContext (persisted mock)
      addUser({
        id: Date.now().toString(),
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role as any,
        grade: formData.grade || undefined,
        specialite: formData.specialite || undefined,
        acceptanceRate: 0,
      });

      // Simulation de succès
      alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      navigate("/login");
      
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setErrors(prev => ({
        ...prev,
        general: "Erreur lors de l'inscription. Veuillez réessayer."
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">TaskMe</div>
          <h1 className="register-title">Créer un compte</h1>
          <p className="register-subtitle">
            Rejoignez notre plateforme de gestion de tâches
          </p>
          <p className="register-hint">(mention d'utilisation *@associoappeuil78@gmail)</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email <span className="required-star">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="info@example.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe <span className="required-star">*</span>
            </label>
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Confirmer le mot de passe */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmer le mot de passe <span className="required-star">*</span>
            </label>
            <div className="password-input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* Téléphone */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Téléphone (optionnel)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="+33 1 23 45 67 89"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="specialite" className="form-label">Spécialité</label>
              <select
                id="specialite"
                name="specialite"
                value={formData.specialite}
                onChange={(e) => handleChange(e as any)}
                className="form-input"
              >
                <option value="">-- Sélectionner --</option>
                {availableSpecialites.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="grade" className="form-label">Grade</label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={(e) => handleChange(e as any)}
                className="form-input"
              >
                <option value="">-- Sélectionner --</option>
                {availableGrades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="divider">
            <span>ou</span>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className={`register-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        <div className="login-link-container">
          <a href="/login" className="login-link" onClick={(e) => { e.preventDefault(); handleLoginRedirect(); }}>
            Déjà un compte ? Se connecter
          </a>
        </div>

        <div className="terms">
          <p className="terms-text">
            En créant un compte, vous acceptez nos{" "}
            <a href="#" className="terms-link">Conditions d'utilisation</a>{" "}
            et notre{" "}
            <a href="#" className="terms-link">Politique de confidentialité</a>
          </p>
        </div>

        <div className="register-footer">
          <p className="copyright">© 2024 TaskMe. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
