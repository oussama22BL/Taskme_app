// No React default import required with modern JSX transform
import Navbar from "@components/layout/Navbar";
import Sidebar from "@components/layout/Sidebar";
import Footer from "@components/layout/Footer";

import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const History = () => {
  const [history, setHistory] = useState<any[]>([]);

  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let mounted = true;
    (async () => {
      try {
        const resp = await api.get('/history');
        if (mounted) setHistory(resp.data || []);
      } catch (err: any) {
        console.error('Failed to load history', err);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthenticated, authLoading]);

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />

        <main className="main-content-area">
          <div className="history-header">
            <h1>Historique des actions</h1>
            <p>Historique complet de vos actions et événements</p>
          </div>

          <div className="history-content">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h._id}>
                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                    <td>{h.action}</td>
                    <td>{h.details?.title || JSON.stringify(h.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default History;
