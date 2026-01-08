import React, { useState } from 'react';

interface Props {
  onSubmit: (payload: any, file?: File | null) => void;
  onCancel?: () => void;
  initial?: any;
  users?: any[];
}

const ReportForm: React.FC<Props> = ({ onSubmit, onCancel, initial = {}, users = [] }) => {
  const [title, setTitle] = useState(initial.title || '');
  const [type, setType] = useState(initial.type || 'individual');
  const [tags, setTags] = useState((initial.tags || []).join(', '));
  const [status, setStatus] = useState(initial.status || 'draft');
  const [periodFrom, setPeriodFrom] = useState(initial?.period?.from || '');
  const [periodTo, setPeriodTo] = useState(initial?.period?.to || '');
  const [targetUser, setTargetUser] = useState(initial?.targetUser || '');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || title.trim() === '') {
      alert('Le titre est obligatoire');
      return;
    }

    if (type === 'individual' && !targetUser) {
      alert('Sélectionnez un utilisateur cible pour un rapport individuel');
      return;
    }

    const payload: any = {
      ...initial,
      title,
      type,
      tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      status
    };

    if (periodFrom || periodTo) payload.period = { from: periodFrom, to: periodTo };
    if (targetUser) payload.targetUser = targetUser;

    onSubmit(payload, file);
  };

  return (
    <form onSubmit={handleSubmit} className="report-form">
      <div>
        <label>Titre *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <label>Type</label>
        <select value={type} onChange={(e) => { setType(e.target.value); if (e.target.value !== 'individual') setTargetUser(''); }}>
          <option value="individual">Individuel</option>
          <option value="global">Global</option>
          <option value="algorithm">Algorithme</option>
          <option value="assignment">Affectation</option>
        </select>
      </div>

      {type === 'individual' && (
        <div>
          <label>Cible (utilisateur)</label>
          <select value={targetUser} onChange={(e) => setTargetUser(e.target.value)}>
            <option value="">-- Sélectionner --</option>
            {users.map(u => (
              <option key={u._id || u.id} value={u._id || u.id}>{u.nom} {u.prenom} {u.email ? `(${u.email})` : ''}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label>Période — Du</label>
        <input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
      </div>

      <div>
        <label>Période — Au</label>
        <input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
      </div>

      <div>
        <label>Tags (séparés par des virgules)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>

      <div>
        <label>Fichier à attacher (optionnel)</label>
        <input type="file" accept=".pdf,.csv,application/pdf,text/csv" onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
      </div>

      <div>
        <label>Statut</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        {onCancel && <button type="button" onClick={onCancel} className="btn-cancel">Annuler</button>}
        <button type="submit" className="btn-confirm">Enregistrer</button>
      </div>
    </form>
  );
};

export default ReportForm;