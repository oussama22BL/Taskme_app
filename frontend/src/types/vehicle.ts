export interface Vehicle {
  id: string;
  matricule: string;
  marque: string;
  modele: string;
  type: string;
  carburant: string;
  annee: number;
  kilometrage: number;
  couleur: string;
  etat: 'disponible' | 'en_mission' | 'en_maintenance' | 'hors_service';
  affectation: 'individuelle' | 'partagee' | 'direction';
  affecteA?: string;
  affecteId?: string;
  dateAffectation?: string;
  dateFinAffectation?: string;
  disponibilite: boolean;
  assurance: {
    numero: string;
    dateExpiration: string;
    compagnie: string;
  };
  dernierControle: string;
  prochainControle: string;
  capacite: number;
  options: string[];
  commentaires?: string;
}
