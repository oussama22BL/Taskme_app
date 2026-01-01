import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import Modal from "../components/shared/Modal";
import { taskService } from "../services/taskService";
import { Vehicle } from "@/types";
import { DIRECTIONS } from "@/utils/constants";
import "./Vehicles.css";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<string>("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [assignmentId, setAssignmentId] = useState("");

  const fetchVehicles = async (dir?: string) => {
    try {
      setLoading(true);
      const data = await taskService.getAvailableVehicles(dir);
      setVehicles(data);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(direction || undefined);
  }, [direction]);

  const openAssignModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setAssignmentId("");
    setAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedVehicle) return;
    if (!assignmentId.trim()) {
      alert("Veuillez renseigner l'ID d'affectation");
      return;
    }

    try {
      await taskService.assignVehicle(selectedVehicle.id, assignmentId.trim());
      alert("Véhicule affecté avec succès");
      setAssignModalOpen(false);
      // refresh list
      fetchVehicles(direction || undefined);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'affectation du véhicule");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />

        <main className="main-content-area vehicles-page">
          <div className="vehicles-header">
            <h1>Véhicules</h1>
            <p>Liste des véhicules disponibles pour affectation</p>

            <div className="vehicles-filters">
              <label>Direction:</label>
              <select value={direction} onChange={(e) => setDirection(e.target.value)}>
                <option value="">Toutes</option>
                {Object.values(DIRECTIONS).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button className="btn-refresh" onClick={() => fetchVehicles(direction || undefined)}>🔁 Rafraîchir</button>
            </div>
          </div>

          <div className="vehicles-list">
            {loading ? (
              <div className="loader">Chargement...</div>
            ) : vehicles.length === 0 ? (
              <div className="no-vehicles">Aucun véhicule disponible</div>
            ) : (
              vehicles.map((v) => (
                <div key={v.id} className="vehicle-card">
                  <div className="vehicle-main">
                    <strong>{v.modele}</strong> • {v.immatriculation}
                  </div>
                  <div className="vehicle-meta">
                    <span>{v.typeDistribution || "-"}</span>
                    <span>{v.direction || "-"}</span>
                    <span>{v.disponible ? "Disponible" : "Indisponible"}</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-assign" onClick={() => openAssignModal(v)}>Affecter</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <Footer />

      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Affecter le véhicule ${selectedVehicle?.immatriculation || ""}`}
      >
        <div className="assign-modal">
          <div className="form-group">
            <label>ID d'affectation</label>
            <input value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} placeholder="Entrez l'ID d'affectation" />
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setAssignModalOpen(false)}>Annuler</button>
            <button className="btn-confirm" onClick={handleAssign}>Affecter</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Vehicles;
