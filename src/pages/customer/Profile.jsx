import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ 
    fullName: user?.fullName || '', 
    email: user?.email || '',
    phone: user?.phone || '', 
    address: user?.address || '' 
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
    } catch { /* toast handled in context */ }
    finally { setSaving(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        {/* Avatar header */}
        <div style={{ padding: '2rem 1.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue-500), var(--purple-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{user?.fullName}</div>
            <div className="text-muted text-sm">{user?.email}</div>
            <span className="badge badge-success mt-1">Customer</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-body form-stack">
            <div className="form-group">
              <label className="form-label" htmlFor="prof-name">Full Name</label>
              <input id="prof-name" name="fullName" className="form-input" value={form.fullName} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prof-email">Email Address</label>
              <input id="prof-email" name="email" type="email" className="form-input" value={form.email} onChange={handle} required />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="prof-phone">Phone</label>
                <input id="prof-phone" name="phone" className="form-input" placeholder="9812345678" value={form.phone} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-address">Address</label>
                <input id="prof-address" name="address" className="form-input" placeholder="City, State" value={form.address} onChange={handle} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
