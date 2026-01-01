import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SPECIALITES as DEFAULT_SPECIALITES, GRADES as DEFAULT_GRADES } from '@/utils/constants';

type SettingsContextType = {
  specialites: string[];
  grades: string[];
  addSpecialite: (s: string) => void;
  removeSpecialite: (s: string) => void;
  addGrade: (g: string) => void;
  removeGrade: (g: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [specialites, setSpecialites] = useState<string[]>(() => Object.values(DEFAULT_SPECIALITES));
  const [grades, setGrades] = useState<string[]>(() => Object.values(DEFAULT_GRADES));

  // persist to localStorage
  useEffect(() => {
    const s = localStorage.getItem('settings_specialites');
    const g = localStorage.getItem('settings_grades');
    if (s) setSpecialites(JSON.parse(s));
    if (g) setGrades(JSON.parse(g));
  }, []);

  useEffect(() => { localStorage.setItem('settings_specialites', JSON.stringify(specialites)); }, [specialites]);
  useEffect(() => { localStorage.setItem('settings_grades', JSON.stringify(grades)); }, [grades]);

  const addSpecialite = (s: string) => setSpecialites(prev => prev.includes(s) ? prev : [...prev, s]);
  const removeSpecialite = (s: string) => setSpecialites(prev => prev.filter(x => x !== s));
  const addGrade = (g: string) => setGrades(prev => prev.includes(g) ? prev : [...prev, g]);
  const removeGrade = (g: string) => setGrades(prev => prev.filter(x => x !== g));

  return (
    <SettingsContext.Provider value={{ specialites, grades, addSpecialite, removeSpecialite, addGrade, removeGrade }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export default SettingsContext;
