import { useUi } from "../../context/UiContext";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../utils/constants";
import { useChat } from "../../context/ChatContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { collapsed } = useUi();
  const navigate = useNavigate();

  const adminMenu = [
    { path: "/admin", label: "Dashboard", icon: "📊", roles: ["superAdmin", "admin"] },
    { path: "/admin/users", label: "Gestion utilisateurs", icon: "👥", roles: ["superAdmin", "admin"] },
    { path: "/register", label: "Créer compte", icon: "➕", roles: ["superAdmin", "admin"] },
    { path: "/coordinator", label: "Gestion tâches", icon: "📋", roles: ["superAdmin", "admin", "user"] },
    { path: "/tasks", label: "Mes tâches", icon: "✅", roles: ["user", "admin", "superAdmin"] },
    { path: "/profile", label: "Mon profil", icon: "👤", roles: ["user", "admin", "superAdmin"] },
    { path: "/vehicles", label: "Véhicules", icon: "🚗", roles: ["superAdmin", "admin", "user"] },
    { path: "/reports", label: "Rapports", icon: "📈", roles: ["superAdmin", "admin", "user"] },
    { path: "/settings", label: "Paramètres", icon: "⚙️", roles: ["superAdmin"] },
  ];

  const userMenu = [
    { path: "/tasks", label: "Mes tâches", icon: "✅", roles: ["user", "admin", "superAdmin"] },
    { path: "/profile", label: "Mon profil", icon: "👤", roles: ["user", "admin", "superAdmin"] },
    { path: "/history", label: "Historique", icon: "📜", roles: ["user", "admin", "superAdmin"] },
    { path: "/messages", label: "Messages", icon: "💬", roles: ["user", "admin", "superAdmin"] },
  ];

  // Filtrer le menu selon le rôle
  // Admin menu entries are filtered by role; regular users also see the `userMenu` items
  const menuItems = adminMenu.filter(item => item.roles.includes(user?.role || ""))
    .concat(user?.role === "user" ? userMenu : []);


  const { openWidget } = useChat();

  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div className="user-info">
            <h4>{user?.prenom} {user?.nom}</h4>
            <p className="user-role">{ROLE_LABELS[user?.role || ''] || user?.role}</p>
            <p className="user-grade">Grade {user?.grade}</p>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              {item.path === '/messages' ? (
                <button className="nav-link button-like" onClick={() => openWidget()}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              ) : (
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => 
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
          <span className="logout-icon">🚪</span>
          {!collapsed && <span>Déconnexion</span>}
        </button>
        <div className="sidebar-version">
          <small>TaskMe v1.0</small>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


