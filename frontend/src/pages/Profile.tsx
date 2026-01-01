import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import "./Profile.css";

interface ProfileData {
  nom: string;
  prenom: string;
  email: string;
  specialite: string;
  grade: string;
  anciennete: string;
  diplomes: string[];
  formations: string[];
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    nom: "",
    prenom: "",
    email: "",
    specialite: "",
    grade: "",
    anciennete: "",
    diplomes: [],
    formations: [],
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        specialite: user.specialite || "pédagogique",
        grade: user.grade || "A",
        anciennete: "2020-01-15",
        diplomes: ["Licence", "Master"],
        formations: ["React Avancé", "Node.js", "MongoDB"],
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      // Simulation d'appel API
      console.log("Profil sauvegardé:", profileData);
      
      // Ici, vous feriez l'appel API réel
      // await updateProfile(profileData);
      
      setIsEditing(false);
      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Une erreur est survenue lors de la sauvegarde.");
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        specialite: user.specialite || "pédagogique",
        grade: user.grade || "A",
        anciennete: "2020-01-15",
        diplomes: ["Licence", "Master"],
        formations: ["React Avancé", "Node.js", "MongoDB"],
      });
    }
    setIsEditing(false);
  };

  const handleAddDiplome = () => {
    setProfileData({
      ...profileData,
      diplomes: [...profileData.diplomes, "Nouveau diplôme"]
    });
  };

  const handleRemoveDiplome = (index: number) => {
    const newDiplomes = profileData.diplomes.filter((_, i) => i !== index);
    setProfileData({...profileData, diplomes: newDiplomes});
  };

  const handleDiplomeChange = (index: number, value: string) => {
    const newDiplomes = [...profileData.diplomes];
    newDiplomes[index] = value;
    setProfileData({...profileData, diplomes: newDiplomes});
  };

  const handleAddFormation = () => {
    setProfileData({
      ...profileData,
      formations: [...profileData.formations, "Nouvelle formation"]
    });
  };

  const handleRemoveFormation = (index: number) => {
    const newFormations = profileData.formations.filter((_, i) => i !== index);
    setProfileData({...profileData, formations: newFormations});
  };

  const handleFormationChange = (index: number, value: string) => {
    const newFormations = [...profileData.formations];
    newFormations[index] = value;
    setProfileData({...profileData, formations: newFormations});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getInitials = () => {
    return `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`;
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />
        
        <main className="main-content-area">
          <div className="profile-header">
            <h1>Mon Profil</h1>
            <div className="header-actions">
              {isEditing ? (
                <>
                  <button 
                    className="btn-secondary"
                    onClick={handleCancel}
                  >
                    Annuler
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleSave}
                  >
                    Sauvegarder
                  </button>
                </>
              ) : (
                <button 
                  className="btn-edit"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="icon-edit"></i>
                  Modifier le profil
                </button>
              )}
            </div>
          </div>
          
          <div className="profile-info">
            {/* Carte principale du profil */}
            <div className="profile-card">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  {getInitials()}
                </div>
                <h2>{user?.prenom} {user?.nom}</h2>
                <p className="role-badge">{user?.role}</p>
              </div>
              
              <div className="profile-details">
                <div className="detail-row">
                  <strong>Email:</strong>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="profile-input"
                      placeholder="exemple@email.com"
                    />
                  ) : (
                    <span className="profile-value">{profileData.email}</span>
                  )}
                </div>
                
                <div className="detail-row">
                  <strong>Spécialité:</strong>
                  {isEditing ? (
                    <select
                      value={profileData.specialite}
                      onChange={(e) => setProfileData({...profileData, specialite: e.target.value})}
                      className="profile-select"
                    >
                      <option value="pédagogique">Pédagogique</option>
                      <option value="orientation">Orientation</option>
                      <option value="planification">Planification</option>
                      <option value="financier">Services financiers</option>
                      <option value="administratif">Administratif</option>
                    </select>
                  ) : (
                    <span className="profile-value">{profileData.specialite}</span>
                  )}
                </div>
                
                <div className="detail-row">
                  <strong>Grade:</strong>
                  {isEditing ? (
                    <select
                      value={profileData.grade}
                      onChange={(e) => setProfileData({...profileData, grade: e.target.value})}
                      className="profile-select"
                    >
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                      <option value="D">Grade D</option>
                    </select>
                  ) : (
                    <span className="profile-value">Grade {profileData.grade}</span>
                  )}
                </div>
                
                <div className="detail-row">
                  <strong>Ancienneté:</strong>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.anciennete}
                      onChange={(e) => setProfileData({...profileData, anciennete: e.target.value})}
                      className="profile-input"
                    />
                  ) : (
                    <span className="profile-value">{formatDate(profileData.anciennete)}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Section Diplômes */}
            <div className="profile-section">
              <div className="section-header">
                <h3><i className="icon-diploma"></i> Diplômes</h3>
                {isEditing && (
                  <button 
                    className="btn-icon"
                    onClick={handleAddDiplome}
                    title="Ajouter un diplôme"
                  >
                    <i className="icon-add"></i>
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="editable-list">
                  {profileData.diplomes.map((diplome, index) => (
                    <div key={index} className="list-item">
                      <input
                        type="text"
                        value={diplome}
                        onChange={(e) => handleDiplomeChange(index, e.target.value)}
                        className="list-input"
                        placeholder="Nom du diplôme"
                      />
                      <button 
                        className="btn-remove"
                        onClick={() => handleRemoveDiplome(index)}
                        title="Supprimer ce diplôme"
                        type="button"
                      >
                        <i className="icon-close"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="btn-add"
                    onClick={handleAddDiplome}
                    type="button"
                  >
                    <i className="icon-add"></i> Ajouter un diplôme
                  </button>
                </div>
              ) : (
                <ul className="profile-list">
                  {profileData.diplomes.map((diplome, index) => (
                    <li key={index} className="list-item-display">
                      <i className="icon-check"></i>
                      {diplome}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Section Formations */}
            <div className="profile-section">
              <div className="section-header">
                <h3><i className="icon-formation"></i> Formations suivies</h3>
                {isEditing && (
                  <button 
                    className="btn-icon"
                    onClick={handleAddFormation}
                    title="Ajouter une formation"
                  >
                    <i className="icon-add"></i>
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="editable-list">
                  {profileData.formations.map((formation, index) => (
                    <div key={index} className="list-item">
                      <input
                        type="text"
                        value={formation}
                        onChange={(e) => handleFormationChange(index, e.target.value)}
                        className="list-input"
                        placeholder="Nom de la formation"
                      />
                      <button 
                        className="btn-remove"
                        onClick={() => handleRemoveFormation(index)}
                        title="Supprimer cette formation"
                        type="button"
                      >
                        <i className="icon-close"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    className="btn-add"
                    onClick={handleAddFormation}
                    type="button"
                  >
                    <i className="icon-add"></i> Ajouter une formation
                  </button>
                </div>
              ) : (
                <ul className="profile-list">
                  {profileData.formations.map((formation, index) => (
                    <li key={index} className="list-item-display">
                      <i className="icon-certificate"></i>
                      {formation}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Section Statistiques */}
            <div className="profile-section profile-stats">
              <h3><i className="icon-stats"></i> Mes statistiques</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">
                    <i className="icon-tasks"></i>
                  </div>
                  <strong>Tâches accomplies</strong>
                  <p className="stat-number">42</p>
                  <span className="stat-label">+5 cette semaine</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <i className="icon-acceptance"></i>
                  </div>
                  <strong>Taux d'acceptation</strong>
                  <p className="stat-number">95%</p>
                  <span className="stat-label">Excellent</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <i className="icon-payment"></i>
                  </div>
                  <strong>Tâches rémunérées</strong>
                  <p className="stat-number">28</p>
                  <span className="stat-label">Total: 12,500 DH</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <i className="icon-hours"></i>
                  </div>
                  <strong>Heures totales</strong>
                  <p className="stat-number">320h</p>
                  <span className="stat-label">Moyenne: 20h/semaine</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;