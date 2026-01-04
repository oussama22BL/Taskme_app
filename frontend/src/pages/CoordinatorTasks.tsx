import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useNotifications } from "../context/NotificationContext";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
// Task creation is done on the dedicated page `/tasks/create`
import TaskCard from "../components/tasks/TaskCard";
import Modal from "../components/shared/Modal";
import "./CoordinatorTasks.css";

const CoordinatorTasks = () => {
  const { user } = useAuth();
  const { tasks, updateTaskStatus } = useTasks();
  const { sendAssignmentNotification } = useNotifications();
  const navigate = useNavigate();
  
  // Navigation to a dedicated Create Task page instead of opening a modal
  const [showAffectationManuelleModal, setShowAffectationManuelleModal] = useState(false);
  const [showAffectationSemiAutoModal, setShowAffectationSemiAutoModal] = useState(false);
  const [showAffectationAutoModal, setShowAffectationAutoModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"all" | "open" | "assigned">("all");
  const [filterType, setFilterType] = useState<string>("");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  const [recycleesUniquement, setRecycleesUniquement] = useState(false);

  const filteredTasks = tasks.filter(task => {
    // Filtre par mode de vue
    if (viewMode === "open") {
      if (task.status !== "ouverte") return false;
    } else if (viewMode === "assigned") {
      if (task.status !== "affectée") return false;
    }
    
    // Filtre par type de tâche
    if (filterType && task.type !== filterType) return false;
    
    // Filtre par date
    if (dateDebut && task.dateDebut < dateDebut) return false;
    if (dateFin && task.dateFin > dateFin) return false;
    
    // Filtre par tâches rémunérées
    if (recycleesUniquement && !task.remuneree) return false;
    
    return true;
  });

  // Creation via dedicated page handled by `TaskForm` on that page.

  // Fonctions pour les actions de coordination
  const handleAffectationManuelle = () => {
    if (filteredTasks.length === 0) {
      alert("Aucune tâche disponible pour affectation manuelle");
      return;
    }
    setShowAffectationManuelleModal(true);
  };

  const handleAffectationSemiAuto = () => {
    const openTasks = tasks.filter(t => t.status === "ouverte");
    if (openTasks.length === 0) {
      alert("Aucune tâche ouverte pour affectation semi-automatique");
      return;
    }
    setShowAffectationSemiAutoModal(true);
  };

  const handleAffectationAuto = () => {
    const openTasks = tasks.filter(t => t.status === "ouverte");
    if (openTasks.length === 0) {
      alert("Aucune tâche ouverte pour affectation automatique");
      return;
    }
    setShowAffectationAutoModal(true);
  };

  const handleGenererRapports = () => {
    navigate("/reports");
  };

  // Simuler les utilisateurs disponibles
  const mockUsers = [
    { id: "1", nom: "Ali", prenom: "Ahmed", specialite: "Informatique", grade: "Expert", anciennete: 5, disponible: true },
    { id: "2", nom: "Zahra", prenom: "Fatima", specialite: "Pédagogie", grade: "Senior", anciennete: 3, disponible: true },
    { id: "3", nom: "Benjelloun", prenom: "Karim", specialite: "Gestion", grade: "Manager", anciennete: 7, disponible: false },
    { id: "4", nom: "Mansouri", prenom: "Leila", specialite: "Ressources Humaines", grade: "Expert", anciennete: 4, disponible: true },
  ];

  const handleManualAssignment = (taskId: string, userId: string) => {
    // Mettre à jour le statut de la tâche
    updateTaskStatus(taskId, "affectée");
    
    // Envoyer notification
    sendAssignmentNotification(taskId, userId, user?.id);
    
    // Trouver l'utilisateur
    const assignedUser = mockUsers.find(u => u.id === userId);
    alert(`Tâche affectée manuellement à ${assignedUser?.prenom} ${assignedUser?.nom}`);
    setShowAffectationManuelleModal(false);
  };

  const handleSemiAutoAssignment = () => {
    // Logique d'affectation semi-automatique selon les critères
    const openTasks = tasks.filter(t => t.status === "ouverte");
    const availableUsers = mockUsers.filter(u => u.disponible);
    
    if (openTasks.length === 0 || availableUsers.length === 0) {
      alert("Aucune tâche ou utilisateur disponible");
      return;
    }

    // Algorithme simple de tour de rôle par ancienneté
    const sortedUsers = [...availableUsers].sort((a, b) => b.anciennete - a.anciennete);
    const taskToAssign = openTasks[0];
    const userToAssign = sortedUsers[0];

    updateTaskStatus(taskToAssign.id, "affectée");
    sendAssignmentNotification(taskToAssign.id, userToAssign.id, user?.id);

    alert(`Proposition d'affectation semi-automatique :\nTâche: ${taskToAssign.title}\nAuditeur: ${userToAssign.prenom} ${userToAssign.nom}\nCritères: Tour de rôle (ancienneté: ${userToAssign.anciennete} ans)\n\nValider cette affectation ?`);
    setShowAffectationSemiAutoModal(false);
  };

  const handleAutoAssignment = () => {
    // Simulation d'IA - logique plus avancée
    const openTasks = tasks.filter(t => t.status === "ouverte");
    const availableUsers = mockUsers.filter(u => u.disponible);
    
    if (openTasks.length === 0 || availableUsers.length === 0) {
      alert("Aucune tâche ou utilisateur disponible");
      return;
    }

    // Algorithme IA simulé : compatibilité spécialité + charge équitable
    const taskToAssign = openTasks[0];
    const compatibleUsers = availableUsers.filter(u => 
      !taskToAssign.specialitesConcernees || taskToAssign.specialitesConcernees.length === 0 ||
      taskToAssign.specialitesConcernees.includes(u.specialite)
    );

    let userToAssign;
    if (compatibleUsers.length > 0) {
      // Choisir celui avec le moins de tâches (simulation)
      userToAssign = compatibleUsers[0];
    } else {
      userToAssign = availableUsers[0];
    }

    updateTaskStatus(taskToAssign.id, "affectée");
    sendAssignmentNotification(taskToAssign.id, userToAssign.id, user?.id);

    alert(`Proposition d'affectation automatique (IA) :\nTâche: ${taskToAssign.title}\nAuditeur: ${userToAssign.prenom} ${userToAssign.nom}\nScore IA: 92%\nCritères: Compatibilité spécialité, équité charge, historique\n\nValider cette affectation ?`);
    setShowAffectationAutoModal(false);
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />
        
        <main className="main-content-area">
          {/* En-tête */}
          <div className="tasks-header">
            <h1>Gestion des tâches - Coordinateur</h1>
            <p>Vous êtes connecté en tant que Coordinateur</p>
            
            <div className="header-actions">
              <button 
                className="btn-primary"
                onClick={() => navigate("/tasks/create")}
              >
                + Créer une tâche
              </button>
              
              <div className="view-toggle">
                <button 
                  className={viewMode === "all" ? "active" : ""}
                  onClick={() => setViewMode("all")}
                >
                  Toutes
                </button>
                <button 
                  className={viewMode === "open" ? "active" : ""}
                  onClick={() => setViewMode("open")}
                >
                  Ouvertes
                </button>
                <button 
                  className={viewMode === "assigned" ? "active" : ""}
                  onClick={() => setViewMode("assigned")}
                >
                  Affectées
                </button>
              </div>
            </div>
          </div>
          
          {/* Filtres */}
          <div className="tasks-filters">
            <div className="filter-group">
              <label>Type de tâche:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="Formateur">Formateur</option>
                <option value="Jury">Jury</option>
                <option value="Bénéficiaire">Bénéficiaire</option>
                <option value="Observateur">Observateur</option>
                <option value="Concepteur">Concepteur</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Période:</label>
              <input 
                type="date" 
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
              <span>à</span>
              <input 
                type="date" 
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={recycleesUniquement}
                  onChange={(e) => setRecycleesUniquement(e.target.checked)}
                />
                Tâches rémunérées uniquement
              </label>
            </div>
          </div>
          
          {/* Liste des tâches */}
          <div className="tasks-list">
            {filteredTasks.length === 0 ? (
              <div className="no-tasks">
                <p>Aucune tâche trouvée</p>
                <p>Essayez de modifier vos filtres ou créez une nouvelle tâche</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <TaskCard task={task} />
                  {task.status === "ouverte" && (
                    <div className="task-coordinator-actions">
                      <button 
                        className="btn-affect"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowAffectationManuelleModal(true);
                        }}
                      >
                        Affecter manuellement
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Actions de coordination */}
          <div className="coordinator-actions">
            <h2>Actions de coordination</h2>
            <div className="action-buttons">
              <button 
                className="btn-action"
                onClick={handleAffectationManuelle}
              >
                <span className="action-icon-wrapper">
                  <span className="action-icon">👤</span>
                </span>
                <span className="action-title">Affectation manuelle</span>
                <span className="action-subtitle">Cas urgents ou spécifiques</span>
              </button>
              
              <button 
                className="btn-action"
                onClick={handleAffectationSemiAuto}
              >
                <span className="action-icon-wrapper">
                  <span className="action-icon">⚙️</span>
                </span>
                <span className="action-title">Affectation semi-automatique</span>
                <span className="action-subtitle">Tour de rôle, spécialité, équité</span>
              </button>
              
              <button 
                className="btn-action"
                onClick={handleAffectationAuto}
              >
                <span className="action-icon-wrapper">
                  <span className="action-icon">🤖</span>
                </span>
                <span className="action-title">Affectation automatique (IA)</span>
                <span className="action-subtitle">Compatibilité, historique, optimisation</span>
              </button>
              
              <button 
                className="btn-action"
                onClick={() => navigate("/vehicles")}
              >
                <span className="action-icon-wrapper">
                  <span className="action-icon">🚗</span>
                </span>
                <span className="action-title">Gérer les véhicules</span>
                <span className="action-subtitle">Parc automobile et affectations</span>
              </button>
              
              <button 
                className="btn-action"
                onClick={handleGenererRapports}
              >
                <span className="action-icon-wrapper">
                  <span className="action-icon">📊</span>
                </span>
                <span className="action-title">Générer rapports</span>
                <span className="action-subtitle">Statistiques et analyses</span>
              </button>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
      
      {/* Création de tâche déplacée vers la page dédiée `/tasks/create` */}
      
      {/* Modal d'affectation manuelle */}
      <Modal
        isOpen={showAffectationManuelleModal}
        onClose={() => setShowAffectationManuelleModal(false)}
        title="Affectation manuelle"
        size="medium"
      >
        <div className="affectation-modal">
          {selectedTask ? (
            <>
              <div className="selected-task">
                <h4>Tâche sélectionnée :</h4>
                <p><strong>{selectedTask.title}</strong></p>
                <p>Type: {selectedTask.type} | Spécialité: {selectedTask.specialite || "Non spécifiée"}</p>
                <p>Période: {selectedTask.dateDebut} au {selectedTask.dateFin}</p>
              </div>
              
              <div className="user-selection">
                <h4>Sélectionner un auditeur :</h4>
                <div className="users-list">
                  {mockUsers.map(user => (
                    <div key={user.id} className="user-item">
                      <div className="user-info">
                        <strong>{user.prenom} {user.nom}</strong>
                        <div className="user-details">
                          {user.specialite} • {user.grade} • {user.anciennete} ans
                        </div>
                        <div className={`user-status ${user.disponible ? 'available' : 'unavailable'}`}>
                          {user.disponible ? "✓ Disponible" : "● Occupé"}
                        </div>
                      </div>
                      <button
                        className="btn-select-user"
                        onClick={() => handleManualAssignment(selectedTask.id, user.id)}
                        disabled={!user.disponible}
                      >
                        Affecter
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <h4>Sélectionner une tâche à affecter :</h4>
              <div className="tasks-list-modal">
                {tasks.filter(t => t.status === "ouverte").map(task => (
                  <div key={task.id} className="task-item-modal">
                    <div className="task-info">
                      <strong>{task.title}</strong>
                      <div className="task-details">
                        {task.type} • {task.dateDebut} au {task.dateFin}
                      </div>
                    </div>
                    <button
                      className="btn-select-task"
                      onClick={() => setSelectedTask(task)}
                    >
                      Sélectionner
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>
      
      {/* Modal d'affectation semi-automatique */}
      <Modal
        isOpen={showAffectationSemiAutoModal}
        onClose={() => setShowAffectationSemiAutoModal(false)}
        title="Affectation semi-automatique"
        size="large"
      >
        <div className="semi-auto-modal">
          <div className="algorithm-explanation">
            <h4>Algorithme d'affectation semi-automatique :</h4>
            <ul>
              <li><strong>Tour de rôle :</strong> Priorité par ancienneté de l'auditeur</li>
              <li><strong>Spécialité :</strong> Tâches affectées uniquement aux auditeurs de même spécialité</li>
              <li><strong>Équité rémunération :</strong> Distribution équitable des tâches rémunérées</li>
              <li><strong>Non interférence :</strong> Aucun chevauchement de périodes</li>
            </ul>
          </div>
          
          <div className="algorithm-results">
            <h4>Résultats de l'algorithme :</h4>
            <div className="result-card">
              <div className="result-header">
                <span className="result-label">Proposition d'affectation</span>
                <span className="result-score">Score: 85%</span>
              </div>
              <div className="result-details">
                <div className="result-task">
                  <strong>Tâche :</strong> Formation React Avancé
                </div>
                <div className="result-user">
                  <strong>Auditeur proposé :</strong> Ahmed Ali (Expert Informatique - 5 ans)
                </div>
                <div className="result-criteria">
                  <strong>Critères respectés :</strong>
                  <ul>
                    <li>✓ Tour de rôle (ancienneté)</li>
                    <li>✓ Spécialité correspondante</li>
                    <li>✓ Équité rémunération</li>
                    <li>✓ Pas d'interférence temporelle</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="algorithm-actions">
            <button className="btn-cancel" onClick={() => setShowAffectationSemiAutoModal(false)}>
              Annuler
            </button>
            <button className="btn-generate" onClick={() => alert("Génération du rapport de proposition...")}>
              Générer rapport détaillé
            </button>
            <button className="btn-validate" onClick={handleSemiAutoAssignment}>
              Valider l'affectation
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal d'affectation automatique (IA) */}
      <Modal
        isOpen={showAffectationAutoModal}
        onClose={() => setShowAffectationAutoModal(false)}
        title="Affectation automatique par IA"
        size="large"
      >
        <div className="auto-modal">
          <div className="ai-explanation">
            <h4>Algorithme IA d'affectation :</h4>
            <ul>
              <li><strong>Historique des affectations :</strong> Éviter les répétitions dans les mêmes sujets/villes</li>
              <li><strong>Compatibilité profil/tâche :</strong> Formations, diplômes, expériences spécifiques</li>
              <li><strong>Détection chevauchements :</strong> Analyse intelligente des disponibilités</li>
              <li><strong>Prévention surcharge :</strong> Distribution optimale de la charge de travail</li>
              <li><strong>Optimisation multi-critères :</strong> Combinaison de tous les facteurs</li>
            </ul>
          </div>
          
          <div className="ai-results">
            <h4>Résultats de l'IA :</h4>
            <div className="ai-result-card">
              <div className="ai-result-header">
                <span className="ai-result-label">Meilleure proposition IA</span>
                <span className="ai-result-score">Score IA: 92%</span>
              </div>
              <div className="ai-result-details">
                <div className="ai-result-task">
                  <strong>Tâche :</strong> Audit pédagogique - Casablanca
                </div>
                <div className="ai-result-user">
                  <strong>Auditeur optimal :</strong> Fatima Zahra (Senior Pédagogie - 3 ans)
                </div>
                <div className="ai-result-reasons">
                  <strong>Justification IA :</strong>
                  <ul>
                    <li>✓ Formation en pédagogie (Master Éducation)</li>
                    <li>✓ Expérience antérieure à Casablanca (2 missions)</li>
                    <li>✓ Disponibilité confirmée (pas de chevauchement)</li>
                    <li>✓ Charge équilibrée (3 tâches en cours)</li>
                    <li>✓ Score de compatibilité: 92%</li>
                  </ul>
                </div>
                <div className="ai-result-alternatives">
                  <strong>Alternatives :</strong>
                  <ul>
                    <li>Karim Benjelloun (Score: 78%) - Charge élevée</li>
                    <li>Leila Mansouri (Score: 65%) - Spécialité différente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="ai-actions">
            <button className="btn-cancel" onClick={() => setShowAffectationAutoModal(false)}>
              Annuler
            </button>
            <button className="btn-generate" onClick={() => alert("Génération du rapport IA détaillé...")}>
              Rapport complet IA
            </button>
            <button className="btn-validate" onClick={handleAutoAssignment}>
              Valider la proposition IA
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CoordinatorTasks;