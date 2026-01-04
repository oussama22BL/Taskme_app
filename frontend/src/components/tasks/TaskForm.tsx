import { FormEvent, useState } from "react";
import { useTasks } from "@context/TaskContext";
import { useNavigate } from "react-router-dom";

interface TaskFormProps {
  onSubmit?: (taskData: any) => Promise<void> | void;
}

const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const [taskData, setTaskData] = useState({
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
  });

  const specialites = ["pédagogique", "orientation", "planification", "financier"];
  const grades = ["A", "B", "C"];
  const directions = ["Rabat-Casa", "Meknès-Errachidia", "Marrakech-Agadir"];

  const { addTask } = useTasks();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      let fichierJoint: string | undefined = undefined;
      if (selectedFile) {
        // for demo purposes we encode file as base64; in prod use FormData + multipart upload
        fichierJoint = await readFileAsDataURL(selectedFile);
      }

      const payload = {
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
        dateDebut: taskData.dateDebut,
        dateFin: taskData.dateFin,
        isRemuneree: taskData.isRemuneree,
        isCommune: taskData.isCommune,
        specialitesConcernees: taskData.specialitesConcernees,
        gradesConcernes: taskData.gradesConcernes,
        besoinVehicule: taskData.besoinVehicule,
        direction: taskData.direction,
        nombrePlaces: taskData.nombrePlaces,
        fichierJoint,
        status: "ouverte" as const,
      };

      if (onSubmit) {
        await onSubmit(payload);
        return;
      }

      await addTask(payload);
      navigate("/tasks");
    } catch (error) {
      console.error("Erreur création tâche:", error);
      alert("Erreur lors de la création de la tâche. Vérifiez la console pour plus de détails.");
    }
  };

  const handleSpecialiteChange = (specialite: string) => {
    setTaskData((prev) => ({
      ...prev,
      specialitesConcernees: prev.specialitesConcernees.includes(specialite)
        ? prev.specialitesConcernees.filter((s) => s !== specialite)
        : [...prev.specialitesConcernees, specialite],
    }));
  };

  const handleGradeChange = (grade: string) => {
    setTaskData((prev) => ({
      ...prev,
      gradesConcernes: prev.gradesConcernes.includes(grade)
        ? prev.gradesConcernes.filter((g) => g !== grade)
        : [...prev.gradesConcernes, grade],
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
                checked={taskData.specialitesConcernees.includes(specialite)}
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
                checked={taskData.gradesConcernes.includes(grade)}
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
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
        />
      </div>

      <button type="submit" className="btn-submit">Créer la tâche</button>
    </form>
  );
};

export default TaskForm;
