import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "./Register.css";
import { useAuth } from "../context/AuthContext";
import UserForm from "../components/users/UserForm";

const Register = () => {
  const navigate = useNavigate();
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  const handleRegister = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await authService.register({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        password: data.password,
        role: data.role as "admin" | "user",
        specialite: data.specialite,
        grade: data.grade,
      });

      if (resp?.token && resp?.user) {
        localStorage.setItem("token", resp.token);
        localStorage.setItem("user", JSON.stringify(resp.user));
        if (resp.user.role === "admin" || resp.user.role === "superAdmin") {
          navigate("/admin");
        } else {
          navigate("/tasks");
        }
        window.location.reload();
      } else {
        setError("Inscription: réponse inattendue du serveur");
      }
    } catch (err: any) {
      console.error("Erreur lors de l'inscription:", err);
      const msg = err?.response?.data?.message || err?.message || "Erreur lors de l'inscription. Veuillez réessayer.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
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

        <div className="register-form">
          <UserForm
            mode="create"
            includeRole={!!currentUser}
            allowedRoles={currentUser?.role === 'superAdmin' ? ["user","admin","superAdmin"] : ["user"]}
            onSubmit={handleRegister}
          />
          {error && <div className="form-error">{error}</div>}
        </div>

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
