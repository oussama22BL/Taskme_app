// React import not needed with the automatic JSX runtime
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

const NotFound = () => {
  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />
        <main className="main-content-area">
          <div className="not-found-container">
            <h1>404</h1>
            <h2>Page non trouvée</h2>
            <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
            <Link to="/" className="btn-primary">
              Retour à l'accueil
            </Link>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;