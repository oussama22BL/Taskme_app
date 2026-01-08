import React, { useEffect, useState } from 'react';
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import ReportForm from "../components/reports/ReportForm";
import { userService } from "../services/userService";
import reportService from "../services/reportService";
import { useNavigate } from 'react-router-dom';

const CreateReport = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await userService.listUsers();
        setUsers(data || []);
      } catch (err) {
        console.error('Failed to load users', err);
        alert('Impossible de charger la liste des utilisateurs');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const handleCreate = async (payload: any, file?: File | null) => {
    try {
      const created = await reportService.createReport(payload);
      const id = created._id || created.id || created;
      if (file) {
        await reportService.uploadAttachment(id, file);
      }
      alert('Rapport créé');
      navigate('/reports');
    } catch (err: any) {
      console.error('Create report error', err);
      alert(err?.response?.data?.msg || 'Erreur lors de la création');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />

        <main className="main-content-area">
          <div className="content-header">
            <div className="header-title-section">
              <h1 className="dashboard-title">Nouveau rapport</h1>
              <p>Créer un rapport — remplissez les informations et générez le document</p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3>Informations du rapport</h3>

              <ReportForm onSubmit={handleCreate} users={users} />

            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CreateReport;
