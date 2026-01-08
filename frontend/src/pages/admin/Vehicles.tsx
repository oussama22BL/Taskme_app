import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { vehicleApi } from '../../api/vehicleApi';
import VehicleList from '../../components/vehicles/VehicleList';
import VehicleForm from '../../components/vehicles/VehicleForm';
import type { Vehicle } from '../../types';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleApi.getAllVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) {
      try {
        await vehicleApi.deleteVehicle(id);
        fetchVehicles();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleDisponibilite = async (id: string) => {
    try {
      await vehicleApi.toggleDisponibilite(id);
      fetchVehicles();
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const openCreateForm = () => {
    setSelectedVehicle(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Parc Automobile</h1>
          <p className="text-slate-500 mt-1">Gérez la disponibilité et l'affectation de la flotte.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchVehicles}
            className="p-3 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Nouveau Véhicule
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Flotte</p>
          <p className="text-2xl font-bold text-slate-900">{vehicles.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Disponibles</p>
          <p className="text-2xl font-bold text-emerald-600">
            {vehicles.filter(v => v.disponibilite).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-500">En Mission</p>
          <p className="text-2xl font-bold text-amber-600">
            {vehicles.filter(v => !v.disponibilite).length}
          </p>
        </div>
      </div>

      {/* Liste des véhicules */}
      <VehicleList
        vehicles={vehicles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleDisponibilite={handleToggleDisponibilite}
        loading={loading}
      />

      {/* Modal du formulaire */}
      {isFormOpen && (
        <VehicleForm
          vehicle={selectedVehicle}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchVehicles}
        />
      )}
    </div>
  );
};

export default Vehicles;