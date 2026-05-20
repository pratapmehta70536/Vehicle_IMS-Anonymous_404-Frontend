import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ChangePassword — allows any logged-in user to change their own password.
 * Staff access this from their sidebar; admin and customers can too if needed.
 */
const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { changePassword } = useAuth();

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return; }
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (_) {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your account password securely.</p>
        </div>
      </div>

      <div className="card card--narrow">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group">
            <label className="form-label" htmlFor="cp-current">Current Password</label>
            <input
              id="cp-current"
              name="currentPassword"
              type="password"
              className="form-input"
              placeholder="Your current password"
              value={form.currentPassword}
              onChange={handle}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cp-new">New Password</label>
            <input
              id="cp-new"
              name="newPassword"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={form.newPassword}
              onChange={handle}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cp-confirm">Confirm New Password</label>
            <input
              id="cp-confirm"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={handle}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
