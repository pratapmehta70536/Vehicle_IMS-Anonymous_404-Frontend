import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* Admin Notifications — low-stock alerts and overdue credit reminders */
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { toast.error('Failed to mark as read'); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed'); }
  };

  const typeIcon = (type) => {
    if (type?.toLowerCase().includes('stock')) return '⚠️';
    if (type?.toLowerCase().includes('credit')) return '💳';
    return '🔔';
  };

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications.filter(n => n.isRead);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Low stock alerts and overdue credit reminders.</p>
        </div>
        <div className="page-actions">
          {unreadCount > 0 && <span className="badge badge-danger">{unreadCount} unread</span>}
          <button className="btn btn-ghost btn-sm" onClick={markAllRead} disabled={unreadCount === 0}>✓ Mark All Read</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['all','unread','read'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 && <span style={{ marginLeft: '.25rem' }}>({unreadCount})</span>}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner">⏳ Loading…</div> : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🔔</div><p className="empty-state-text">No notifications.</p></div>
      ) : (
        <div className="form-stack">
          {filtered.map(n => (
            <div
              key={n.id}
              className="card card-body"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                borderLeft: n.isRead ? undefined : '3px solid var(--blue-500)',
                opacity: n.isRead ? .7 : 1,
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{typeIcon(n.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${n.type?.toLowerCase().includes('stock') ? 'badge-warning' : 'badge-info'}`}>{n.type}</span>
                  <span className="text-xs text-muted">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ marginTop: '.5rem', fontSize: '.9rem', color: 'var(--text-200)' }}>{n.message}</p>
              </div>
              {!n.isRead && (
                <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)} style={{ flexShrink: 0 }}>✓</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
