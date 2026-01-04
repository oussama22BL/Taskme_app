// NotificationsPage.tsx - Page complète de notifications
import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import './NotificationsPage.css';

const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAllNotifications,
    getNotificationsByType 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'assignment' | 'delegation' | 'modification' | 'unread'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedNotifications.length > 0 && selectedNotifications.length < filteredNotifications.length;
    }
  }, [selectedNotifications, filteredNotifications]);

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(notificationId => notificationId !== id)
        : [...prev, id]
    );
  };

  const handleMarkSelectedAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id));
    setSelectedNotifications([]);
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedNotifications.length} notification(s) ?`)) {
      selectedNotifications.forEach(id => removeNotification(id));
      setSelectedNotifications([]);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'assignment': return 'Affectation';
      case 'delegation': return 'Délégation';
      case 'modification': return 'Modification';
      case 'success': return 'Succès';
      case 'warning': return 'Avertissement';
      case 'error': return 'Erreur';
      default: return 'Information';
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

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />
        
        <main className="main-content-area notifications-page">
          <div className="notifications-header">
            <h1>Notifications</h1>
            <p>Gérez toutes vos notifications en un seul endroit</p>
            
            <div className="notifications-stats">
              <div className="stat-card">
                <div className="stat-icon">📨</div>
                <div className="stat-content">
                  <h3>{notifications.length}</h3>
                  <p>Total</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📥</div>
                <div className="stat-content">
                  <h3>{unreadCount}</h3>
                  <p>Non lues</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>{getNotificationsByType('assignment').length}</h3>
                  <p>Affectations</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔄</div>
                <div className="stat-content">
                  <h3>{getNotificationsByType('delegation').length}</h3>
                  <p>Délégations</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="notifications-controls">
            <div className="filters-section">
              <div className="filter-group">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Toutes
                </button>
                <button 
                  className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                  onClick={() => setFilter('unread')}
                >
                  Non lues ({unreadCount})
                </button>
                <button 
                  className={`filter-btn ${filter === 'assignment' ? 'active' : ''}`}
                  onClick={() => setFilter('assignment')}
                >
                  Affectations
                </button>
                <button 
                  className={`filter-btn ${filter === 'delegation' ? 'active' : ''}`}
                  onClick={() => setFilter('delegation')}
                >
                  Délégations
                </button>
                <button 
                  className={`filter-btn ${filter === 'modification' ? 'active' : ''}`}
                  onClick={() => setFilter('modification')}
                >
                  Modifications
                </button>
              </div>
            </div>
            
            <div className="actions-section">
              {selectedNotifications.length > 0 ? (
                <div className="selection-actions">
                  <span className="selection-count">
                    {selectedNotifications.length} sélectionné(s)
                  </span>
                  <button 
                    className="btn-action btn-mark-read"
                    onClick={handleMarkSelectedAsRead}
                  >
                    Marquer comme lu
                  </button>
                  <button 
                    className="btn-action btn-delete"
                    onClick={handleDeleteSelected}
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <div className="bulk-actions">
                  <button 
                    className="btn-action btn-mark-all-read"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Tout marquer comme lu
                  </button>
                  <button 
                    className="btn-action btn-clear-all"
                    onClick={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
                        clearAllNotifications();
                      }
                    }}
                    disabled={notifications.length === 0}
                  >
                    Tout supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="notifications-list-container">
            {filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>Aucune notification</h3>
                <p>
                  {filter === 'all' 
                    ? "Vous n'avez aucune notification pour le moment."
                    : `Aucune notification de type "${filter}" trouvée.`
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="list-header">
                  <label className="select-all-checkbox">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={handleSelectAll}
                    />
                    <span>Sélectionner tout</span>
                  </label>
                  <span className="total-count">{filteredNotifications.length} notification(s)</span>
                </div>
                
                <div className="notifications-list">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-card ${notification.read ? 'read' : 'unread'} ${
                        selectedNotifications.includes(notification.id) ? 'selected' : ''
                      }`}
                      onClick={() => handleSelectNotification(notification.id)}
                    >
                      <div className="notification-card-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => handleSelectNotification(notification.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <div 
                        className="notification-type-indicator"
                        style={{ backgroundColor: getTypeColor(notification.type) }}
                      ></div>
                      
                      <div className="notification-card-content">
                        <div className="notification-card-header">
                          <div className="notification-card-title">
                            <h4>{notification.title}</h4>
                            <span 
                              className="notification-type-badge"
                              style={{ backgroundColor: getTypeColor(notification.type) }}
                            >
                              {getTypeLabel(notification.type)}
                            </span>
                            {!notification.read && <span className="unread-badge">NON LU</span>}
                          </div>
                          <button
                            className="notification-card-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            title="Supprimer"
                          >
                            ×
                          </button>
                        </div>
                        
                        <div className="notification-card-message">
                          {notification.message}
                        </div>
                        
                        <div className="notification-card-metadata">
                          <span className="metadata-date">
                            {formatDate(notification.createdAt)}
                          </span>
                          
                          {notification.metadata && (
                            <div className="metadata-tags">
                              {notification.metadata.taskId && (
                                <span className="metadata-tag">
                                  Tâche: {notification.metadata.taskId.substring(0, 8)}
                                </span>
                              )}
                              {notification.metadata.vehicleId && (
                                <span className="metadata-tag">Véhicule</span>
                              )}
                              {notification.metadata.fromUserId && (
                                <span className="metadata-tag">De: {notification.metadata.fromUserId.substring(0, 6)}</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="notification-card-actions">
                          {!notification.read && (
                            <button
                              className="btn-mark-read"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              Marquer comme lu
                            </button>
                          )}
                          {notification.link && (
                            <button
                              className="btn-view"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = notification.link!;
                              }}
                            >
                              Voir les détails
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotificationsPage;