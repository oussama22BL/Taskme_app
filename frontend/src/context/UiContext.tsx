import { createContext, useContext, useState, ReactNode } from "react";
import Toast from "../components/shared/Toast";

interface UiContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  showToast: (msg: { message: string; type?: 'success' | 'error' | 'info' | 'warning'; duration?: number }) => void;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

export const useUi = () => {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
};

interface UiProviderProps {
  children: ReactNode;
}

export const UiProvider = ({ children }: UiProviderProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed((s) => !s);

  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success'|'error'|'info'|'warning'; duration?: number }>>([]);

  const showToast = (msg: { message: string; type?: 'success' | 'error' | 'info' | 'warning'; duration?: number }) => {
    const id = String(Date.now()) + Math.random().toString(16).slice(2);
    setToasts((t) => [...t, { id, message: msg.message, type: msg.type || 'info', duration: msg.duration }]);
  };

  const removeToast = (id: string) => setToasts((t) => t.filter(x => x.id !== id));

  return (
    <UiContext.Provider value={{ collapsed, toggleCollapsed, showToast }}>
      {children}
      {/* Toasts container */}
      <div className="toasts-root" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} style={{ marginBottom: 8 }}>
            <Toast
              message={t.message}
              type={t.type}
              duration={t.duration || 3000}
              onClose={() => removeToast(t.id)}
            />
          </div>
        ))}
      </div>
    </UiContext.Provider>
  );
};

export default UiContext;
