import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { useTasks } from "../context/TaskContext";
import { taskService } from "../services/taskService";
import "./Reports.css";

const Reports = () => {
  const { tasks } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<"semi" | "auto">("semi");
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  const generateReport = async () => {
    if (!selectedTaskId) {
      alert("Veuillez sélectionner une tâche");
      return;
    }

    try {
      setLoading(true);
      const res = algorithm === "semi"
        ? await taskService.getSemiAutoAssignment(selectedTaskId)
        : await taskService.getAutoAssignment(selectedTaskId);

      setUsers(res.users || []);
      setReportText(res.rapport || "Pas de rapport retourné");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du rapport");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-${selectedTaskId || "general"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Basic summary
  const summary = {
    totalTasks: tasks.length,
    open: tasks.filter(t => t.status === "ouverte").length,
    assigned: tasks.filter(t => t.status === "affectée").length,
    closed: tasks.filter(t => t.status === "clôturée").length,
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />

        <main className="main-content-area reports-page">
          <div className="reports-header">
            <h1>Rapports</h1>
            <p>Générez des rapports d'affectation et exportez-les</p>
          </div>

          <div className="reports-summary">
            <div className="summary-card">Total tâches: <strong>{summary.totalTasks}</strong></div>
            <div className="summary-card">Ouvertes: <strong>{summary.open}</strong></div>
            <div className="summary-card">Affectées: <strong>{summary.assigned}</strong></div>
            <div className="summary-card">Clôturées: <strong>{summary.closed}</strong></div>
          </div>

          <div className="reports-generator">
            <h2>Générer rapport d'affectation</h2>
            <div className="form-row">
              <label>Tâche:</label>
              <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Algorithme:</label>
              <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as any)}>
                <option value="semi">Semi-automatique</option>
                <option value="auto">Automatique (IA)</option>
              </select>
            </div>

            <div className="form-actions">
              <button className="btn-primary" onClick={generateReport} disabled={loading}>{loading ? 'Génération...' : 'Générer'}</button>
              <button className="btn-secondary" onClick={() => { setReportText(null); setUsers([]); }}>Réinitialiser</button>
              <button className="btn-export" onClick={downloadReport} disabled={!reportText}>Télécharger</button>
              <button className="btn-back" onClick={() => navigate(-1)}>Retour</button>
            </div>

            {reportText && (
              <div className="report-output">
                <h3>Rapport</h3>
                <pre className="rapport-text">{reportText}</pre>
                {users.length > 0 && (
                  <div className="users-list">
                    <h4>Utilisateurs proposés</h4>
                    <ul>
                      {users.map((u, i) => (
                        <li key={i}>{u.prenom} {u.nom} ({u.grade || '-'})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Reports;
