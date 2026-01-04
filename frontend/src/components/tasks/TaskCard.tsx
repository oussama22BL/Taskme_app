// TaskCard.tsx - Version mise à jour avec boutons d'affectation
import React from "react";
import "./TaskCard.css";

const TaskCard: React.FC<{
  task: any;
  onAffect?: (taskId: string) => void;
}> = ({ task, onAffect }) => {
  return (
    <div className="task-card">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`status-badge status-${task.status}`}>
          {task.status}
        </span>
      </div>
      
      <div className="task-details">
        <div className="detail-row">
          <span className="detail-label">Type:</span>
          <span className="detail-value">{task.type}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Spécialité:</span>
          <span className="detail-value">{task.specialite || "Non spécifiée"}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Période:</span>
          <span className="detail-value">{task.dateDebut} au {task.dateFin}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Rémunération:</span>
          <span className={`detail-value ${task.remuneree ? 'remuneree' : 'non-remuneree'}`}>
            {task.remuneree ? "✓ Rémunérée" : "Non rémunérée"}
          </span>
        </div>
        
        {task.ville && (
          <div className="detail-row">
            <span className="detail-label">Ville:</span>
            <span className="detail-value">{task.ville}</span>
          </div>
        )}
        
        {task.affecteA && (
          <div className="detail-row">
            <span className="detail-label">Affecté à:</span>
            <span className="detail-value affecte-a">{task.affecteA}</span>
          </div>
        )}
        
        {task.modeAffectation && (
          <div className="detail-row">
            <span className="detail-label">Mode d'affectation:</span>
            <span className="detail-value mode-affectation">
              {task.modeAffectation === "manuel" ? "👤 Manuel" :
               task.modeAffectation === "semiAuto" ? "⚙️ Semi-auto" :
               task.modeAffectation === "autoIA" ? "🤖 IA" : task.modeAffectation}
            </span>
          </div>
        )}
      </div>
      
      {task.status === "ouverte" && onAffect && (
        <div className="task-actions">
          <button 
            className="btn-affect-task"
            onClick={() => onAffect(task.id)}
          >
            👤 Affecter cette tâche
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;