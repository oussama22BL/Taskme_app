import React from 'react';
import { Edit, Trash2, Car, CheckCircle, XCircle, Users, Shield } from 'lucide-react';
import type { Vehicle } from '../../types';

interface VehicleListProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
  onToggleDisponibilite: (vehicleId: string) => void;
  loading: boolean;
}

const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  onEdit,
  onDelete,
  onToggleDisponibilite,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <Car className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Aucun véhicule trouvé
        </h3>
        <p className="text-slate-600">
          Ajoutez votre premier véhicule à la flotte
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            {/* En-tête */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {vehicle.modele}
                </h3>
                <p className="text-sm text-slate-600">
                  {vehicle.immatriculation}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleDisponibilite(vehicle._id)}
                  className={`p-2 rounded-lg transition ${
                    vehicle.disponibilite
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                  title={vehicle.disponibilite ? 'Disponible' : 'Indisponible'}
                >
                  {vehicle.disponibilite ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Infos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Type d'attribution</span>
                <div className="flex items-center gap-1">
                  {vehicle.typeAttribution === 'individuelle' ? (
                    <Users className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Shield className="w-4 h-4 text-purple-600" />
                  )}
                  <span className="text-sm font-medium text-slate-900 capitalize">
                    {vehicle.typeAttribution}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Direction actuelle</span>
                <span className="text-sm font-medium text-slate-900">
                  {vehicle.directionActuelle || 'Non affectée'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Statut</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  vehicle.disponibilite
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {vehicle.disponibilite ? 'Disponible' : 'Indisponible'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-200">
              <button
                onClick={() => onEdit(vehicle)}
                className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm"
              >
                Modifier
              </button>
              <button
                onClick={() => onDelete(vehicle._id)}
                className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleList;