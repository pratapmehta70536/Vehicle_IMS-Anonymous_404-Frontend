import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/api';

/**
 * Sidebar — responsive collapsible navigation used by all role layouts.
 * Props:
 *   menuItems: Array<{ path, label, icon }>
 *   accentColor: string CSS color for the role brand (default blue)
 */
const Sidebar = ({ menuItems, accentColor = '#3b82f6' }) => {
  const [open, setOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const checkUnread = async () => {
      if (user.role === 'Admin' || user.role === 'Staff') {
        try {
          const res = await api.get('/chats/unread-count');
          setUnreadChatCount(res.data.data || 0);
        } catch {
          // Suppress errors during polling
        }
      }

      if (user.role === 'Admin') {
        try {
          const res = await api.get('/notifications');
          const list = res.data.data || [];
          setHasUnreadNotifications(list.some(n => !n.isRead));
        } catch {
          // Suppress errors during polling
        }
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    Admin: { bg: 'var(--role-admin)', label: 'Administrator' },
    Staff: { bg: 'var(--role-staff)', label: 'Staff Member' },
    Customer: { bg: 'var(--role-customer)', label: 'Customer' },
  };
  const roleInfo = roleColors[user?.role] || { bg: accentColor, label: user?.role };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        id="sidebar-toggle"
        className="sidebar-hamburger"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle sidebar"
      >
        <span className={`hamburger-line ${open ? 'hamburger-line--open' : ''}`} />
        <span className={`hamburger-line ${open ? 'hamburger-line--open' : ''}`} />
        <span className={`hamburger-line ${open ? 'hamburger-line--open' : ''}`} />
      </button>

      {/* Overlay on mobile */}
      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar panel */}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" style={{ background: roleInfo.bg }}>⚙</div>
          <div>
            <div className="sidebar-brand-name">VehicleIMS</div>
            <div className="sidebar-brand-sub">{roleInfo.label}</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              <span className="sidebar-link-icon" style={{ position: 'relative' }}>
                {item.icon}
                {item.label === 'Notifications' && hasUnreadNotifications && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px #ef4444'
                  }} />
                )}
                {item.label === 'Team Chat' && unreadChatCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px #ef4444'
                  }} />
                )}
              </span>
              <span className="sidebar-link-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" style={{ background: roleInfo.bg }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName || 'User'}</div>
              <div className="sidebar-user-email">{user?.email || ''}</div>
            </div>
          </div>
          <button
            id="logout-btn"
            className="btn btn-ghost btn-block sidebar-logout"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
