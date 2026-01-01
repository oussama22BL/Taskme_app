import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { useSettings } from "@/context/SettingsContext";
import "./Settings.css";

const Settings = () => {
  const { specialites, grades, addSpecialite, removeSpecialite, addGrade, removeGrade } = useSettings();
  const [newSpecialite, setNewSpecialite] = useState("");
  const [newGrade, setNewGrade] = useState("");

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />

        <main className="main-content-area">
          <h1>Paramètres</h1>

          <section className="settings-section">
            <h2>Spécialités</h2>
            <div className="items-list">
              {specialites.map(s => (
                <div key={s} className="item-row">
                  <span>{s}</span>
                  <button className="btn-action" onClick={() => removeSpecialite(s)}>Supprimer</button>
                </div>
              ))}
            </div>
            <div className="form-row">
              <input value={newSpecialite} onChange={(e) => setNewSpecialite(e.target.value)} placeholder="Nouvelle spécialité" />
              <button onClick={() => { if (newSpecialite.trim()) { addSpecialite(newSpecialite.trim()); setNewSpecialite(""); } }}>Ajouter</button>
            </div>
          </section>

          <section className="settings-section">
            <h2>Grades</h2>
            <div className="items-list">
              {grades.map(g => (
                <div key={g} className="item-row">
                  <span>{g}</span>
                  <button className="btn-action" onClick={() => removeGrade(g)}>Supprimer</button>
                </div>
              ))}
            </div>
            <div className="form-row">
              <input value={newGrade} onChange={(e) => setNewGrade(e.target.value)} placeholder="Nouveau grade" />
              <button onClick={() => { if (newGrade.trim()) { addGrade(newGrade.trim()); setNewGrade(""); } }}>Ajouter</button>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;
