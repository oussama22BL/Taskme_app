import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../utils/constants";
import { useUi } from "../../context/UiContext";
import NotificationBell from "../notifications/NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggleCollapsed } = useUi();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* 🔘 Bouton sidebar */}
        <button
          className={`navbar-toggle ${collapsed ? "collapsed" : ""}`}
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Ouvrir la barre" : "Réduire la barre"}
        >
          <span className="hamburger">☰</span>
        </button>

        <div className="navbar-brand">
          <Link to={user ? (user.role === "user" ? "/tasks" : "/admin") : "/"}>
            <span className="brand-icon">📊</span>
            <span className="brand-text">TaskMe</span>
          </Link>
          <span className="brand-subtitle">
            Gestion intelligente des tâches
          </span>
        </div>

        {user && (
          <div className="navbar-menu">
            <div className="user-info">
              <span className="user-name">
                {user.prenom} {user.nom}
              </span>
              <span className="user-badge">{ROLE_LABELS[user.role] || user.role}</span>
            </div>

            <div className="navbar-notifications">
              <NotificationBell />
            </div>

            <div className="navbar-actions">
              <button
                className="logout-btn"
                onClick={handleLogout}
                title="Déconnexion"
              >
                🚪
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
