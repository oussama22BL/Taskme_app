import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import "./TaskForm.css";
import type { FC, FormEvent } from "react";
import type { Task, TaskStatus } from "@/types";

type CreateTaskPayload = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> & { status?: TaskStatus };

interface TaskFormProps {
  onCreate?: (taskData: CreateTaskPayload) => void;
}

const TaskForm: FC<TaskFormProps> = ({ onCreate }) => {
  const [taskData, setTaskData] = useState<CreateTaskPayload>({
    title: "",
    description: "",
    type: "Formateur",
    dateDebut: "",
    dateFin: "",
    isRemuneree: false,
    isCommune: false,
    specialitesConcernees: [] as string[],
    gradesConcernes: [] as string[],
    besoinVehicule: false,
    direction: "",
    nombrePlaces: 1,
    status: 'ouverte',
  });

  // get available options from Settings context
  const { specialites: specialites, grades: grades } = useSettings();
  // Import placed at file top
  const directions = ["Rabat-Casa", "Meknès-Errachidia", "Marrakech-Agadir"];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Task data:", taskData);
    // Trigger parent handler if provided
    onCreate?.(taskData);
    // Ici, tu enverras les données à l'API
  };

  const handleSpecialiteChange = (specialite: string) => {
    setTaskData((prev) => ({
      ...prev,
      specialitesConcernees: (prev.specialitesConcernees ?? []).includes(specialite)
        ? (prev.specialitesConcernees ?? []).filter((s) => s !== specialite)
        : [...(prev.specialitesConcernees ?? []), specialite],
    }));
  };

  const handleGradeChange = (grade: string) => {
    setTaskData((prev) => ({
      ...prev,
      gradesConcernes: (prev.gradesConcernes ?? []).includes(grade)
        ? (prev.gradesConcernes ?? []).filter((g) => g !== grade)
        : [...(prev.gradesConcernes ?? []), grade],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h2>Créer une nouvelle tâche</h2>

      <div className="form-group">
        <label>Titre *</label>
        <input
          type="text"
          value={taskData.title}
          onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={taskData.description}
          onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Type de tâche *</label>
        <select
          value={taskData.type}
          onChange={(e) => setTaskData({ ...taskData, type: e.target.value })}
        >
          <option value="Formateur">Formateur</option>
          <option value="Jury">Membre de jury</option>
          <option value="Bénéficiaire">Bénéficiaire de formation</option>
          <option value="Observateur">Observateur</option>
          <option value="Concepteur">Concepteur d'évaluation</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date de début *</label>
          <input
            type="date"
            value={taskData.dateDebut}
            onChange={(e) => setTaskData({ ...taskData, dateDebut: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Date de fin *</label>
          <input
            type="date"
            value={taskData.dateFin}
            onChange={(e) => setTaskData({ ...taskData, dateFin: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={taskData.isRemuneree}
              onChange={(e) => setTaskData({ ...taskData, isRemuneree: e.target.checked })}
            />
            Tâche rémunérée
          </label>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={taskData.besoinVehicule}
              onChange={(e) => setTaskData({ ...taskData, besoinVehicule: e.target.checked })}
            />
            Nécessite un véhicule
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Spécialités concernées *</label>
        <div className="checkbox-group">
          {specialites.map((specialite) => (
            <label key={specialite}>
              <input
                type="checkbox"
                checked={(taskData.specialitesConcernees ?? []).includes(specialite)}
                onChange={() => handleSpecialiteChange(specialite)}
              />
              {specialite}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Grades concernés *</label>
        <div className="checkbox-group">
          {grades.map((grade) => (
            <label key={grade}>
              <input
                type="checkbox"
                checked={(taskData.gradesConcernes ?? []).includes(grade)}
                onChange={() => handleGradeChange(grade)}
              />
              Grade {grade}
            </label>
          ))}
        </div>
      </div>

      {taskData.besoinVehicule && (
        <div className="form-group">
          <label>Direction</label>
          <select
            value={taskData.direction}
            onChange={(e) => setTaskData({ ...taskData, direction: e.target.value })}
          >
            <option value="">Sélectionner une direction</option>
            {directions.map((dir) => (
              <option key={dir} value={dir}>{dir}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Nombre de places *</label>
        <input
          type="number"
          min="1"
          value={taskData.nombrePlaces}
          onChange={(e) => setTaskData({ ...taskData, nombrePlaces: parseInt(e.target.value) })}
          required
        />
      </div>

      <div className="form-group">
        <label>Fichier administratif (PDF)</label>
        <input type="file" accept=".pdf" />
      </div>

      <button type="submit" className="btn-submit">Créer la tâche</button>
    </form>
  );
};

export default TaskForm;
