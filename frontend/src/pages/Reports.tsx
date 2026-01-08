import React, { useEffect, useState } from 'react';
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import reportService from "../services/reportService";
import { useAuth } from "../context/AuthContext";

const Reports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      const res = await reportService.listReports();
      setReports(res || []);
    } catch (err) {
      console.error('Failed to load reports', err);
      alert('Impossible de charger les rapports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload: any) => {
    try {
      await reportService.createReport(payload);
      await load();
      alert('Rapport créé');
    } catch (err: any) {
      console.error('Create report error', err);
      alert(err?.response?.data?.msg || 'Erreur lors de la création');
    }
  };

  const handleExport = async (id: string, format: 'csv'|'pdf') => {
    try {
      const blob = await reportService.exportReport(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Export error', err);
      alert(err?.response?.data?.msg || 'Erreur lors de l\'export');
    }
  };

  const handleUploadAttachment = async (id: string) => {
    const input = (document.getElementById(`file-${id}`) as HTMLInputElement | null);
    if (!input || !input.files || input.files.length === 0) {
      alert('Sélectionnez un fichier (PDF ou CSV)');
      return;
    }
    const file = input.files[0];
    try {
      await reportService.uploadAttachment(id, file);
      await load();
      alert('Fichier attaché');
      if (input) input.value = '';
    } catch (err: any) {
      console.error('Upload error', err);
      alert(err?.response?.data?.msg || 'Erreur lors du upload');
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
              <h1 className="dashboard-title">Rapports</h1>
              <p>Historique individuel et global</p>
            </div>
            <div className="header-action-section">
              {(user?.role === 'admin' || user?.role === 'superAdmin') && (
                <button className="action-button primary-action" onClick={() => navigate('/reports/create')}>+ Nouveau rapport</button>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3>Rapports récents</h3>

              {loading ? (
                <div>Chargement...</div>
              ) : (
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr><td colSpan={5}>Aucun rapport</td></tr>
                    ) : (
                      reports.map(r => (
                        <tr key={r._id || r.id}>
                          <td>{r.title}</td>
                          <td>{new Date(r.createdAt).toLocaleString()}</td>
                          <td>{r.type}</td>
                          <td>{r.status}</td>
                          <td>
                            <button className="btn-action" onClick={() => window.alert(JSON.stringify(r, null, 2))}>Voir</button>
                            <button className="btn-action" onClick={() => handleExport(r._id, 'csv')}>Export CSV</button>
                            <button className="btn-action" onClick={() => handleExport(r._id, 'pdf')}>Export PDF</button>
                            {((user?.role === 'admin' || user?.role === 'superAdmin') || (r.author && (r.author._id === user?._id || r.author.id === user?._id))) && (
                              <div style={{ marginTop: 8 }}>
                                <input type="file" id={`file-${r._id}`} accept=".pdf,.csv,application/pdf,text/csv" />
                                <button className="btn-action" onClick={() => handleUploadAttachment(r._id)}>Upload</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Reports;
