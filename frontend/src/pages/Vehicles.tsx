// Vehicles.tsx - Gestion complète des véhicules
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VehicleForm from "../components/vehicles/VehicleForm";
import { Vehicle } from "../types/vehicle";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import Modal from "../components/shared/Modal";
import "./Vehicles.css";

// Vehicle type is imported from ../types/vehicle

// Interface pour les utilisateurs disponibles pour l'affectation
interface User {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  grade: string;
  specialite: string;
  direction?: string;
}

const Vehicles: React.FC = () => {
  // État pour les véhicules
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: "1",
      matricule: "12345-A-56",
      marque: "Toyota",
      modele: "Corolla",
      type: "Berline",
      carburant: "Essence",
      annee: 2022,
      kilometrage: 45000,
      couleur: "Blanc",
      etat: 'disponible',
      affectation: 'individuelle',
      affecteA: "Ahmed Ali",
      affecteId: "user1",
      dateAffectation: "2024-01-15",
      disponibilite: true,
      assurance: {
        numero: "AS123456789",
        dateExpiration: "2025-06-30",
        compagnie: "AXA Assurance"
      },
      dernierControle: "2024-03-15",
      prochainControle: "2024-09-15",
      capacite: 5,
      options: ["GPS", "Climatisation", "Camera de recul"]
    },
    {
      id: "2",
      matricule: "98765-B-12",
      marque: "Mercedes",
      modele: "Sprinter",
      type: "Utilitaire",
      carburant: "Diesel",
      annee: 2021,
      kilometrage: 85000,
      couleur: "Gris",
      etat: 'en_mission',
      affectation: 'partagee',
      affecteA: "Direction Formation",
      affecteId: "dir1",
      dateAffectation: "2024-02-01",
      disponibilite: false,
      assurance: {
        numero: "AS987654321",
        dateExpiration: "2024-12-31",
        compagnie: "Wafa Assurance"
      },
      dernierControle: "2024-02-28",
      prochainControle: "2024-08-28",
      capacite: 9,
      options: ["GPS", "Climatisation"]
    },
    {
      id: "3",
      matricule: "45678-C-34",
      marque: "Renault",
      modele: "Kangoo",
      type: "Utilitaire",
      carburant: "Essence",
      annee: 2023,
      kilometrage: 25000,
      couleur: "Bleu",
      etat: 'disponible',
      affectation: 'direction',
      affecteA: "Direction Régionale",
      affecteId: "dir2",
      dateAffectation: "2024-01-01",
      disponibilite: true,
      assurance: {
        numero: "AS456789123",
        dateExpiration: "2025-03-31",
        compagnie: "RMA Watanya"
      },
      dernierControle: "2024-04-10",
      prochainControle: "2024-10-10",
      capacite: 5,
      options: ["Climatisation"]
    }
  ]);

  // État pour les utilisateurs disponibles
  const [users] = useState<User[]>([
    { id: "user1", nom: "Ali", prenom: "Ahmed", role: "formateur", grade: "Expert", specialite: "Informatique", direction: "Direction Formation" },
    { id: "user2", nom: "Zahra", prenom: "Fatima", role: "jury", grade: "Senior", specialite: "Pédagogie", direction: "Direction Formation" },
    { id: "user3", nom: "Benjelloun", prenom: "Karim", role: "coordinateur", grade: "Manager", specialite: "Gestion", direction: "Direction Coordination" },
    { id: "user4", nom: "Mansouri", prenom: "Leila", role: "formateur", grade: "Expert", specialite: "Ressources Humaines", direction: "Direction RH" }
  ]);

  // États pour les modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [showAffectModal, setShowAffectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // États pour les filtres
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [affectationFilter, setAffectationFilter] = useState<string>('all');
  
  // État pour le nouveau véhicule
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    matricule: '',
    marque: '',
    modele: '',
    type: 'Berline',
    carburant: 'Essence',
    annee: new Date().getFullYear(),
    kilometrage: 0,
    couleur: '',
    etat: 'disponible',
    affectation: 'individuelle',
    disponibilite: true,
    assurance: {
      numero: '',
      dateExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      compagnie: ''
    },
    dernierControle: new Date().toISOString().split('T')[0],
    prochainControle: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    capacite: 5,
    options: []
  });

  // État pour l'affectation
  const [affectationData, setAffectationData] = useState({
    type: 'individuelle',
    userId: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    motif: ''
  });

  // Filtrer les véhicules
  const filteredVehicles = vehicles.filter(vehicle => {
    // Filtre par état
    if (filter !== 'all' && vehicle.etat !== filter) return false;
    
    // Filtre par type d'affectation
    if (affectationFilter !== 'all' && vehicle.affectation !== affectationFilter) return false;
    
    // Filtre par recherche
    if (searchTerm && 
        !vehicle.matricule.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !vehicle.marque.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !vehicle.modele.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(vehicle.affecteA && vehicle.affecteA.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  // Gérer la sauvegarde (ajout ou modification) d'un véhicule
  const handleSaveVehicle = (payload: Partial<Vehicle>) => {
    if (!payload.matricule || !payload.marque || !payload.modele) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (isEditingVehicle && payload.id) {
      setVehicles(vehicles.map(v => v.id === payload.id ? { ...v, ...(payload as Vehicle) } : v));
      setIsEditingVehicle(false);
      alert("Véhicule modifié avec succès !");
    } else {
      const vehicle: Vehicle = {
        ...(payload as Vehicle),
        id: Date.now().toString(),
        matricule: payload.matricule!,
        marque: payload.marque!,
        modele: payload.modele!,
        type: payload.type || 'Berline',
        carburant: payload.carburant || 'Essence',
        annee: payload.annee || new Date().getFullYear(),
        kilometrage: payload.kilometrage || 0,
        couleur: payload.couleur || '',
        etat: payload.etat || 'disponible',
        affectation: payload.affectation || 'individuelle',
        disponibilite: payload.disponibilite ?? (payload.etat === 'disponible'),
        assurance: payload.assurance || { numero: '', dateExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], compagnie: '' },
        dernierControle: payload.dernierControle || new Date().toISOString().split('T')[0],
        prochainControle: payload.prochainControle || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        capacite: payload.capacite || 5,
        options: payload.options || []
      };

      setVehicles([...vehicles, vehicle]);
      alert("Véhicule ajouté avec succès !");
    }

    setShowAddModal(false);
    resetNewVehicle();
  };

  // Gérer la modification d'un véhicule
  // Note: editing is handled by reusing the "add" modal with `isEditingVehicle` flag

  // Gérer la suppression d'un véhicule
  const handleDeleteVehicle = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      setVehicles(vehicles.filter(v => v.id !== id));
      alert("Véhicule supprimé avec succès !");
    }
  };

  // Gérer l'affectation d'un véhicule
  const handleAffectVehicle = () => {
    if (!selectedVehicle) return;
    
    if (affectationData.type === 'individuelle' && !affectationData.userId) {
      alert("Veuillez sélectionner un utilisateur");
      return;
    }

    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      affectation: affectationData.type as 'individuelle' | 'partagee' | 'direction',
      disponibilite: false,
      etat: 'en_mission',
      dateAffectation: affectationData.dateDebut,
      dateFinAffectation: affectationData.dateFin || undefined,
      affecteA: affectationData.type === 'individuelle' 
        ? users.find(u => u.id === affectationData.userId)?.prenom + ' ' + users.find(u => u.id === affectationData.userId)?.nom
        : affectationData.type === 'partagee' ? 'Partagé - ' + users.find(u => u.id === affectationData.userId)?.direction
        : 'Direction'
    };

    setVehicles(vehicles.map(v => 
      v.id === selectedVehicle.id ? updatedVehicle : v
    ));
    
    setShowAffectModal(false);
    setAffectationData({
      type: 'individuelle',
      userId: '',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: '',
      motif: ''
    });
    
    alert(`Véhicule ${selectedVehicle.matricule} affecté avec succès !`);
  };

  // Libérer un véhicule
  const handleReleaseVehicle = (id: string) => {
    setVehicles(vehicles.map(v => 
      v.id === id ? {
        ...v,
        etat: 'disponible',
        disponibilite: true,
        affecteA: undefined,
        affecteId: undefined,
        dateAffectation: undefined,
        dateFinAffectation: undefined
      } : v
    ));
    alert("Véhicule libéré avec succès !");
  };

  // Réinitialiser le formulaire nouveau véhicule
  const resetNewVehicle = () => {
    setNewVehicle({
      matricule: '',
      marque: '',
      modele: '',
      type: 'Berline',
      carburant: 'Essence',
      annee: new Date().getFullYear(),
      kilometrage: 0,
      couleur: '',
      etat: 'disponible',
      affectation: 'individuelle',
      disponibilite: true,
      assurance: {
        numero: '',
        dateExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        compagnie: ''
      },
      dernierControle: new Date().toISOString().split('T')[0],
      prochainControle: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
      capacite: 5,
      options: []
    });
  };

  // Obtenir la couleur selon l'état
  const getEtatColor = (etat: string) => {
    switch(etat) {
      case 'disponible': return '#10b981';
      case 'en_mission': return '#3b82f6';
      case 'en_maintenance': return '#f59e0b';
      case 'hors_service': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Obtenir le texte de l'affectation
  const getAffectationText = (affectation: string) => {
    switch(affectation) {
      case 'individuelle': return 'Individuelle';
      case 'partagee': return 'Partagée';
      case 'direction': return 'Direction';
      default: return affectation;
    }
  };

  // Obtenir les utilisateurs filtrés par direction (pour affectation partagée)
  const getUsersByDirection = () => {
    const directions = [...new Set(users.map(user => user.direction).filter(Boolean))];
    return directions;
  };

  // handle vehicle created from AddVehicle page (via navigate state)
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // if AddVehicle navigated here with state.newVehicle, add it
    const state: any = (location && (location as any).state) || {};
    if (state && state.newVehicle) {
      const nv = state.newVehicle as Vehicle;
      // ensure no duplicate id
      if (!vehicles.find(v => v.matricule === nv.matricule)) {
        setVehicles(prev => [...prev, { ...nv, id: Date.now().toString() }]);
      }
      // clear history state
      try { window.history.replaceState({}, document.title); } catch (e) {}
    }
  }, [location]);

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />
        
        <main className="main-content-area">
          {/* En-tête */}
          <div className="vehicles-header">
            <h1>Gestion des Véhicules</h1>
            <p>Gestion du parc automobile et des affectations</p>
            
            <div className="header-actions">
              <div className="add-vehicle-actions">
                <button 
                  className="btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <span className="button-icon">+</span>
                  Ajouter un véhicule
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => navigate('/vehicles/add')}
                >Ouvrir page d'ajout</button>
              </div>
              
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Rechercher par matricule, marque, affecté à..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                
                <div className="filter-group">
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Tous les états</option>
                    <option value="disponible">Disponible</option>
                    <option value="en_mission">En mission</option>
                    <option value="en_maintenance">En maintenance</option>
                    <option value="hors_service">Hors service</option>
                  </select>
                  
                  <select 
                    value={affectationFilter} 
                    onChange={(e) => setAffectationFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Tous les types</option>
                    <option value="individuelle">Individuelle</option>
                    <option value="partagee">Partagée</option>
                    <option value="direction">Direction</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Statistiques */}
          <div className="vehicles-stats">
            <div className="stat-card">
              <div className="stat-icon">🚗</div>
              <div className="stat-content">
                <h3>{vehicles.length}</h3>
                <p>Véhicules total</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{vehicles.filter(v => v.etat === 'disponible').length}</h3>
                <p>Disponibles</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <h3>{vehicles.filter(v => v.etat === 'en_mission').length}</h3>
                <p>En mission</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{vehicles.filter(v => v.affectation === 'partagee').length}</h3>
                <p>Partagés</p>
              </div>
            </div>
          </div>
          
          {/* Tableau des véhicules */}
          <div className="vehicles-table-container">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Marque/Modèle</th>
                  <th>Type</th>
                  <th>État</th>
                  <th>Affectation</th>
                  <th>Disponibilité</th>
                  <th>Kilométrage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>
                      <strong 
                        className="vehicle-matricule" 
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setShowDetailModal(true);
                        }}
                      >
                        {vehicle.matricule}
                      </strong>
                      <div className="vehicle-details">
                        {vehicle.annee} • {vehicle.couleur}
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-marque">
                        {vehicle.marque} {vehicle.modele}
                      </div>
                      <div className="vehicle-info">
                        {vehicle.carburant} • {vehicle.capacite} places
                        {vehicle.options.length > 0 && ` • ${vehicle.options.length} options`}
                      </div>
                    </td>
                    <td>{vehicle.type}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getEtatColor(vehicle.etat) }}
                      >
                        {vehicle.etat.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="affectation-type">
                        {getAffectationText(vehicle.affectation)}
                      </div>
                      {vehicle.affecteA && (
                        <div className="affectation-info">
                          {vehicle.affecteA}
                          {vehicle.dateAffectation && (
                            <div className="affectation-date">
                              depuis {new Date(vehicle.dateAffectation).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {vehicle.disponibilite ? (
                        <span className="disponible">
                          <span className="dot"></span> Disponible
                        </span>
                      ) : (
                        <span className="indisponible">
                          <span className="dot"></span> Occupé
                        </span>
                      )}
                    </td>
                    <td>{vehicle.kilometrage.toLocaleString()} km</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setNewVehicle(vehicle);
                            setIsEditingVehicle(true);
                            setShowAddModal(true);
                          }}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        
                        {vehicle.disponibilite ? (
                          <button 
                            className="btn-affect"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowAffectModal(true);
                            }}
                            title="Affecter"
                          >
                            👤
                          </button>
                        ) : (
                          <button 
                            className="btn-release"
                            onClick={() => handleReleaseVehicle(vehicle.id)}
                            title="Libérer"
                          >
                            🔓
                          </button>
                        )}
                        
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredVehicles.length === 0 && (
              <div className="no-vehicles">
                <p>Aucun véhicule trouvé</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Ajouter votre premier véhicule
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <Footer />
      
      {/* Modal d'ajout de véhicule */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetNewVehicle();
          setIsEditingVehicle(false);
        }}
        title={isEditingVehicle ? "Modifier le véhicule" : "Ajouter un nouveau véhicule"}
      >
        <VehicleForm
          initialData={isEditingVehicle && selectedVehicle ? selectedVehicle : newVehicle}
          onCancel={() => { setShowAddModal(false); setIsEditingVehicle(false); resetNewVehicle(); }}
          submitLabel={isEditingVehicle ? 'Enregistrer' : 'Ajouter le véhicule'}
          onSubmit={(payload) => {
            // if editing, ensure id is present
            if (isEditingVehicle && selectedVehicle) payload.id = selectedVehicle.id;
            handleSaveVehicle(payload);
          }}
        />
      </Modal>
      
      {/* Modal d'affectation */}
      <Modal
        isOpen={showAffectModal}
        onClose={() => setShowAffectModal(false)}
        title={`Affecter le véhicule ${selectedVehicle?.matricule}`}
      >
        <div className="affectation-form">
          {selectedVehicle && (
            <div className="vehicle-preview">
              <div className="preview-info">
                <strong>{selectedVehicle.marque} {selectedVehicle.modele}</strong>
                <span>{selectedVehicle.matricule} • {selectedVehicle.couleur}</span>
              </div>
            </div>
          )}
          
          <div className="form-row">
            <label>Type d'affectation</label>
            <select
              value={affectationData.type}
              onChange={(e) => setAffectationData({...affectationData, type: e.target.value})}
            >
              <option value="individuelle">Individuelle (à une personne)</option>
              <option value="partagee">Partagée (au sein d'une direction)</option>
              <option value="direction">Direction (réservé à la direction)</option>
            </select>
          </div>
          
          {affectationData.type === 'individuelle' && (
            <div className="form-row">
              <label>Affecter à un utilisateur</label>
              <select
                value={affectationData.userId}
                onChange={(e) => setAffectationData({...affectationData, userId: e.target.value})}
              >
                <option value="">Sélectionner un utilisateur</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.prenom} {user.nom} - {user.role} ({user.direction})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {affectationData.type === 'partagee' && (
            <div className="form-row">
              <label>Affecter à la direction</label>
              <select
                value={affectationData.userId}
                onChange={(e) => setAffectationData({...affectationData, userId: e.target.value})}
              >
                <option value="">Sélectionner une direction</option>
                {getUsersByDirection().map((direction, index) => (
                  <option key={index} value={direction}>
                    {direction}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-row double">
            <div>
              <label>Date de début</label>
              <input 
                type="date" 
                value={affectationData.dateDebut}
                onChange={(e) => setAffectationData({...affectationData, dateDebut: e.target.value})}
              />
            </div>
            
            <div>
              <label>Date de fin (optionnel)</label>
              <input 
                type="date" 
                value={affectationData.dateFin}
                onChange={(e) => setAffectationData({...affectationData, dateFin: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-row">
            <label>Mission/Motif</label>
            <textarea 
              value={affectationData.motif}
              onChange={(e) => setAffectationData({...affectationData, motif: e.target.value})}
              placeholder="Décrivez la mission ou le motif d'affectation..."
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button 
              className="btn-cancel"
              onClick={() => setShowAffectModal(false)}
            >
              Annuler
            </button>
            <button 
              className="btn-confirm"
              onClick={handleAffectVehicle}
            >
              Confirmer l'affectation
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal de détails */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Détails du véhicule ${selectedVehicle?.matricule}`}
      >
        {selectedVehicle && (
          <div className="vehicle-details-modal">
            <div className="details-grid">
              <div className="detail-item">
                <strong>Marque/Modèle:</strong>
                <span>{selectedVehicle.marque} {selectedVehicle.modele}</span>
              </div>
              
              <div className="detail-item">
                <strong>Type:</strong>
                <span>{selectedVehicle.type}</span>
              </div>
              
              <div className="detail-item">
                <strong>Carburant:</strong>
                <span>{selectedVehicle.carburant}</span>
              </div>
              
              <div className="detail-item">
                <strong>Année:</strong>
                <span>{selectedVehicle.annee}</span>
              </div>
              
              <div className="detail-item">
                <strong>Couleur:</strong>
                <span>{selectedVehicle.couleur}</span>
              </div>
              
              <div className="detail-item">
                <strong>Capacité:</strong>
                <span>{selectedVehicle.capacite} passagers</span>
              </div>
              
              <div className="detail-item">
                <strong>Kilométrage:</strong>
                <span>{selectedVehicle.kilometrage.toLocaleString()} km</span>
              </div>
              
              <div className="detail-item">
                <strong>État:</strong>
                <span className="status-badge" style={{backgroundColor: getEtatColor(selectedVehicle.etat)}}>
                  {selectedVehicle.etat.replace('_', ' ')}
                </span>
              </div>
              
              <div className="detail-item">
                <strong>Affectation:</strong>
                <span>{getAffectationText(selectedVehicle.affectation)}</span>
              </div>
              
              {selectedVehicle.affecteA && (
                <div className="detail-item">
                  <strong>Affecté à:</strong>
                  <span>{selectedVehicle.affecteA}</span>
                  {selectedVehicle.dateAffectation && (
                    <div className="affectation-details">
                      depuis le {new Date(selectedVehicle.dateAffectation).toLocaleDateString('fr-FR')}
                      {selectedVehicle.dateFinAffectation && (
                        <div>jusqu'au {new Date(selectedVehicle.dateFinAffectation).toLocaleDateString('fr-FR')}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="detail-item">
                <strong>Assurance:</strong>
                <div className="assurance-details">
                  <div>Numéro: {selectedVehicle.assurance.numero}</div>
                  <div>Compagnie: {selectedVehicle.assurance.compagnie}</div>
                  <div>Expiration: {new Date(selectedVehicle.assurance.dateExpiration).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
              
              <div className="detail-item">
                <strong>Contrôle technique:</strong>
                <div className="controle-details">
                  <div>Dernier: {new Date(selectedVehicle.dernierControle).toLocaleDateString('fr-FR')}</div>
                  <div>Prochain: {new Date(selectedVehicle.prochainControle).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
              
              {selectedVehicle.options.length > 0 && (
                <div className="detail-item full-width">
                  <strong>Options:</strong>
                  <div className="options-list">
                    {selectedVehicle.options.map((option, index) => (
                      <span key={index} className="option-tag">{option}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Vehicles;