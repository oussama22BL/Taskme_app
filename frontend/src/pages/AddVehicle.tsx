// React default import not required with the new JSX transform
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import VehicleForm from "../components/vehicles/VehicleForm";
import "./Vehicles.css";

const AddVehicle = () => {
  const navigate = useNavigate();

  const handleSubmit = (payload: any) => {
    // Send back to /vehicles with state to be consumed
    navigate('/vehicles', { state: { newVehicle: payload } });
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
