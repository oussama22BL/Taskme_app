import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { userService } from '../services/userService';
import UserForm from '../components/users/UserForm';
import Modal from '../components/shared/Modal';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/constants';
import './ManageUsers.css';

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.listUsers();
      setUsers(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEdit = (u: any) => {
    setEditingUser(u);
    setShowEditModal(true);
  };
  const handleEditSubmit = async (data: any) => {
    if (!editingUser) return;
    const id = editingUser.id || editingUser._id;
    try {
      setActionLoading(id);
      await userService.updateUser(id, data);
      setShowEditModal(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (u: any) => {
    const id = u.id || u._id;
    if (!window.confirm(`Supprimer l'utilisateur ${u.prenom} ${u.nom} ?`)) return;
    try {
      setActionLoading(id);
      await userService.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  // Activation/deactivation feature cancelled — related handler removed

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />

        <main className="main-content-area">
          <div className="content-header">
            <div className="header-title-section">
              <h1 className="dashboard-title">Gestion des utilisateurs</h1>
            </div>
            <div className="header-action-section">
              <button className="action-button primary-action" onClick={() => window.location.href = '/register'}>
                <span className="button-icon">+</span>
                <span className="button-text">Nouvel utilisateur</span>
              </button>
            </div>
          </div>

          <div className="users-list-section">
            {loading && <p>Chargement...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && (
              <>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Spécialité</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr><td colSpan={6}>Aucun utilisateur trouvé</td></tr>
                    )}
                    {users.map((u) => (
                      <tr key={u.id || u._id}>
                        <td>{u.prenom} {u.nom}</td>
                        <td>{u.email}</td>
                        <td>{ROLE_LABELS[u.role] || u.role}</td>
                        <td>{u.specialite}</td>
                        <td>{u.grade}</td>
                        <td>
                          <button className="action-button" onClick={() => openEdit(u)}>Modifier</button>
                          {/* Prevent deleting self */}
                          {currentUser?.id !== (u.id || u._id) && (
                            <button className="action-button danger" onClick={() => handleDelete(u)} disabled={actionLoading === (u.id || u._id)}>Supprimer</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingUser(null); }} title="Modifier l'utilisateur">
                  {editingUser && (
                    <UserForm
                      mode="edit"
                      initialData={editingUser}
                      includeRole={true}
                      allowedRoles={currentUser?.role === 'superAdmin' ? ["user","admin","superAdmin"] : (currentUser?.role === 'admin' ? ["user","admin"] : ["user"])}
                      onSubmit={handleEditSubmit}
                      onCancel={() => { setShowEditModal(false); setEditingUser(null); }}
                    />
                  )}
                </Modal>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ManageUsers;
