// NotificationBadge.tsx - Badge de notification réutilisable
import React from 'react';
import './NotificationBadge.css';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  animate?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 'medium',
  showCount = true,
  animate = true,
  position = 'top-right'
}) => {
  if (count === 0) return null;

  const sizeClasses = {
    small: 'badge-sm',
    medium: 'badge-md',
    large: 'badge-lg'
  };

  const positionClasses = {
    'top-right': 'badge-top-right',
    'top-left': 'badge-top-left',
    'bottom-right': 'badge-bottom-right',
    'bottom-left': 'badge-bottom-left'
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div className={`notification-badge ${sizeClasses[size]} ${positionClasses[position]} ${animate ? 'animate' : ''}`}>
      {showCount && (
        <span className="badge-count">{displayCount}</span>
      )}
    </div>
  );
};

export default NotificationBadge;