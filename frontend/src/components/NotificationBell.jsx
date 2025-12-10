import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead } from '../services/api';

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Poll for new notifications every 10 seconds
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);
      setNotifications(notifications.filter(n => n.id !== notification.id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          position: 'relative',
          padding: '5px 10px'
        }}
        title="Notifications"
      >
        🔔
        {notifications.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: '#ff4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {notifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '0',
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            width: '350px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000
          }}
        >
          {notifications.length > 0 ? (
            <div>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '15px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    background: '#f8f9fa',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e8eaed'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
                >
                  <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                    {notification.title}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                    {notification.message}
                  </div>
                  {notification.related_user && (
                    <div style={{ color: '#999', fontSize: '12px' }}>
                      From: {notification.related_user.full_name || notification.related_user.username}
                    </div>
                  )}
                  <div style={{ color: '#999', fontSize: '11px', marginTop: '5px' }}>
                    {new Date(notification.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: '#999',
                fontSize: '14px'
              }}
            >
              No notifications yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
