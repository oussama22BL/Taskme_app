import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { useTasks } from "@/context/TaskContext";
import { useUsers } from "@/context/UsersContext";
import { useSettings } from "@/context/SettingsContext";
import "./AssignByGrade.css";

const AssignByGrade = () => {
  const { tasks, updateTask } = useTasks();
  const { users } = useUsers();
  const { specialites, grades } = useSettings();
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [grade, setGrade] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const openTasks = tasks.filter(t => t.status === 'ouverte');

  const toggleTask = (id: string) => {
    setSelectedTaskIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const findCandidates = () => {
    const filtered = users.filter(u => {
      if (grade && u.grade !== grade) return false;
      if (specialite && u.specialite !== specialite) return false;
      return true;
    });
    setCandidates(filtered);
  };

  const assign = () => {
    if (!selectedCandidate) {
      alert('Sélectionnez un candidat');
      return;
    }
    selectedTaskIds.forEach(id => updateTask(id, { status: 'affectée', assignedTo: `${selectedCandidate.prenom} ${selectedCandidate.nom}` }));
    alert(`Affecté ${selectedTaskIds.length} tâches à ${selectedCandidate.prenom} ${selectedCandidate.nom}`);
    setSelectedTaskIds([]);
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />

        <main className="main-content-area">
          <h1>Affectation par Grade</h1>

          <section className="assign-section">
            <h3>Tâches ouvertes</h3>
            <div className="tasks-grid">
              {openTasks.map(t => (
                <label key={t.id} className={`task-select ${selectedTaskIds.includes(t.id) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={selectedTaskIds.includes(t.id)} onChange={() => toggleTask(t.id)} />
                  <div className="task-title">{t.title}</div>
                  <div className="task-meta">{t.type} • {t.dateDebut}</div>
                </label>
              ))}
            </div>
          </section>

          <section className="assign-controls">
            <div className="form-row">
              <label>Grade</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="">Tous</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>

              <label>Spécialité</label>
              <select value={specialite} onChange={(e) => setSpecialite(e.target.value)}>
                <option value="">Toutes</option>
                {specialites.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <button className="btn-primary" onClick={findCandidates}>Rechercher</button>
            </div>

            <div className="candidates-list">
              <h4>Utilisateurs</h4>
              {candidates.length === 0 ? <p>Aucun utilisateur trouvé</p> : (
                <ul>
                  {candidates.map(c => (
                    <li key={c.id} className={`candidate ${selectedCandidate?.id === c.id ? 'selected' : ''}`} onClick={() => setSelectedCandidate(c)}>
                      <strong>{c.prenom} {c.nom}</strong>
                      <div className="meta">Grade {c.grade} • {c.specialite}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => { setSelectedTaskIds([]); setSelectedCandidate(null); setCandidates([]); }}>Réinitialiser</button>
              <button className="btn-primary" onClick={assign} disabled={selectedTaskIds.length === 0}>Affecter les tâches sélectionnées</button>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AssignByGrade;
