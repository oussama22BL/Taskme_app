// Constantes pour l'application TaskMe

export const APP_NAME = "TaskMe";
export const APP_VERSION = "1.0.0";

// Rôles utilisateurs
export const USER_ROLES = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  USER: "user",
} as const;

// Types de tâches
export const TASK_TYPES = {
  FORMATEUR: "Formateur",
  JURY: "Jury",
  BENEFICIAIRE: "Bénéficiaire",
  OBSERVATEUR: "Observateur",
  CONCEPTEUR: "Concepteur",
} as const;

// Spécialités des auditeurs
export const SPECIALITES = {
  PEDAGOGIQUE: "pédagogique",
  ORIENTATION: "orientation",
  PLANIFICATION: "planification",
  FINANCIER: "financier",
} as const;

// Grades
export const GRADES = {
  A: "A",
  B: "B",
  C: "C",
} as const;

// Directions
export const DIRECTIONS = {
  RABAT_CASA: "Rabat-Casa",
  MEKNES_ERRACHIDIA: "Meknès-Errachidia",
  MARRAKECH_AGADIR: "Marrakech-Agadir",
} as const;

// Statuts des tâches
export const TASK_STATUS = {
  OUVERTE: "ouverte",
  EN_COURS: "en_cours",
  CLOTUREE: "clôturée",
  AFFECTEE: "affectée",
} as const;

// Statuts des affectations
export const ASSIGNMENT_STATUS = {
  EN_ATTENTE: "en_attente",
  ACCEPTEE: "acceptée",
  REFUSEE: "refusée",
  DELEGUEE: "déléguée",
} as const;

// Modes d'affectation
export const ASSIGNMENT_MODES = {
  MANUEL: "manuel",
  SEMI_AUTO: "semi-auto",
  AUTO: "ia",
} as const;

// Délai de réponse (en heures)
export const RESPONSE_DEADLINE_HOURS = 24;

// Types de notifications
export const NOTIFICATION_TYPES = {
  ASSIGNMENT: "affectation",
  REMINDER_24H: "rappel_24h",
  MESSAGE: "message",
  TASK_UPDATE: "task_update",
} as const;

// URLs de l'API
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    VERIFY: "/auth/verify",
    LOGOUT: "/auth/logout",
  },
  TASKS: {
    BASE: "/tasks",
    BY_ID: (id: string) => `/tasks/${id}`,
    USER_TASKS: (userId: string) => `/tasks/user/${userId}`,
  },
  ASSIGNMENTS: {
    BASE: "/assignments",
    RESPOND: (id: string) => `/assignments/${id}/respond`,
    SEMI_AUTO: (taskId: string) => `/assignments/semi-auto/${taskId}`,
    AUTO: (taskId: string) => `/assignments/auto/${taskId}`,
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
    BY_ROLE: (role: string) => `/users/role/${role}`,
  },
  VEHICLES: {
    BASE: "/vehicles",
    AVAILABLE: "/vehicles/available",
  },
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "Ce champ est requis",
  INVALID_EMAIL: "Email invalide",
  PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 6 caractères",
  PASSWORDS_DONT_MATCH: "Les mots de passe ne correspondent pas",
  NETWORK_ERROR: "Erreur de connexion. Veuillez réessayer.",
  UNAUTHORIZED: "Vous n'êtes pas autorisé à accéder à cette ressource",
  NOT_FOUND: "Ressource non trouvée",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard.",
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Connexion réussie",
  LOGOUT_SUCCESS: "Déconnexion réussie",
  TASK_CREATED: "Tâche créée avec succès",
  TASK_UPDATED: "Tâche mise à jour avec succès",
  TASK_DELETED: "Tâche supprimée avec succès",
  ASSIGNMENT_SENT: "Affectation envoyée avec succès",
  RESPONSE_SENT: "Réponse envoyée avec succès",
  PROFILE_UPDATED: "Profil mis à jour avec succès",
} as const;
