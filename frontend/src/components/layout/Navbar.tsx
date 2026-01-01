// React import not needed with the new JSX transform
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import NotificationBell from "@components/notifications/NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={user ? (user.role === "user" ? "/tasks" : "/admin") : "/"}>
            <span className="brand-icon">📊</span>
            <span className="brand-text">TaskMe</span>
          </Link>
          <span className="brand-subtitle">Gestion intelligente des tâches</span>
        </div>
        
        {user && (
          <div className="navbar-menu">
            <div className="user-info">
              <span className="user-name">{user.prenom} {user.nom}</span>
              <span className="user-badge">{user.role}</span>
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


