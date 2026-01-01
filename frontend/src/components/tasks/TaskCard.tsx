import type { FC } from "react";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
}

const TaskCard: FC<TaskCardProps> = ({ task }) => {
  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className={`task-status ${task.status}`}>{task.status}</span>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-details">
        <div className="task-type">
          <strong>Type:</strong> {task.type}
        </div>
        <div className="task-dates">
          <strong>Période:</strong> {task.dateDebut ? new Date(task.dateDebut).toLocaleDateString() : '-'} - {task.dateFin ? new Date(task.dateFin).toLocaleDateString() : '-'}
        </div>
        <div className="task-remuneration">
          <strong>Rémunération:</strong> {task.isRemuneree ? "Oui" : "Non"}
        </div>
        {task.assignedTo && (
          <div className="task-assigned">
            <strong>Affecté à:</strong> {task.assignedTo}
          </div>
        )}
      </div>
      <div className="task-actions">
        <button className="btn-accept">Accepter</button>
        <button className="btn-refuse">Refuser</button>
        <button className="btn-delegate">Déléguer</button>
      </div>
    </div>
  );
};

export default TaskCard;
