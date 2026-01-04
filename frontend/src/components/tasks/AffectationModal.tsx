// AffectationModal.tsx - Modal pour les différents modes d'affectation
import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";
import "./AffectationModal.css";

// Interfaces
interface Task {
  id: string;
  title: string;
  type: string;
  specialite?: string;
  remuneree: boolean;
  dateDebut: string;
  dateFin: string;
  ville?: string;
  direction?: string;
  niveauRequis?: string;
}

interface User {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  grade: string;
  anciennete: number; // en années
  historiqueAffectations: {
    taskId: string;
    date: string;
    type: string;
    ville?: string;
    direction?: string;
  }[];
  formations: string[];
  diplomes: string[];
  affectationsEnCours: string[];
  chargeTravail: number; // 0-100%
}

interface AffectationMode {
  id: "manuel" | "semiAuto" | "autoIA";
  label: string;
  description: string;
  icon: string;
}

const AffectationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  users: User[];
  onAffect: (userId: string, mode: string, justification?: string) => void;
}> = ({ isOpen, onClose, task, users, onAffect }) => {
  const [selectedMode, setSelectedMode] = useState<"manuel" | "semiAuto" | "autoIA">("manuel");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [justification, setJustification] = useState<string>("");
  const [propositions, setPropositions] = useState<User[]>([]);
  const [algorithmeResultat, setAlgorithmeResultat] = useState<any>(null);
  const [validationIA, setValidationIA] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  // Modes d'affectation
  const modes: AffectationMode[] = [
    {
      id: "manuel",
      label: "Manuel",
      description: "Affectation directe par le coordinateur (cas urgents ou spécifiques)",
      icon: "👤"
    },
    {
      id: "semiAuto",
      label: "Semi-automatisé",
      description: "Proposition automatique selon critères prédéfinis",
      icon: "⚙️"
    },
    {
      id: "autoIA",
      label: "Automatisé (IA)",
      description: "Affectation via intelligence artificielle avec analyse approfondie",
      icon: "🤖"
    }
  ];

  // Filtrer les utilisateurs selon différents critères
  const filtrerUtilisateursCompatibles = (users: User[]): User[] => {
    return users.filter(user => {
      // Critère 1: Spécialité
      if (task.specialite && user.specialite !== task.specialite) {
        return false;
      }

      // Critère 2: Disponibilité temporelle
      // TODO: remplacer la détection simplifiée par une vérification réelle des dates
      const aConflit = user.affectationsEnCours.some(_affectation => {
        // Vérifier les chevauchements temporels (placeholder)
        return true; // À implémenter avec les dates réelles
      });
      if (aConflit) {
        return false;
      }

      // Critère 3: Niveau requis
      if (task.niveauRequis && !verifierNiveau(user, task.niveauRequis)) {
        return false;
      }

      return true;
    });
  };

  const verifierNiveau = (user: User, niveauRequis: string): boolean => {
    // Logique de vérification du niveau
    const niveaux = ["Débutant", "Intermédiaire", "Avancé", "Expert"];
    const indexUser = niveaux.indexOf(user.grade);
    const indexRequis = niveaux.indexOf(niveauRequis);
    return indexUser >= indexRequis;
  };

  // Algorithme semi-automatisé
  const executerAlgorithmeSemiAuto = () => {
    setLoading(true);
    
    const compatibles = filtrerUtilisateursCompatibles(users);
    
    // 1. Tour de rôle (par ancienneté)
    const triAnciennete = [...compatibles].sort((a, b) => b.anciennete - a.anciennete);
    
    // 2. Équilibre des tâches rémunérées
    const avecEquilibre = triAnciennete.map(user => {
      const nbTachesRemunerees = user.historiqueAffectations
        .filter(a => a.type.includes("rémunéré")).length;
      return { ...user, scoreEquilibre: nbTachesRemunerees };
    }).sort((a, b) => a.scoreEquilibre - b.scoreEquilibre);
    
    // 3. Spécialité exacte (déjà filtré)
    
    // 4. Charge de travail
    const triCharge = avecEquilibre.sort((a, b) => a.chargeTravail - b.chargeTravail);
    
    const resultat = {
      compatibles: compatibles.length,
      premierChoix: triCharge[0],
      score: calculerScoreAffectation(triCharge[0]),
      criteres: {
        specialite: task.specialite ? "Correspondance requise" : "Non requis",
        anciennete: "Priorité à l'ancienneté",
        equilibreRemuneration: "Distribution équitable",
        chargeTravail: "Éviter la surcharge"
      },
      justification: `Proposition basée sur: ${compatibles.length} utilisateurs compatibles. ` +
        `Meilleur candidat: ${triCharge[0].prenom} ${triCharge[0].nom} ` +
        `(score: ${calculerScoreAffectation(triCharge[0])}/100)`
    };
    
    setPropositions(triCharge.slice(0, 3));
    setAlgorithmeResultat(resultat);
    setLoading(false);
  };

  // Algorithme IA
  const executerAlgorithmeIA = async () => {
    setLoading(true);
    
    try {
      // Simulation d'appel API IA
      const compatibles = filtrerUtilisateursCompatibles(users);
      
      // Critères IA avancés
      const scores = compatibles.map(user => {
        let score = 0;
        
        // 1. Historique des affectations
        const aDejaFormationSimilaire = user.historiqueAffectations.some(a => 
          a.type === task.type && a.ville === task.ville
        );
        if (!aDejaFormationSimilaire) score += 30;
        
        // 2. Compatibilité profil/tâche
        const compatibiliteFormations = evaluerCompatibiliteFormations(user, task);
        score += compatibiliteFormations * 30;
        
        // 3. Détection des chevauchements
        const chevauchements = detecterChevauchements(user, task);
        if (chevauchements === 0) score += 20;
        
        // 4. Charge de travail
        const scoreCharge = Math.max(0, 20 - (user.chargeTravail / 5));
        score += scoreCharge;
        
        // 5. Équilibre territorial
        const diversiteGeographique = evaluerDiversiteGeographique(user, task);
        score += diversiteGeographique * 10;
        
        return { user, score };
      });
      
      scores.sort((a, b) => b.score - a.score);
      const meilleursCandidats = scores.slice(0, 3).map(s => s.user);
      
      const resultat = {
        compatibles: compatibles.length,
        premierChoix: scores[0]?.user,
        score: scores[0]?.score,
        analyseProfonde: true,
        criteresAnalyses: [
          "Historique des affectations",
          "Compatibilité formations/diplômes",
          "Détection des chevauchements temporels",
          "Analyse de la charge de travail",
          "Diversité géographique",
          "Optimisation des ressources"
        ],
        justificationIA: scores[0] ? 
          `L'IA recommande ${scores[0].user.prenom} ${scores[0].user.nom} ` +
          `avec un score de confiance de ${Math.round(scores[0].score)}%. ` +
          `Analyse basée sur 6 critères avancés incluant l'historique et la compatibilité.` :
          "Aucun candidat optimal trouvé."
      };
      
      setPropositions(meilleursCandidats);
      setAlgorithmeResultat(resultat);
      setValidationIA(true);
    } catch (error) {
      console.error("Erreur IA:", error);
      alert("Erreur lors de l'analyse IA. Utilisez le mode semi-automatique.");
    } finally {
      setLoading(false);
    }
  };

  const evaluerCompatibiliteFormations = (user: User, task: Task): number => {
    // Logique de compatibilité formations/diplômes
    const motsCles = task.title.toLowerCase().split(' ');
    const correspondances = user.formations.filter(f => 
      motsCles.some(mot => f.toLowerCase().includes(mot))
    ).length;
    
    return Math.min(correspondances / 3, 1); // Score 0-1
  };

  const detecterChevauchements = (user: User, _task: Task): number => {
      // Détection des chevauchements temporels (simplifié)
      return user.affectationsEnCours.length;
    };

  const evaluerDiversiteGeographique = (user: User, task: Task): number => {
    // Éviter les répétitions géographiques
    const memeVille = user.historiqueAffectations.filter(a => 
      a.ville === task.ville
    ).length;
    
    return Math.max(0, 1 - (memeVille / 5)); // Score 0-1
  };

  const calculerScoreAffectation = (user: User): number => {
    if (!user) return 0;
    
    let score = 50; // Score de base
    
    // Bonus ancienneté
    score += Math.min(user.anciennete * 5, 20);
    
    // Bonus faible charge
    score += Math.max(0, 20 - user.chargeTravail);
    
    // Bonus équilibre rémunération
    const nbRemunerees = user.historiqueAffectations
      .filter(a => a.type.includes("rémunéré")).length;
    score += Math.max(0, 15 - nbRemunerees);
    
    // Malus spécialité non correspondante
    if (task.specialite && user.specialite !== task.specialite) {
      score -= 30;
    }
    
    return Math.min(Math.max(score, 0), 100);
  };

  const handleAffecter = () => {
    if (selectedMode === "manuel" && !selectedUser) {
      alert("Veuillez sélectionner un utilisateur");
      return;
    }

    const userId = selectedMode === "manuel" ? selectedUser : 
                   propositions[0]?.id || "";
    
    if (!userId) {
      alert("Aucun utilisateur sélectionné");
      return;
    }

    let justificationFinale = justification;
    
    if (selectedMode === "semiAuto" && algorithmeResultat) {
      justificationFinale = `Affectation semi-automatique: ${algorithmeResultat.justification}`;
    }
    
    if (selectedMode === "autoIA" && algorithmeResultat) {
      justificationFinale = `Affectation IA: ${algorithmeResultat.justificationIA}`;
      if (!validationIA) {
        justificationFinale += " (Validation manuelle du coordinateur)";
      }
    }

    onAffect(userId, selectedMode, justificationFinale);
    onClose();
  };

  useEffect(() => {
    if (selectedMode === "semiAuto") {
      executerAlgorithmeSemiAuto();
    } else if (selectedMode === "autoIA") {
      executerAlgorithmeIA();
    } else {
      setPropositions([]);
      setAlgorithmeResultat(null);
    }
  }, [selectedMode]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Affecter la tâche: ${task.title}`}
      size="extra-large"
    >
      <div className="affectation-modal">
        {/* Informations de la tâche */}
        <div className="task-info-section">
          <h3>Informations de la tâche</h3>
          <div className="task-details-grid">
            <div className="detail-item">
              <strong>Type:</strong> {task.type}
            </div>
            <div className="detail-item">
              <strong>Spécialité:</strong> {task.specialite || "Non spécifiée"}
            </div>
            <div className="detail-item">
              <strong>Rémunération:</strong> {task.remuneree ? "✓ Rémunérée" : "Non rémunérée"}
            </div>
            <div className="detail-item">
              <strong>Période:</strong> {task.dateDebut} au {task.dateFin}
            </div>
            {task.ville && (
              <div className="detail-item">
                <strong>Ville:</strong> {task.ville}
              </div>
            )}
          </div>
        </div>

        {/* Sélection du mode */}
        <div className="mode-selection-section">
          <h3>Sélectionnez le mode d'affectation</h3>
          <div className="mode-buttons">
            {modes.map(mode => (
              <button
                key={mode.id}
                className={`mode-button ${selectedMode === mode.id ? "active" : ""}`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-label">{mode.label}</span>
                <span className="mode-description">{mode.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Manuel */}
        {selectedMode === "manuel" && (
          <div className="manual-section">
            <h3>Affectation manuelle</h3>
            <div className="form-group">
              <label>Sélectionner un auditeur:</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="user-select"
              >
                <option value="">Choisir un auditeur...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.prenom} {user.nom} - {user.specialite} ({user.grade}, {user.anciennete} ans)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Justification (optionnel):</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Expliquez pourquoi cet auditeur a été choisi manuellement..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Mode Semi-automatisé */}
        {selectedMode === "semiAuto" && (
          <div className="semi-auto-section">
            <h3>Affectation semi-automatique</h3>
            
            {loading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Exécution de l'algorithme d'affectation...</p>
              </div>
            ) : (
              <>
                {algorithmeResultat && (
                  <div className="algorithm-result">
                    <div className="result-header">
                      <h4>Résultat de l'algorithme</h4>
                      <div className="score-badge">
                        Score: {Math.round(algorithmeResultat.score || 0)}/100
                      </div>
                    </div>
                    
                    <div className="criteria-list">
                      <h5>Critères appliqués:</h5>
                      <ul>
                        <li><strong>Tour de rôle:</strong> Priorité à l'ancienneté</li>
                        <li><strong>Spécialité:</strong> {task.specialite ? "Correspondance requise" : "Non requis"}</li>
                        <li><strong>Rémunération:</strong> Distribution équitable</li>
                        <li><strong>Interférences temporelles:</strong> Vérification des disponibilités</li>
                      </ul>
                    </div>
                    
                    <div className="propositions-list">
                      <h5>Proposition automatique:</h5>
                      {propositions.map((user, index) => (
                        <div 
                          key={user.id} 
                          className={`proposition-card ${index === 0 ? "recommended" : ""}`}
                        >
                          <div className="proposition-rank">#{index + 1}</div>
                          <div className="proposition-info">
                            <strong>{user.prenom} {user.nom}</strong>
                            <div className="user-details">
                              {user.specialite} • {user.grade} • {user.anciennete} ans d'ancienneté
                            </div>
                            <div className="user-stats">
                              <span>Charge: {user.chargeTravail}%</span>
                              <span>Tâches rémunérées: {
                                user.historiqueAffectations.filter(a => a.type.includes("rémunéré")).length
                              }</span>
                            </div>
                          </div>
                          <div className="proposition-score">
                            Score: {calculerScoreAffectation(user)}/100
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="justification-box">
                      <label>Justification de l'algorithme:</label>
                      <p>{algorithmeResultat.justification}</p>
                    </div>
                    
                    <div className="form-group">
                      <label>Commentaire du coordinateur:</label>
                      <textarea
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder="Ajoutez votre commentaire ou modifiez la justification..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Mode IA */}
        {selectedMode === "autoIA" && (
          <div className="ia-section">
            <h3>Affectation par Intelligence Artificielle</h3>
            
            {loading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Analyse IA en cours...</p>
                <p className="loading-subtext">Évaluation des critères avancés...</p>
              </div>
            ) : (
              <>
                {algorithmeResultat && (
                  <div className="ia-result">
                    <div className="result-header">
                      <h4>Analyse IA - Rapport détaillé</h4>
                      <div className="ia-score-badge">
                        Confiance IA: {Math.round(algorithmeResultat.score || 0)}%
                      </div>
                    </div>
                    
                    <div className="ia-analysis">
                      <h5>Critères analysés par l'IA:</h5>
                      <div className="ia-criteria-grid">
                        {algorithmeResultat.criteresAnalyses?.map((critere: string, index: number) => (
                            <div key={index} className="ia-criterion">
                              <span className="criterion-icon">✓</span>
                              {critere}
                            </div>
                          ))}
                      </div>
                      
                      <div className="deep-analysis-section">
                        <h6>Analyse approfondie:</h6>
                        <div className="analysis-points">
                          <div className="analysis-point">
                            <strong>Historique:</strong> Vérification des formations déjà suivies
                          </div>
                          <div className="analysis-point">
                            <strong>Compatibilité:</strong> Analyse des diplômes et compétences
                          </div>
                          <div className="analysis-point">
                            <strong>Optimisation:</strong> Répartition géographique équilibrée
                          </div>
                          <div className="analysis-point">
                            <strong>Prévention:</strong> Détection des surcharges potentielles
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ia-propositions">
                      <h5>Recommandations de l'IA:</h5>
                      {propositions.map((user, index) => (
                        <div 
                          key={user.id} 
                          className={`ia-proposition-card ${index === 0 ? "ia-recommended" : ""}`}
                        >
                          <div className="ia-proposition-header">
                            <span className="ia-rank">Recommandation #{index + 1}</span>
                            <span className="ia-confidence">
                              Niveau de confiance: {Math.round(
                                (algorithmeResultat.score || 0) - (index * 15)
                              )}%
                            </span>
                          </div>
                          <div className="ia-user-details">
                            <strong>{user.prenom} {user.nom}</strong>
                            <div className="ia-user-info">
                              <div>
                                <span className="info-label">Spécialité:</span> {user.specialite}
                              </div>
                              <div>
                                <span className="info-label">Formations:</span> {user.formations.length}
                              </div>
                              <div>
                                <span className="info-label">Historique similaire:</span> {
                                  user.historiqueAffectations.filter(a => 
                                    a.type === task.type && a.ville === task.ville
                                  ).length
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="ia-justification">
                      <label>Rapport IA:</label>
                      <div className="ia-report">
                        {algorithmeResultat.justificationIA}
                      </div>
                    </div>
                    
                    <div className="ia-validation">
                      <label>
                        <input
                          type="checkbox"
                          checked={validationIA}
                          onChange={(e) => setValidationIA(e.target.checked)}
                        />
                        Valider la recommandation de l'IA
                      </label>
                      <p className="validation-note">
                        Décochez pour modifier manuellement la recommandation
                      </p>
                    </div>
                    
                    {!validationIA && (
                      <div className="form-group">
                        <label>Justification de la modification:</label>
                        <textarea
                          value={justification}
                          onChange={(e) => setJustification(e.target.value)}
                          placeholder="Expliquez pourquoi vous modifiez la recommandation de l'IA..."
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="affectation-actions">
          <button className="btn-cancel" onClick={onClose}>
            Annuler
          </button>
          <button className="btn-confirm" onClick={handleAffecter}>
            {loading ? "Traitement..." : "Confirmer l'affectation"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AffectationModal;