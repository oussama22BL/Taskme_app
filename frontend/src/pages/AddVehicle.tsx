// React default import not required with the new JSX transform
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import VehicleForm from "../components/vehicles/VehicleForm";
import { createVehicle } from "../services/vehicleService";
import "./Vehicles.css";

const AddVehicle = () => {
  const navigate = useNavigate();

  const handleSubmit = async (payload: any) => {
    try {
      await createVehicle(payload);
      alert("Véhicule ajouté avec succès !");
      // navigate back to vehicles - Vehicles page will reload from API
      navigate('/vehicles');
    } catch (err: any) {
      console.error('Create vehicle error', err);
      alert(err?.response?.data?.msg || 'Erreur lors de la création du véhicule');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />
        <main className="main-content-area">
          <div className="vehicles-header">
            <h1>Ajouter un véhicule</h1>
            <p>Remplissez les informations du véhicule</p>
          </div>

          <div className="add-vehicle-page">
            <VehicleForm onSubmit={handleSubmit} submitLabel="Ajouter le véhicule" />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AddVehicle;
