import { useState } from "react";
import { SPECIALITES, GRADES } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useUsers } from "@/context/UsersContext";
// useAuth not needed here currently
import { useTasks } from "../context/TaskContext";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import TaskForm from "../components/tasks/TaskForm";
import TaskCard from "../components/tasks/TaskCard";
import Modal from "../components/shared/Modal";
import "./CoordinatorTasks.css";

const CoordinatorTasks = () => {
  // user not used yet
  const { tasks, addTask, updateTask } = useTasks();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [candidateGrade, setCandidateGrade] = useState<string>("");
  const [candidateSpecialite, setCandidateSpecialite] = useState<string>("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<string>("best");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [candidateToConfirm, setCandidateToConfirm] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"all" | "open" | "assigned">("all");
  const [filterSpecialite, setFilterSpecialite] = useState<string>("");
  const [filterGrade, setFilterGrade] = useState<string>("");

  const filteredTasks = tasks.filter(task => {
    if (viewMode === "open") {
      if (task.status !== "ouverte") return false;
    }
    if (viewMode === "assigned") {
      if (task.status !== "affectée") return false;
    }

    if (filterSpecialite) {
      if (!(task.specialitesConcernees ?? []).includes(filterSpecialite)) return false;
    }

    if (filterGrade) {
      if (!(task.gradesConcernes ?? []).includes(filterGrade)) return false;
    }

    return true;
  });

  const handleCreateTask = (taskData: any) => {
    addTask({
      ...taskData,
      status: "ouverte"
    });
    setShowCreateModal(false);
  };

  // users from UsersContext
  const { users } = useUsers();

  const openAssignModal = (task: any) => {
    setSelectedTask(task);
    setCandidateGrade("");
    setCandidateSpecialite("");
    setCandidates([]);
    setShowAssignModal(true);
  };

  const findCandidates = () => {
    const filtered = (users || []).filter((u: any) => {
      if (candidateGrade && u.grade !== candidateGrade) return false;
      if (candidateSpecialite && u.specialite !== candidateSpecialite) return false;
      return true;
    });
    setCandidates(filtered);
    setPage(1);
  };

  const assignTo = (user: any) => {
    // Open confirm modal instead of direct assign
    setCandidateToConfirm(user);
    setShowConfirmModal(true);
  };

  const assignConfirmed = () => {
    if (!selectedTask || !candidateToConfirm) return;
    updateTask(selectedTask.id, { status: 'affectée', assignedTo: `${candidateToConfirm.prenom} ${candidateToConfirm.nom}` });
    setShowConfirmModal(false);
    setShowAssignModal(false);
    setSelectedTask(null);
    setCandidates([]);
    alert(`Tâche affectée à ${candidateToConfirm.prenom} ${candidateToConfirm.nom}`);
    setCandidateToConfirm(null);
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />
        
        <main className="main-content-area">
          <div className="tasks-header">
            <h1>Gestion des tâches - Coordinateur</h1>
            <p>Vous êtes connecté en tant que Coordinateur</p>
            
            <div className="header-actions">
              <button 
                className="btn-primary"
                onClick={() => setShowCreateModal(true)}
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
          
          <div className="tasks-filters">
            <div className="filter-group">
              <label>Type de tâche:</label>
              <select>
                <option value="">Tous</option>
                <option value="Formateur">Formateur</option>
                <option value="Jury">Jury</option>
                <option value="Bénéficiaire">Bénéficiaire</option>
                <option value="Observateur">Observateur</option>
                <option value="Concepteur">Concepteur</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Spécialité:</label>
              <select value={filterSpecialite} onChange={(e) => setFilterSpecialite(e.target.value)}>
                <option value="">Toutes</option>
                {Object.values(SPECIALITES).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Grade:</label>
              <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                <option value="">Tous</option>
                {Object.values(GRADES).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Période:</label>
              <input type="date" />
              <span>à</span>
              <input type="date" />
            </div>
            
            <div className="filter-group">
              <label>
                <input type="checkbox" />
                Tâches rémunérées uniquement
              </label>
            </div>
          </div>
          
          <div className="tasks-list">
            {filteredTasks.length === 0 ? (
              <div className="no-tasks">
                <p>Aucune tâche trouvée</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="task-item-with-actions">
                  <TaskCard task={task} />
                  <div className="task-item-actions">
                    {task.status !== 'affectée' && (
                      <button className="btn-action" onClick={() => openAssignModal(task)}>Affecter par grade</button>
                    )}
                    <button className="btn-action">Détails</button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="coordinator-actions">
            <h2>Actions de coordination</h2>
            <div className="action-buttons">
              <button className="btn-action" onClick={() => navigate('/assign-by-grade')}>Affectation manuelle</button>
              <button className="btn-action">Affectation semi-automatique</button>
              <button className="btn-action">Affectation automatique (IA)</button>
              <button className="btn-action">Gérer les véhicules</button>
              <button className="btn-action" onClick={() => navigate('/reports')}>Générer rapports</button>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
      
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer une nouvelle tâche"
      >
          <TaskForm onCreate={handleCreateTask} />
      </Modal>

      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={selectedTask ? `Affecter: ${selectedTask.title}` : "Affecter une tâche"}
      >
        <div className="assign-modal">
          <div className="form-row">
            <div className="form-group">
              <label>Grade</label>
              <select value={candidateGrade} onChange={(e) => setCandidateGrade(e.target.value)}>
                <option value="">Tous</option>
                {Object.values(GRADES).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Spécialité</label>
              <select value={candidateSpecialite} onChange={(e) => setCandidateSpecialite(e.target.value)}>
                <option value="">Toutes</option>
                {Object.values(SPECIALITES).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={findCandidates}>Rechercher</button>
            <button className="btn-secondary" onClick={() => { setCandidateGrade(''); setCandidateSpecialite(''); setCandidates([]); }}>Réinitialiser</button>
          </div>

          <div className="candidates-controls">
            <label>Trier par:</label>
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
              <option value="best">Taux d'acceptation (meilleur)</option>
              <option value="acceptance-asc">Taux d'acceptation (croissant)</option>
              <option value="name-asc">Nom (A-Z)</option>
              <option value="name-desc">Nom (Z-A)</option>
            </select>

            <label>Résultats par page:</label>
            <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}>
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>

          <div className="candidates-list">
            {candidates.length === 0 ? (
              <p>Aucun candidat trouvé</p>
            ) : (
              (() => {
                // sorting
                const sorted = [...candidates].sort((a, b) => {
                  if (sortBy === 'best') return (b.acceptanceRate || 0) - (a.acceptanceRate || 0);
                  if (sortBy === 'acceptance-asc') return (a.acceptanceRate || 0) - (b.acceptanceRate || 0);
                  if (sortBy === 'name-asc') return (`${a.prenom} ${a.nom}`).localeCompare(`${b.prenom} ${b.nom}`);
                  if (sortBy === 'name-desc') return (`${b.prenom} ${b.nom}`).localeCompare(`${a.prenom} ${a.nom}`);
                  return 0;
                });

                const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
                const start = (page - 1) * pageSize;
                const paged = sorted.slice(start, start + pageSize);

                return (
                  <>
                    <ul>
                      {paged.map(u => (
                        <li key={u.id} className="candidate-item">
                          <div className="candidate-info">
                            <div className="candidate-name">{u.prenom} {u.nom}</div>
                            <div className="candidate-meta">Grade {u.grade} • {u.specialite}</div>
                          </div>
                          <div className="candidate-actions">
                            <div className="candidate-rate">Acceptation: <strong>{(u.acceptanceRate||0).toFixed(0)}%</strong></div>
                            <button className="btn-action" onClick={() => assignTo(u)}>Affecter</button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="pagination-controls">
                      <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))}>Préc.</button>
                      <span>Page {page} / {totalPages}</span>
                      <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Suiv.</button>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={candidateToConfirm ? `Confirmer affectation à ${candidateToConfirm.prenom} ${candidateToConfirm.nom}` : "Confirmer affectation"}
      >
        <div className="confirm-modal">
          <p>Vous êtes sur le point d'affecter la tâche <strong>{selectedTask?.title}</strong> à <strong>{candidateToConfirm ? `${candidateToConfirm.prenom} ${candidateToConfirm.nom}` : ``}</strong>.</p>
          <p>Êtes-vous sûr de vouloir procéder ?</p>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>Annuler</button>
            <button className="btn-primary" onClick={assignConfirmed}>Confirmer l'affectation</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CoordinatorTasks;