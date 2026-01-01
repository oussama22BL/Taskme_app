// React import not needed with the new JSX transform
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Add a class to body so layout can react to sidebar open/close (desktop)
    if (open) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [open]);

  const adminMenu = [
    { path: "/admin", label: "Dashboard", icon: "📊", roles: ["superAdmin", "admin"] },
    { path: "/register", label: "Créer compte", icon: "➕", roles: ["superAdmin", "admin"] },
    { path: "/coordinator", label: "Gestion tâches", icon: "📋", roles: ["superAdmin", "admin", "user"] },
    { path: "/tasks", label: "Mes tâches", icon: "✅", roles: ["user", "admin", "superAdmin"] },
    { path: "/profile", label: "Mon profil", icon: "👤", roles: ["user", "admin", "superAdmin"] },
    { path: "/vehicles", label: "Véhicules", icon: "🚗", roles: ["superAdmin", "admin"] },
    { path: "/reports", label: "Rapports", icon: "📈", roles: ["superAdmin", "admin"] },
    { path: "/settings", label: "Paramètres", icon: "⚙️", roles: ["superAdmin"] },
  ];

  const userMenu = [
    { path: "/tasks", label: "Mes tâches", icon: "✅" },
    { path: "/profile", label: "Mon profil", icon: "👤" },
    { path: "/history", label: "Historique", icon: "📜" },
    { path: "/messages", label: "Messages", icon: "💬" },
  ];

  // Filtrer le menu selon le rôle
  const menuItems = user?.role === "user" 
    ? userMenu 
    : adminMenu.filter(item => item.roles.includes(user?.role || ""));

  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="hamburger" />
      </button>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div className="user-info">
            <h4>{user?.prenom} {user?.nom}</h4>
            <p className="user-role">{user?.role}</p>
            <p className="user-grade">Grade {user?.grade}</p>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => setOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn-sidebar" onClick={() => { setOpen(false); handleLogout(); }}>
          <span className="logout-icon">🚪</span>
          <span>Déconnexion</span>
        </button>
        <div className="sidebar-version">
          <small>TaskMe v1.0</small>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;


