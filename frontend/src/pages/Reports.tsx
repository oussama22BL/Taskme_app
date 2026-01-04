 
import Navbar from "@components/layout/Navbar";
import Sidebar from "@components/layout/Sidebar";
import Footer from "@components/layout/Footer";

const Reports = () => {
  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />

        <main className="main-content-area">
          <div className="content-header">
            <div className="header-title-section">
              <h1 className="dashboard-title">Rapports</h1>
              <p>Visualisez les rapports et exportez les données.</p>
            </div>
            <div className="header-action-section">
              <button className="action-button primary-action">Générer un rapport</button>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3>Rapports récents</h3>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Taille</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Rapport utilisateurs</td>
                    <td>2025-12-28</td>
                    <td>PDF</td>
                    <td>1.2 MB</td>
                    <td><button className="btn-action">Télécharger</button></td>
                  </tr>
                  <tr>
                    <td>Rapport tâches</td>
                    <td>2025-12-20</td>
                    <td>CSV</td>
                    <td>320 KB</td>
                    <td><button className="btn-action">Télécharger</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Reports;
