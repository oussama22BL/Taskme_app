// NotificationBell.tsx - Version améliorée
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '../../context/NotificationContext';
import './NotificationBell.css';

const NotificationBell: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    getNotificationsByType 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'assignment': return '📋';
      case 'delegation': return '🔄';
      case 'modification': return '✏️';
      default: return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment': return '#3498db';
      case 'delegation': return '#9b59b6';
      case 'modification': return '#f39c12';
      case 'success': return '#27ae60';
      case 'warning': return '#f1c40f';
      case 'error': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const filteredNotifications = filterType === 'all' 
    ? notifications 
    : getNotificationsByType(filterType as any);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) markAsRead(notification.id);
    
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
    
    // Actions spécifiques selon le type
    if (notification.metadata?.taskId) {
      // Naviguer vers la tâche spécifique
      navigate(`/task/${notification.metadata.taskId}`);
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    if (notification.message) return notification.message;
    
    switch (notification.type) {
      case 'assignment':
        return 'Une nouvelle tâche vous a été affectée. Veuillez y répondre dans les 24h.';
      case 'delegation':
        return 'Une tâche vous a été déléguée. Consultez-la pour plus de détails.';
      case 'modification':
        return 'Une modification a été apportée. Consultez les détails.';
      default:
        return notification.message;
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        title={`${unreadCount} notification(s) non lue(s)`}
      >
        <span className={`bell-icon ${unreadCount > 0 ? 'ringing' : ''}`}>
          🔔
        </span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button className="mark-all-read" onClick={markAllAsRead}>
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="notification-filters">
            <button 
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Toutes
            </button>
            <button 
              className={`filter-btn ${filterType === 'assignment' ? 'active' : ''}`}
              onClick={() => setFilterType('assignment')}
            >
              Affectations
            </button>
            <button 
              className={`filter-btn ${filterType === 'delegation' ? 'active' : ''}`}
              onClick={() => setFilterType('delegation')}
            >
              Délégations
            </button>
            <button 
              className={`filter-btn ${filterType === 'modification' ? 'active' : ''}`}
              onClick={() => setFilterType('modification')}
            >
              Modifications
            </button>
          </div>

          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="no-notifications">
                <p>Aucune notification</p>
                <p className="no-notifications-subtitle">
                  {filterType !== 'all' 
                    ? `Aucune notification de type "${filterType}"`
                    : 'Vous êtes à jour !'
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ borderLeftColor: getTypeColor(notification.type) }}
                >
                  <div 
                    className="notification-icon"
                    style={{ color: getTypeColor(notification.type) }}
                  >
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                      {!notification.read && <span className="unread-dot"></span>}
                    </div>
                    <div className="notification-message">
                      {getNotificationMessage(notification)}
                    </div>
                    <div className="notification-time">
                      {formatTime(notification.createdAt)}
                    </div>
                    
                    {/* Métadonnées supplémentaires */}
                    {notification.metadata && (
                      <div className="notification-metadata">
                        {notification.metadata.taskId && (
                          <span className="metadata-tag">Tâche #{notification.metadata.taskId.substring(0, 6)}</span>
                        )}
                        {notification.metadata.vehicleId && (
                          <span className="metadata-tag">Véhicule</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="notification-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    aria-label="Supprimer"
                    title="Supprimer la notification"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notification-footer">
              <button 
                className="view-all"
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
              >
                Voir toutes les notifications ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;