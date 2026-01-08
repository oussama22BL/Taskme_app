import React, { useState, useEffect } from 'react';
import { Bell, Check, Mail, Calendar, AlertTriangle } from 'lucide-react';
import { notificationApi } from '../../api/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  type: 'affectation' | 'rappel_24h' | 'message';
  createdAt: string;
}

const UserNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur chargement notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'affectation': return <Calendar className="text-indigo-500" size={20} />;
      case 'rappel_24h': return <AlertTriangle className="text-amber-500" size={20} />;
      default: return <Mail className="text-slate-400" size={20} />;
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Centre de notifications</h1>
          <p className="text-slate-500">Restez informé de vos prochaines missions</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            <Check size={16} /> Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <Bell size={48} className="mx-auto mb-4 opacity-10" />
            <p>Aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`p-6 flex items-start gap-4 transition-colors hover:bg-slate-50/50 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
              >
                <div className={`p-3 rounded-2xl ${!n.isRead ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm ${!n.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>

                {!n.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(n._id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                    title="Marquer comme lu"
                  >
                    <Check size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;