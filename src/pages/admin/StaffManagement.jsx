import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* ─── StaffManagement ────────────────────────────────────────────────────
   Admin can:
   • View all staff members with status
   • Register new staff (name, email, password, phone, address)
   • Edit staff info (name, email, phone, address, active toggle)
   • Reset a staff member's password (admin override)
   • Deactivate / reactivate staff
──────────────────────────────────────────────────────────────────────── */

const EMPTY_FORM = { fullName: '', email: '', password: '', phone: '', address: '', isActive: true };
const EMPTY_RESET = { newPassword: '', confirmPassword: '' };

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Register / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Reset password modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetId, setResetTargetId] = useState(null);
  const [resetTargetName, setResetTargetName] = useState('');
  const [resetForm, setResetForm] = useState(EMPTY_RESET);

  const [submitting, setSubmitting] = useState(false);

  /* Fetch all staff */
  const fetchStaff = useCallback(async () => {
    try {
      const res = await api.get('/staff');
      setStaffList(res.data.data || []);
    } catch {
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  /* Open register modal */
  const openRegister = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  /* Open edit modal */
  const openEdit = (staff) => {
    setEditingId(staff.id);
    setForm({ fullName: staff.fullName, email: staff.email, password: '', phone: staff.phone || '', address: staff.address || '', isActive: staff.isActive });
    setModalOpen(true);
  };

  /* Open reset-password modal */
  const openReset = (staff) => {
    setResetTargetId(staff.id);
    setResetTargetName(staff.fullName);
    setResetForm(EMPTY_RESET);
    setResetModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  /* Submit create / update */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/staff/${editingId}`, { fullName: form.fullName, email: form.email, phone: form.phone, address: form.address, isActive: form.isActive });
        toast.success('Staff member updated');
      } else {
        if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); setSubmitting(false); return; }
        await api.post('/staff', { fullName: form.fullName, email: form.email, password: form.password, phone: form.phone, address: form.address });
        toast.success('Staff member registered');
      }
      setModalOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  /* Submit password reset */
  const handleReset = async (e) => {
    e.preventDefault();
    if (resetForm.newPassword !== resetForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (resetForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    try {
      await api.post(`/staff/${resetTargetId}/reset-password`, { newPassword: resetForm.newPassword });
      toast.success(`Password reset for ${resetTargetName}`);
      setResetModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  /* Deactivate staff */
  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? They will no longer be able to log in.`)) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Staff member deactivated');
      fetchStaff();
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Register, manage, and control staff access.</p>
        </div>
        <div className="page-actions">
          <button id="register-staff-btn" className="btn btn-primary" onClick={openRegister}>
            ➕ Register Staff
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ background: 'var(--blue-500)' }} />
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value">{staffList.length}</div>
          <div className="stat-card-label">Total Staff</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ background: 'var(--green-500)' }} />
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value">{staffList.filter(s => s.isActive).length}</div>
          <div className="stat-card-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ background: 'var(--red-500)' }} />
          <div className="stat-card-icon">🚫</div>
          <div className="stat-card-value">{staffList.filter(s => !s.isActive).length}</div>
          <div className="stat-card-label">Inactive</div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="spinner">⏳ Loading staff…</div>
        ) : staffList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-text">No staff members yet. Register one to get started.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="text-muted text-sm">{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                    <td className="text-muted">{s.email}</td>
                    <td className="text-muted">{s.phone || '—'}</td>
                    <td className="text-muted text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title="Edit staff"
                          onClick={() => openEdit(s)}
                        >✏️</button>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title="Reset password"
                          onClick={() => openReset(s)}
                        >🔑</button>
                        {s.isActive && (
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            title="Deactivate"
                            onClick={() => handleDeactivate(s.id, s.fullName)}
                          >🚫</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Register / Edit Modal ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? '✏️ Edit Staff Member' : '➕ Register New Staff'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body form-stack">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="staff-fullName">Full Name *</label>
                    <input id="staff-fullName" name="fullName" className="form-input" placeholder="John Doe" value={form.fullName} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="staff-email">Email *</label>
                    <input id="staff-email" name="email" type="email" className="form-input" placeholder="staff@example.com" value={form.email} onChange={handleFormChange} required />
                  </div>
                </div>

                {/* Password only shown when creating new staff */}
                {!editingId && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="staff-password">Password *</label>
                    <input id="staff-password" name="password" type="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={handleFormChange} required minLength={6} />
                    <span className="text-xs text-muted mt-1">The staff member will use this password to log in.</span>
                  </div>
                )}

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="staff-phone">Phone</label>
                    <input id="staff-phone" name="phone" className="form-input" placeholder="9812345678" value={form.phone} onChange={handleFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="staff-address">Address</label>
                    <input id="staff-address" name="address" className="form-input" placeholder="City, State" value={form.address} onChange={handleFormChange} />
                  </div>
                </div>

                {editingId && (
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleFormChange}
                      style={{ width: 16, height: 16, accentColor: 'var(--blue-500)' }}
                    />
                    <span className="text-sm">Account Active</span>
                  </label>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : (editingId ? 'Update Staff' : 'Register Staff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setResetModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">🔑 Reset Password</h3>
              <button className="modal-close" onClick={() => setResetModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleReset}>
              <div className="modal-body form-stack">
                <div className="alert alert-info">
                  Setting a new password for <strong>{resetTargetName}</strong>. They can use it to log in immediately.
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-new">New Password *</label>
                  <input
                    id="reset-new"
                    type="password"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={resetForm.newPassword}
                    onChange={e => setResetForm(p => ({ ...p, newPassword: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-confirm">Confirm New Password *</label>
                  <input
                    id="reset-confirm"
                    type="password"
                    className="form-input"
                    placeholder="Repeat new password"
                    value={resetForm.confirmPassword}
                    onChange={e => setResetForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setResetModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
