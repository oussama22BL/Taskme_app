// Vehicles.tsx - Gestion complète des véhicules
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VehicleForm from "../components/vehicles/VehicleForm";
import { listVehicles, createVehicle, updateVehicle, deleteVehicle, assignVehicle, releaseVehicle } from "../services/vehicleService";
import { Vehicle } from "../types/vehicle";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import Modal from "../components/shared/Modal";
import "./Vehicles.css";
import { useAuth } from "../context/AuthContext";

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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

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
  const handleSaveVehicle = async (payload: Partial<Vehicle>) => {
    if (!payload.matricule || !payload.marque || !payload.modele) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (isEditingVehicle && payload.id) {
        const updated = await updateVehicle(payload.id, payload as any);
        const mapped = {
          id: (updated as any)._id || (updated as any).id,
          matricule: updated.matricule,
          marque: updated.marque,
          modele: updated.modele,
          type: updated.type || 'Berline',
          carburant: updated.carburant || 'Essence',
          annee: updated.annee || new Date().getFullYear(),
          kilometrage: updated.kilometrage || 0,
          couleur: updated.couleur || '',
          etat: updated.etat || 'disponible',
          affectation: updated.affectation || 'individuelle',
          affecteA: updated.affecteA,
          affecteId: updated.affecteId,
          dateAffectation: updated.dateAffectation ? new Date(updated.dateAffectation).toISOString().split('T')[0] : undefined,
          dateFinAffectation: updated.dateFinAffectation ? new Date(updated.dateFinAffectation).toISOString().split('T')[0] : undefined,
          disponibilite: !!updated.disponibilite,
          assurance: {
            numero: updated.assurance?.numero || '',
            dateExpiration: updated.assurance?.dateExpiration ? new Date(updated.assurance.dateExpiration).toISOString().split('T')[0] : new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split('T')[0],
            compagnie: updated.assurance?.compagnie || ''
          },
          dernierControle: updated.dernierControle ? new Date(updated.dernierControle).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          prochainControle: updated.prochainControle ? new Date(updated.prochainControle).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth()+6)).toISOString().split('T')[0],
          capacite: updated.capacite || 5,
          options: updated.options || [],
          commentaires: updated.commentaires
        } as Vehicle;

        setVehicles(prev => prev.map(v => v.id === payload.id ? mapped : v));
        setIsEditingVehicle(false);
        alert("Véhicule modifié avec succès !");
      } else {
        const created = await createVehicle(payload as any);
        const mapped = {
          id: (created as any)._id || (created as any).id,
          matricule: created.matricule,
          marque: created.marque,
          modele: created.modele,
          type: created.type || 'Berline',
          carburant: created.carburant || 'Essence',
          annee: created.annee || new Date().getFullYear(),
          kilometrage: created.kilometrage || 0,
          couleur: created.couleur || '',
          etat: created.etat || 'disponible',
          affectation: created.affectation || 'individuelle',
          affecteA: created.affecteA,
          affecteId: created.affecteId,
          dateAffectation: created.dateAffectation ? new Date(created.dateAffectation).toISOString().split('T')[0] : undefined,
          dateFinAffectation: created.dateFinAffectation ? new Date(created.dateFinAffectation).toISOString().split('T')[0] : undefined,
          disponibilite: !!created.disponibilite,
          assurance: {
            numero: created.assurance?.numero || '',
            dateExpiration: created.assurance?.dateExpiration ? new Date(created.assurance.dateExpiration).toISOString().split('T')[0] : new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split('T')[0],
            compagnie: created.assurance?.compagnie || ''
          },
          dernierControle: created.dernierControle ? new Date(created.dernierControle).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          prochainControle: created.prochainControle ? new Date(created.prochainControle).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth()+6)).toISOString().split('T')[0],
          capacite: created.capacite || 5,
          options: created.options || [],
          commentaires: created.commentaires
        } as Vehicle;

        setVehicles(prev => [...prev, mapped]);
        alert("Véhicule ajouté avec succès !");
      }

      setShowAddModal(false);
      resetNewVehicle();
    } catch (err: any) {
      console.error('Save vehicle error', err);
      alert(err?.response?.data?.msg || 'Erreur lors de la sauvegarde du véhicule');
    }
  };

  // Gérer la modification d'un véhicule
  // Note: editing is handled by reusing the "add" modal with `isEditingVehicle` flag

  // Gérer la suppression d'un véhicule
  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) return;
    try {
      await deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      alert("Véhicule supprimé avec succès !");
    } catch (err: any) {
      console.error('Delete vehicle error', err);
      alert(err?.response?.data?.msg || 'Erreur lors de la suppression');
    }
  };

  // Gérer l'affectation d'un véhicule
  const handleAffectVehicle = async () => {
    if (!selectedVehicle) return;
    
    if (affectationData.type === 'individuelle' && !affectationData.userId) {
      alert("Veuillez sélectionner un utilisateur");
      return;
    }

    try {
      const body = {
        type: affectationData.type,
        userId: affectationData.userId,
        dateDebut: affectationData.dateDebut,
        dateFin: affectationData.dateFin,
        motif: affectationData.motif
      };

      const updated = await assignVehicle(selectedVehicle.id, body as any);

      const mapped = {
        id: (updated as any)._id || (updated as any).id,
        matricule: updated.matricule,
        marque: updated.marque,
        modele: updated.modele,
        type: updated.type || 'Berline',
        carburant: updated.carburant || 'Essence',
        annee: updated.annee || new Date().getFullYear(),
        kilometrage: updated.kilometrage || 0,
        couleur: updated.couleur || '',
        etat: updated.etat || 'en_mission',
        affectation: updated.affectation || 'individuelle',
        affecteA: updated.affecteA,
        affecteId: updated.affecteId,
        dateAffectation: updated.dateAffectation ? new Date(updated.dateAffectation).toISOString().split('T')[0] : undefined,
        dateFinAffectation: updated.dateFinAffectation ? new Date(updated.dateFinAffectation).toISOString().split('T')[0] : undefined,
        disponibilite: !!updated.disponibilite,
        assurance: updated.assurance || { numero: '', dateExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], compagnie: '' },
        dernierControle: updated.dernierControle ? new Date(updated.dernierControle).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        prochainControle: updated.prochainControle ? new Date(updated.prochainControle).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        capacite: updated.capacite || 5,
        options: updated.options || [],
        commentaires: updated.commentaires
      } as Vehicle;

      setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? mapped : v));

      setShowAffectModal(false);
      setAffectationData({
        type: 'individuelle',
        userId: '',
        dateDebut: new Date().toISOString().split('T')[0],
        dateFin: '',
        motif: ''
      });

      alert(`Véhicule ${selectedVehicle.matricule} affecté avec succès !`);
    } catch (err: any) {
      console.error('Affect vehicle error', err);
      alert(err?.response?.data?.msg || 'Erreur lors de l\'affectation');
    }
  };

  // Libérer un véhicule
  const handleReleaseVehicle = async (id: string) => {
    try {
      const updated = await releaseVehicle(id);
      setVehicles(prev => prev.map(v => v.id === id ? {
        ...v,
        etat: updated.etat || 'disponible',
        disponibilite: !!updated.disponibilite,
        affecteA: updated.affecteA,
        affecteId: updated.affecteId,
        dateAffectation: updated.dateAffectation ? new Date(updated.dateAffectation).toISOString().split('T')[0] : undefined,
        dateFinAffectation: updated.dateFinAffectation ? new Date(updated.dateFinAffectation).toISOString().split('T')[0] : undefined
      } : v));
      alert("Véhicule libéré avec succès !");
    } catch (err: any) {
      console.error('Release vehicle error', err);
      alert(err?.response?.data?.msg || 'Erreur lors de la libération du véhicule');
    }
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

  // Load vehicles from API and refresh when navigated back from add page
  const loadVehicles = async () => {
    try {
      const res = await listVehicles();
      const mapped = (res || []).map((v: any) => ({
        id: v._id || v.id,
        matricule: v.matricule || '',
        marque: v.marque || '',
        modele: v.modele || '',
        type: v.type || 'Berline',
        carburant: v.carburant || 'Essence',
        annee: v.annee || new Date().getFullYear(),
        kilometrage: v.kilometrage || 0,
        couleur: v.couleur || '',
        etat: v.etat || 'disponible',
        affectation: v.affectation || 'individuelle',
        affecteA: v.affecteA,
        affecteId: v.affecteId,
        dateAffectation: v.dateAffectation ? new Date(v.dateAffectation).toISOString().split('T')[0] : undefined,
        dateFinAffectation: v.dateFinAffectation ? new Date(v.dateFinAffectation).toISOString().split('T')[0] : undefined,
        disponibilite: !!v.disponibilite,
        assurance: {
          numero: v.assurance?.numero || '',
          dateExpiration: v.assurance?.dateExpiration ? new Date(v.assurance.dateExpiration).toISOString().split('T')[0] : new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().split('T')[0],
          compagnie: v.assurance?.compagnie || ''
        },
        dernierControle: v.dernierControle ? new Date(v.dernierControle).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        prochainControle: v.prochainControle ? new Date(v.prochainControle).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth()+6)).toISOString().split('T')[0],
        capacite: v.capacite || 5,
        options: v.options || [],
        commentaires: v.commentaires
      } as Vehicle));
      setVehicles(mapped);
    } catch (err) {
      console.error('Failed to load vehicles', err);
    }
  };

  const { user } = useAuth();

  useEffect(() => {
    loadVehicles();
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
                {(user?.role === 'admin' || user?.role === 'superAdmin') && (
                  <>
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
                  </>
                )}
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
                        {(user?.role === 'admin' || user?.role === 'superAdmin') && (
                          <>
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredVehicles.length === 0 && (
              <div className="no-vehicles">
                <p>Aucun véhicule trouvé</p>
                {(user?.role === 'admin' || user?.role === 'superAdmin') && (
                  <button 
                    className="btn-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    Ajouter votre premier véhicule
                  </button>
                )}
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