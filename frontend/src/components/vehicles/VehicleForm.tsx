import { useState, FormEvent } from "react";
import { Vehicle } from "../../types/vehicle";

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSubmit: (data: Partial<Vehicle>) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const VehicleForm = ({ initialData = {}, onSubmit, onCancel, submitLabel = "Ajouter" }: VehicleFormProps) => {
  const [form, setForm] = useState<Partial<Vehicle>>({
    matricule: initialData.matricule || "",
    marque: initialData.marque || "",
    modele: initialData.modele || "",
    type: initialData.type || "Berline",
    carburant: initialData.carburant || "Essence",
    annee: initialData.annee || new Date().getFullYear(),
    kilometrage: initialData.kilometrage || 0,
    couleur: initialData.couleur || "",
    etat: initialData.etat || 'disponible',
    affectation: initialData.affectation || 'individuelle',
    disponibilite: initialData.disponibilite ?? true,
    assurance: initialData.assurance || { numero: '', dateExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], compagnie: '' },
    dernierControle: initialData.dernierControle || new Date().toISOString().split('T')[0],
    prochainControle: initialData.prochainControle || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    capacite: initialData.capacite || 5,
    options: initialData.options || []
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ ...initialData, ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="vehicle-form">
      <div className="form-section">
        <div className="form-row double">
          <div>
            <label>Matricule *</label>
            <input
              type="text"
              value={form.matricule}
              onChange={(e) => setForm({ ...form, matricule: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Type d'affectation</label>
            <select
              value={form.affectation}
              onChange={(e) => setForm({ ...form, affectation: e.target.value as any })}
            >
              <option value="individuelle">Individuelle</option>
              <option value="partagee">Partagée (même direction)</option>
              <option value="direction">Direction</option>
            </select>
          </div>
        </div>

        <div className="form-row double">
          <div>
            <label>Marque *</label>
            <input
              type="text"
              value={form.marque}
              onChange={(e) => setForm({ ...form, marque: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Modèle *</label>
            <input
              type="text"
              value={form.modele}
              onChange={(e) => setForm({ ...form, modele: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row double">
          <div>
            <label>Type de véhicule</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="Berline">Berline</option>
              <option value="SUV">SUV</option>
              <option value="Utilitaire">Utilitaire</option>
              <option value="4x4">4x4</option>
              <option value="Minibus">Minibus</option>
              <option value="Bus">Bus</option>
            </select>
          </div>

          <div>
            <label>Carburant</label>
            <select
              value={form.carburant}
              onChange={(e) => setForm({ ...form, carburant: e.target.value })}
            >
              <option value="Essence">Essence</option>
              <option value="Diesel">Diesel</option>
              <option value="Electrique">Électrique</option>
              <option value="Hybride">Hybride</option>
            </select>
          </div>
        </div>

        <div className="form-row double">
          <div>
            <label>Année</label>
            <input
              type="number"
              value={form.annee}
              onChange={(e) => setForm({ ...form, annee: parseInt(e.target.value) || new Date().getFullYear() })}
              min="2000"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div>
            <label>Couleur</label>
            <input
              type="text"
              value={form.couleur}
              onChange={(e) => setForm({ ...form, couleur: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row double">
          <div>
            <label>Kilométrage</label>
            <input
              type="number"
              value={form.kilometrage}
              onChange={(e) => setForm({ ...form, kilometrage: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <div>
            <label>Capacité (passagers)</label>
            <input
              type="number"
              value={form.capacite}
              onChange={(e) => setForm({ ...form, capacite: parseInt(e.target.value) || 5 })}
              min="1"
              max="50"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>État et maintenance</h4>

        <div className="form-row double">
          <div>
            <label>État initial</label>
            <select
              value={form.etat}
              onChange={(e) => setForm({ ...form, etat: e.target.value as any })}
            >
              <option value="disponible">Disponible</option>
              <option value="en_maintenance">En maintenance</option>
              <option value="hors_service">Hors service</option>
            </select>
          </div>

          <div>
            <label>Dernier contrôle technique</label>
            <input
              type="date"
              value={form.dernierControle}
              onChange={(e) => setForm({ ...form, dernierControle: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <label>Prochain contrôle</label>
          <input
            type="date"
            value={form.prochainControle}
            onChange={(e) => setForm({ ...form, prochainControle: e.target.value })}
          />
        </div>

        <div className="form-row">
          <label>Options/Équipements</label>
          <div className="checkbox-group">
            {['GPS', 'Climatisation', 'Camera de recul', 'Régulateur', 'Toit ouvrant', 'Sièges chauffants'].map(option => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.options?.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({ ...form, options: [...(form.options || []), option] });
                    } else {
                      setForm({ ...form, options: form.options?.filter((o: string) => o !== option) });
                    }
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Assurance</h4>

        <div className="form-row">
          <label>Numéro d'assurance</label>
          <input
            type="text"
            value={form.assurance?.numero}
            onChange={(e) => setForm({ ...form, assurance: { ...(form.assurance || {}), numero: e.target.value } as any })}
          />
        </div>

        <div className="form-row double">
          <div>
            <label>Compagnie d'assurance</label>
            <input
              type="text"
              value={form.assurance?.compagnie}
              onChange={(e) => setForm({ ...form, assurance: { ...(form.assurance || {}), compagnie: e.target.value } as any })}
            />
          </div>

          <div>
            <label>Date d'expiration</label>
            <input
              type="date"
              value={form.assurance?.dateExpiration}
              onChange={(e) => setForm({ ...form, assurance: { ...(form.assurance || {}), dateExpiration: e.target.value } as any })}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-cancel" onClick={onCancel}>Annuler</button>
        )}
        <button type="submit" className="btn-confirm">{submitLabel}</button>
      </div>
    </form>
  );
};

export default VehicleForm;
