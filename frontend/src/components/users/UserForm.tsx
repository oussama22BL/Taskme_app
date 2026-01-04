import React, { useState, useEffect } from 'react';
import { User, UserPayload } from '../../services/userService';

import { USER_ROLES, ROLE_LABELS, SPECIALITES, GRADES } from '../../utils/constants';

interface Props {
  initialData?: User | null;
  mode?: 'create' | 'edit';
  includeRole?: boolean;
  allowedRoles?: string[]; // role values allowed to choose
  onSubmit: (data: Partial<UserPayload> & { password?: string }) => Promise<void> | void;
  onCancel?: () => void;
}

const UserForm: React.FC<Props> = ({ initialData = null, mode = 'create', includeRole = true, allowedRoles, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<any>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    specialite: 'pédagogique',
    grade: 'A',
    diplomes: [] as string[],
    formations: [] as string[],
    // active removed — activation/deactivation feature cancelled
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev: any) => ({ ...prev, ...initialData, password: '', confirmPassword: '' }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addDiplome = () => setFormData((p: any) => ({ ...p, diplomes: [...p.diplomes, ''] }));
  const setDiplome = (i: number, v: string) => setFormData((p: any) => { const arr = [...p.diplomes]; arr[i] = v; return { ...p, diplomes: arr }; });
  const removeDiplome = (i: number) => setFormData((p: any) => ({ ...p, diplomes: p.diplomes.filter((_: any, idx: number) => idx !== i) }));

  const addFormation = () => setFormData((p: any) => ({ ...p, formations: [...p.formations, ''] }));
  const setFormation = (i: number, v: string) => setFormData((p: any) => { const arr = [...p.formations]; arr[i] = v; return { ...p, formations: arr }; });
  const removeFormation = (i: number) => setFormData((p: any) => ({ ...p, formations: p.formations.filter((_: any, idx: number) => idx !== i) }));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.prenom || !formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.nom || !formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = 'Email invalide';
    if (mode === 'create' || formData.password) {
      if (!formData.password || formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: any = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role,
        specialite: formData.specialite,
        grade: formData.grade,
        diplomes: formData.diplomes,
        formations: formData.formations,
      };
      if (formData.password) payload.password = formData.password;
      // payload.active intentionally omitted (feature cancelled)
      await onSubmit(payload);
    } catch (err) {
      // Let parent handle server errors; could show a generic message
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Prénom</label>
        <input name="prenom" value={formData.prenom} onChange={handleChange} />
        {errors.prenom && <div className="error-message">{errors.prenom}</div>}
      </div>

      <div className="form-group">
        <label>Nom</label>
        <input name="nom" value={formData.nom} onChange={handleChange} />
        {errors.nom && <div className="error-message">{errors.nom}</div>}
      </div>

      <div className="form-group">
        <label>Email</label>
        <input name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      {(mode === 'create') && (
        <>
          <div className="form-group">
            <label>Mot de passe</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label>Confirmer mot de passe</label>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
        </>
      )}

      <div className="form-group">
        <label>Téléphone</label>
        <input name="phone" value={formData.phone} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Spécialité</label>
        <select name="specialite" value={formData.specialite} onChange={handleChange}>
          <option value={SPECIALITES.PEDAGOGIQUE}>{SPECIALITES.PEDAGOGIQUE}</option>
          <option value={SPECIALITES.ORIENTATION}>{SPECIALITES.ORIENTATION}</option>
          <option value={SPECIALITES.PLANIFICATION}>{SPECIALITES.PLANIFICATION}</option>
          <option value={SPECIALITES.FINANCIER}>{SPECIALITES.FINANCIER}</option>
        </select>
      </div>

      <div className="form-group">
        <label>Grade</label>
        <select name="grade" value={formData.grade} onChange={handleChange}>
          <option value={GRADES.A}>{GRADES.A}</option>
          <option value={GRADES.B}>{GRADES.B}</option>
          <option value={GRADES.C}>{GRADES.C}</option>
        </select>
      </div>

      {includeRole && (
        <div className="form-group">
          <label>Rôle</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            {((allowedRoles && allowedRoles.length) ? allowedRoles : [USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]).map((r: string) => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>
        </div>
      )}

      {/* Activation checkbox removed (feature cancelled) */}

      <div className="form-group multi-inputs">
        <label>Diplômes</label>
        {formData.diplomes.map((d: string, i: number) => (
          <div className="multi-item" key={`d-${i}`}>
            <input value={d} onChange={(e) => setDiplome(i, e.target.value)} />
            <button type="button" onClick={() => removeDiplome(i)}>Suppr.</button>
          </div>
        ))}
        <button type="button" onClick={addDiplome}>Ajouter diplôme</button>
      </div>

      <div className="form-group multi-inputs">
        <label>Formations</label>
        {formData.formations.map((f: string, i: number) => (
          <div className="multi-item" key={`f-${i}`}>
            <input value={f} onChange={(e) => setFormation(i, e.target.value)} />
            <button type="button" onClick={() => removeFormation(i)}>Suppr.</button>
          </div>
        ))}
        <button type="button" onClick={addFormation}>Ajouter formation</button>
      </div>

      <div className="form-actions">
        <button type="submit" className="action-button primary-action" disabled={loading} onClick={handleSubmit}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        {onCancel && <button type="button" className="action-button" onClick={onCancel}>Annuler</button>}
      </div>
    </form>
  );
};

export default UserForm;
