import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import TaskCard from "../components/tasks/TaskCard";
import Modal from "../components/shared/Modal";
import "./MyTasks.css";

const MyTasks = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [responseType, setResponseType] = useState<"accept" | "refuse" | "delegate">("accept");
  const [justification, setJustification] = useState("");

  // Simuler les tâches assignées à l'utilisateur
  const myTasks = tasks.filter(task => task.status === "affectée");

  const handleTaskAction = (taskId: string, action: "accept" | "refuse" | "delegate") => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setResponseType(action);
      if (action === "delegate" || action === "refuse") {
        setShowDelegationModal(true);
      } else {
        // Accepter directement
        alert(`Tâche "${task.title}" acceptée!`);
      }
    }
  };

  const submitResponse = () => {
    if (responseType === "delegate" && !justification.trim()) {
      alert("Veuillez indiquer à qui déléguer");
      return;
    }
    
    if (responseType === "refuse" && !justification.trim()) {
      alert("Veuillez fournir une justification");
      return;
    }

    alert(`Réponse envoyée: ${responseType}\nJustification: ${justification}`);
    setShowDelegationModal(false);
    setJustification("");
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />
        
        <main className="main-content-area">
          <div className="tasks-header">
            <h1>Mes Tâches</h1>
            <p>Bonjour {user?.prenom}, voici vos tâches assignées</p>
            
            <div className="user-info">
              <div className="info-card">
                <strong>Spécialité:</strong> {user?.specialite}
              </div>
              <div className="info-card">
                <strong>Grade:</strong> {user?.grade}
              </div>
              <div className="info-card">
                <strong>Tâches en attente:</strong> {myTasks.length}
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
              </div>
            ) : (
              myTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <TaskCard task={task} />
                  <div className="task-response">
                    <button 
                      className="btn-accept"
                      onClick={() => handleTaskAction(task.id, "accept")}
                    >
                      ✓ Accepter
                    </button>
                    <button 
                      className="btn-refuse"
                      onClick={() => handleTaskAction(task.id, "refuse")}
                    >
                      ✗ Refuser
                    </button>
                    <button 
                      className="btn-delegate"
                      onClick={() => handleTaskAction(task.id, "delegate")}
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
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Formation Node.js</td>
                  <td>15-20 Jan 2024</td>
                  <td>✓ Acceptée</td>
                  <td>✓ Rémunérée</td>
                </tr>
                <tr>
                  <td>Audit pédagogique</td>
                  <td>10-12 Déc 2023</td>
                  <td>↪ Déléguée</td>
                  <td>✗ Non rémunérée</td>
                </tr>
                <tr>
                  <td>Membre de jury</td>
                  <td>5-8 Nov 2023</td>
                  <td>✓ Acceptée</td>
                  <td>✓ Rémunérée</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
      
      <Footer />
      
      <Modal
        isOpen={showDelegationModal}
        onClose={() => {
          setShowDelegationModal(false);
          setJustification("");
        }}
        title={
          responseType === "delegate" 
            ? "Déléguer la tâche" 
            : "Refuser la tâche"
        }
      >
        <div className="response-modal">
          <p>
            <strong>Tâche:</strong> {selectedTask?.title}
          </p>
          <p>
            <strong>Type:</strong> {selectedTask?.type}
          </p>
          <p>
            <strong>Période:</strong> {selectedTask?.dateDebut} au {selectedTask?.dateFin}
          </p>
          
          <div className="form-group">
            <label>
              {responseType === "delegate" 
                ? "Nom de l'auditeur à qui déléguer:" 
                : "Justification du refus:"}
            </label>
            {responseType === "delegate" ? (
              <input
                type="text"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Nom de l'auditeur"
              />
            ) : (
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Expliquez pourquoi vous refusez cette tâche..."
                rows={4}
              />
            )}
          </div>
          
          <div className="modal-actions">
            <button 
              className="btn-cancel"
              onClick={() => {
                setShowDelegationModal(false);
                setJustification("");
              }}
            >
              Annuler
            </button>
            <button 
              className="btn-confirm"
              onClick={submitResponse}
            >
              {responseType === "delegate" ? "Proposer la délégation" : "Confirmer le refus"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyTasks;