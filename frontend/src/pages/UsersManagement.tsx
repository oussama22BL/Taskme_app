import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import Modal from "../components/shared/Modal";
import { useUsers } from "@/context/UsersContext";
import { useSettings } from "@/context/SettingsContext";
import "./UsersManagement.css";

const UsersManagement = () => {
  const { users, updateUser, deleteUser } = useUsers();
  const { specialites, grades } = useSettings();
  const [editing, setEditing] = useState<any>(null);

  const openEdit = (u: any) => setEditing(u);
  const closeEdit = () => setEditing(null);

  const save = (updates: any) => {
    updateUser(editing.id, updates);
    closeEdit();
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />

        <main className="main-content-area">
          <h1>Gestion des utilisateurs</h1>

          <div className="users-list">
            {users.map(u => (
              <div key={u.id} className="user-row">
                <div className="user-info">
                  <strong>{u.prenom} {u.nom}</strong>
                  <div className="meta">Grade: {u.grade || '-' } • Spécialité: {u.specialite || '-'}</div>
                </div>
                <div className="user-actions">
                  <button onClick={() => openEdit(u)} className="btn-action">Éditer</button>
                  <button onClick={() => deleteUser(u.id)} className="btn-action">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />

      <Modal isOpen={!!editing} onClose={closeEdit} title={`Éditer ${editing?.prenom || ''} ${editing?.nom || ''}`}>
        {editing && (
          <div className="edit-form">
            <div className="form-group">
              <label>Grade</label>
              <select defaultValue={editing.grade || ''} onChange={(e) => setEditing({ ...editing, grade: e.target.value })}>
                <option value="">--</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Spécialité</label>
              <select defaultValue={editing.specialite || ''} onChange={(e) => setEditing({ ...editing, specialite: e.target.value })}>
                <option value="">--</option>
                {specialites.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={closeEdit}>Annuler</button>
              <button className="btn-primary" onClick={() => save({ grade: editing.grade, specialite: editing.specialite })}>Enregistrer</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersManagement;
