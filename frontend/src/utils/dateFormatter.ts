/**
 * Utilitaires de formatage de dates pour TaskMe
 */

/**
 * Formate une date au format français
 * @param dateString - Date en format ISO string ou Date object
 * @returns Date formatée (ex: "15 janvier 2024")
 */
export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString('fr-FR', options);
};

/**
 * Formate une date avec l'heure
 * @param dateString - Date en format ISO string ou Date object
 * @returns Date et heure formatées (ex: "15/01/2024 à 14:30")
 */
export const formatDateTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString('fr-FR');
  const timePart = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} à ${timePart}`;
};

/**
 * Formate une période (date début - date fin)
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @returns Période formatée (ex: "15-20 janvier 2024")
 */
export const formatPeriod = (startDate: string | Date, endDate: string | Date): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Si mêmes mois et année
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
  }
  
  // Si même année mais mois différents
  if (start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} ${start.toLocaleDateString('fr-FR', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
  }
  
  // Années différentes
  return `${formatDate(start)} - ${formatDate(end)}`;
};

/**
 * Calcule la durée entre deux dates en jours
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @returns Nombre de jours
 */
export const calculateDuration = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le dernier jour
};

/**
 * Vérifie si une date est dans le futur
 * @param dateString - Date à vérifier
 * @returns true si la date est dans le futur
 */
export const isFutureDate = (dateString: string | Date): boolean => {
  const date = new Date(dateString);
  return date > new Date();
};

/**
 * Vérifie si deux périodes se chevauchent
 * @param start1 - Début période 1
 * @param end1 - Fin période 1
 * @param start2 - Début période 2
 * @param end2 - Fin période 2
 * @returns true si les périodes se chevauchent
 */
export const hasDateOverlap = (
  start1: string | Date,
  end1: string | Date,
  start2: string | Date,
  end2: string | Date
): boolean => {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  
  return (s1 <= e2 && e1 >= s2);
};

/**
 * Ajoute des jours à une date
 * @param dateString - Date de base
 * @param days - Nombre de jours à ajouter
 * @returns Nouvelle date
 */
export const addDays = (dateString: string | Date, days: number): Date => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Formate la durée en texte lisible
 * @param days - Nombre de jours
 * @returns Durée formatée (ex: "3 jours", "1 semaine")
 */
export const formatDuration = (days: number): string => {
  if (days === 1) return '1 jour';
  if (days < 7) return `${days} jours`;
  if (days === 7) return '1 semaine';
  if (days < 30) return `${Math.floor(days / 7)} semaines`;
  if (days === 30) return '1 mois';
  return `${Math.floor(days / 30)} mois`;
};

/**
 * Formate l'heure restante pour une deadline
 * @param deadline - Date limite
 * @returns Temps restant formaté (ex: "Dans 2 heures", "Expiré")
 */
export const formatTimeRemaining = (deadline: string | Date): string => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  
  if (diffMs < 0) return 'Expiré';
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    return `Dans ${days} jour${days > 1 ? 's' : ''}`;
  }
  
  if (diffHours > 0) {
    return `Dans ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  }
  
  return `Dans ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
};
