import React, { useState } from 'react';
import { Car, X } from 'lucide-react';
import type { Vehicle } from '../../types';
import axiosInstance from '../../api/axiosConfig';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onClose: () => void;
  onSuccess: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    modele: vehicle?.modele || '',
    immatriculation: vehicle?.immatriculation || '',
    disponibilite: vehicle?.disponibilite ?? true,
    typeAttribution: vehicle?.typeAttribution || 'individuelle',
    directionActuelle: vehicle?.directionActuelle || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const vehicleTypes = ['Voiture', 'SUV', 'Utilitaire', 'Camionnette'];
  const directions = [
    'Direction des Finances',
    'Direction des Systèmes d\'Information',
    'Direction des Ressources Humaines',
    'Direction des Opérations',
    'Direction Juridique',
    'Non affectée'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (vehicle) {
        await axiosInstance.put(`/vehicles/${vehicle._id}`, formData);
      } else {
        await axiosInstance.post('/vehicles', formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const validateImmatriculation = (plate: string) => {
    const regex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
    return regex.test(plate.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              {vehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Modèle *
            </label>
            <input
              type="text"
              value={formData.modele}
              onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Immatriculation *
            </label>
            <input
              type="text"
              value={formData.immatriculation}
              onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value.toUpperCase() })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                formData.immatriculation && !validateImmatriculation(formData.immatriculation)
                  ? 'border-red-300'
                  : 'border-slate-300'
              }`}
              placeholder="AA-123-BB"
              required
            />
            {formData.immatriculation && !validateImmatriculation(formData.immatriculation) && (
              <p className="mt-1 text-sm text-red-600">
                Format invalide. Utilisez: AA-123-BB
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type d'attribution *
              </label>
              <select
                value={formData.typeAttribution}
                onChange={(e) => setFormData({ ...formData, typeAttribution: e.target.value as any })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="individuelle">Individuelle</option>
                <option value="partagée">Partagée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Direction actuelle
              </label>
              <select
                value={formData.directionActuelle}
                onChange={(e) => setFormData({ ...formData, directionActuelle: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner</option>
                {directions.map((dir) => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="disponibilite"
                checked={formData.disponibilite}
                onChange={(e) => setFormData({ ...formData, disponibilite: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="disponibilite" className="ml-2 text-sm text-slate-700">
                Disponible immédiatement
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loading ? 'Enregistrement...' : (vehicle ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;