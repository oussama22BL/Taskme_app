﻿import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useNotifications } from "../context/NotificationContext";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import TaskCard from "../components/tasks/TaskCard";
import Modal from "../components/shared/Modal";
import "./MyTasks.css";
import { useChat } from "../context/ChatContext";

const MyTasks = () => {
  const { user } = useAuth();
  const { tasks, updateTaskStatus } = useTasks();
  const { sendDelegationNotification } = useNotifications();
  const { openWidget } = useChat();
  
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [justification, setJustification] = useState("");
  const [delegateTo, setDelegateTo] = useState("");

  // Tâches assignées à l'utilisateur
  const myTasks = tasks.filter(task => {
    return task.status === "en_cours" || task.status === "ouverte";
  });

  // Simuler les collègues pour la délégation
  const colleagues = [
    { id: "1", nom: "Ali", prenom: "Ahmed", specialite: "Informatique", grade: "Expert" },
    { id: "2", nom: "Zahra", prenom: "Fatima", specialite: "Pédagogie", grade: "Senior" },
    { id: "3", nom: "Benjelloun", prenom: "Karim", specialite: "Gestion", grade: "Manager" },
    { id: "4", nom: "Mansouri", prenom: "Leila", specialite: "Ressources Humaines", grade: "Expert" },
  ];

  const handleTaskAction = (task: any, action: "accept" | "refuse" | "delegate") => {
    setSelectedTask(task);
    
    if (action === "accept") {
      if (window.confirm(`Accepter la tâche "${task.title}" ?`)) {
        updateTaskStatus(task.id, "acceptée");
        alert("Tâche acceptée avec succès !");
        // Envoyer notification d'acceptation
      }
    } else if (action === "refuse") {
      setShowRefusalModal(true);
    } else if (action === "delegate") {
      setShowDelegationModal(true);
    }
  };

  const submitRefusal = () => {
    if (!justification.trim()) {
      alert("Veuillez fournir une justification pour le refus");
      return;
    }

    updateTaskStatus(selectedTask.id, "refusée");
    alert(`Tâche refusée. Justification: ${justification}`);
    
    // Envoyer notification au coordinateur
    // Dans une application réelle, vous enverriez une notification au coordinateur
    
    setShowRefusalModal(false);
    setJustification("");
  };

  const submitDelegation = () => {
    if (!delegateTo) {
      alert("Veuillez sélectionner un collègue à qui déléguer");
      return;
    }

    if (!justification.trim()) {
      alert("Veuillez fournir une justification pour la délégation");
      return;
    }

    const delegatedUser = colleagues.find(c => c.id === delegateTo);
    
    // Envoyer notification de délégation
    sendDelegationNotification(selectedTask.id, user?.id || "", delegateTo);
    
    // Mettre à jour le statut de la tâche
    updateTaskStatus(selectedTask.id, "déléguée");
    
    alert(`Tâche déléguée à ${delegatedUser?.prenom} ${delegatedUser?.nom}\nJustification: ${justification}`);
    
    setShowDelegationModal(false);
    setDelegateTo("");
    setJustification("");
  };

  // Historique des tâches simulé
  const taskHistory = [
    { id: "1", title: "Formation Node.js", date: "15-20 Jan 2024", status: "✓ Acceptée", remuneration: "✓ Rémunérée" },
    { id: "2", title: "Audit pédagogique", date: "10-12 Déc 2023", status: "↪ Déléguée", remuneration: "✗ Non rémunérée" },
    { id: "3", title: "Membre de jury", date: "5-8 Nov 2023", status: "✓ Acceptée", remuneration: "✓ Rémunérée" },
    { id: "4", title: "Formation React", date: "1-5 Oct 2023", status: "✓ Acceptée", remuneration: "✓ Rémunérée" },
  ];

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />
        
        <main className="main-content-area">
          <div className="tasks-header">
            <h1>Mes Tâches</h1>
            <p>Bonjour {user?.prenom}, voici vos tâches assignées</p>
            <div className="tasks-actions">
              <button className="btn-create" onClick={() => window.location.href = '/tasks/create'}>Créer une tâche</button>
              <button className="btn-messages" onClick={() => openWidget()}>Ouvrir le chat</button>
            </div>
            
            <div className="user-info">
              <div className="info-card">
                <strong>Spécialité:</strong> {user?.specialite || "Non spécifiée"}
              </div>
              <div className="info-card">
                <strong>Grade:</strong> {user?.grade || "Non spécifié"}
              </div>
              <div className="info-card">
                <strong>Tâches en attente:</strong> {myTasks.length}
              </div>
              <div className="info-card">
                <strong>Taux d'acceptation:</strong> 85%
              </div>
            </div>
          </div>
          
          <div className="deadline-warning">
            <p>⚠️ Rappel: Vous avez 24h pour répondre aux tâches. Au-delà, elles seront automatiquement acceptées.</p>
          </div>
          
          <div className="tasks-list">
            {myTasks.length === 0 ? (
              <div className="no-tasks">
                <p>Aucune tâche assignée pour le moment</p>
                <p>Vous serez notifié lorsqu'une nouvelle tâche vous sera affectée</p>
                <div className="notification-bell-icon">🔔</div>
              </div>
            ) : (
              myTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <TaskCard task={task} />
                  <div className="task-response">
                    <button 
                      className="btn-accept"
                      onClick={() => handleTaskAction(task, "accept")}
                    >
                      ✓ Accepter
                    </button>
                    <button 
                      className="btn-refuse"
                      onClick={() => handleTaskAction(task, "refuse")}
                    >
                      ✗ Refuser
                    </button>
                    <button 
                      className="btn-delegate"
                      onClick={() => handleTaskAction(task, "delegate")}
                    >
                      ↪ Déléguer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="tasks-history">
            <h2>Historique de mes tâches</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Tâche</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Rémunération</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {taskHistory.map((history) => (
                  <tr key={history.id}>
                    <td>{history.title}</td>
                    <td>{history.date}</td>
                    <td className={`status-${history.status.includes("✓") ? 'accepted' : history.status.includes("↪") ? 'delegated' : 'refused'}`}>
                      {history.status}
                    </td>
                    <td className={`remuneration-${history.remuneration.includes("✓") ? 'paid' : 'unpaid'}`}>
                      {history.remuneration}
                    </td>
                    <td>
                      <button className="btn-details">Détails</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="performance-metrics">
            <h2>Mes indicateurs de performance</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">📊</div>
                <div className="metric-content">
                  <h3>85%</h3>
                  <p>Taux d'acceptation</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⏱️</div>
                <div className="metric-content">
                  <h3>2.1h</h3>
                  <p>Temps moyen de réponse</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">✅</div>
                <div className="metric-content">
                  <h3>94%</h3>
                  <p>Taux de satisfaction</p>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">💰</div>
                <div className="metric-content">
                  <h3>12</h3>
                  <p>Tâches rémunérées/mois</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
      
      {/* Modal de refus */}
      <Modal
        isOpen={showRefusalModal}
        onClose={() => {
          setShowRefusalModal(false);
          setJustification("");
        }}
        title="Refuser la tâche"
      >
        <div className="response-modal">
          {selectedTask && (
            <>
              <p>
                <strong>Tâche:</strong> {selectedTask.title}
              </p>
              <p>
                <strong>Type:</strong> {selectedTask.type}
              </p>
              <p>
                <strong>Période:</strong> {selectedTask.dateDebut} au {selectedTask.dateFin}
              </p>
              
              <div className="form-group">
                <label>Justification du refus *</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Expliquez pourquoi vous refusez cette tâche (raison personnelle, conflit d'emploi du temps, incompétence technique...)"
                  rows={5}
                  required
                />
                <p className="form-help">
                  Votre justification sera transmise au coordinateur pour validation.
                </p>
              </div>
              
              <div className="warning-message">
                <strong>⚠️ Attention :</strong> Les refus répétés sans justification valable peuvent impacter votre évaluation.
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setShowRefusalModal(false);
                    setJustification("");
                  }}
                >
                  Annuler
                </button>
                <button 
                  className="btn-confirm"
                  onClick={submitRefusal}
                  disabled={!justification.trim()}
                >
                  Confirmer le refus
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
      
      {/* Modal de délégation */}
      <Modal
        isOpen={showDelegationModal}
        onClose={() => {
          setShowDelegationModal(false);
          setDelegateTo("");
          setJustification("");
        }}
        title="Déléguer la tâche"
      >
        <div className="delegation-modal">
          {selectedTask && (
            <>
              <p>
                <strong>Tâche:</strong> {selectedTask.title}
              </p>
              <p>
                <strong>Type:</strong> {selectedTask.type}
              </p>
              <p>
                <strong>Période:</strong> {selectedTask.dateDebut} au {selectedTask.dateFin}
              </p>
              
              <div className="form-group">
                <label>Sélectionner un collègue *</label>
                <select
                  value={delegateTo}
                  onChange={(e) => setDelegateTo(e.target.value)}
                  required
                >
                  <option value="">Choisir un collègue...</option>
                  {colleagues.map(colleague => (
                    <option key={colleague.id} value={colleague.id}>
                      {colleague.prenom} {colleague.nom} - {colleague.specialite} ({colleague.grade})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Motif de délégation *</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Expliquez pourquoi vous déléguez cette tâche (charge de travail, compétences spécifiques requises, indisponibilité...)"
                  rows={4}
                  required
                />
                <p className="form-help">
                  Le collègue recevra une notification et pourra accepter ou refuser la délégation.
                </p>
              </div>
              
              <div className="delegation-info">
                <strong>⚠️ Procédure de délégation :</strong>
                <ul>
                  <li>La tâche sera proposée au collègue sélectionné</li>
                  <li>Il aura 24h pour accepter ou refuser</li>
                  <li>En cas de refus, la tâche vous sera réaffectée</li>
                  <li>Le coordinateur sera notifié de la délégation</li>
                </ul>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setShowDelegationModal(false);
                    setDelegateTo("");
                    setJustification("");
                  }}
                >
                  Annuler
                </button>
                <button 
                  className="btn-confirm"
                  onClick={submitDelegation}
                  disabled={!delegateTo || !justification.trim()}
                >
                  Proposer la délégation
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MyTasks;