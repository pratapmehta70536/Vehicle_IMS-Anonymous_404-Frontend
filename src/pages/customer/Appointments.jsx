import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const EMPTY = { scheduledDate: '', serviceType: '', notes: '' };

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try { const res = await api.get('/appointments/my'); setAppointments(res.data.data || []); }
    catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/appointments', { ...form, scheduledDate: new Date(form.scheduledDate).toISOString() });
      toast.success('Appointment booked');
      setModalOpen(false);
      setForm(EMPTY);
      fetchAppointments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to book'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}`, { status: 'Cancelled' });
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch { toast.error('Failed to cancel'); }
  };

  const statusBadge = (s) => {
    if (s === 'Confirmed') return 'badge-success';
    if (s === 'Pending')   return 'badge-warning';
    if (s === 'Cancelled') return 'badge-danger';
    return 'badge-neutral';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Book and manage your service appointments.</p>
        </div>
        <button id="book-appointment-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>📅 Book Appointment</button>
      </div>

      {loading ? <div className="spinner">⏳ Loading…</div> : appointments.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📅</div><p className="empty-state-text">No appointments yet. Book your first service.</p></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Service Type</th><th>Scheduled Date</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.serviceType}</td>
                    <td className="text-muted">{new Date(a.scheduledDate).toLocaleString()}</td>
                    <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                    <td className="text-muted text-sm">{a.notes || '—'}</td>
                    <td>
                      {a.status === 'Pending' ? (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a.id)}>Cancel</button>
                      ) : (a.status === 'Confirmed' || a.status === 'Completed') ? (
                        <button 
                          className="btn btn-danger btn-sm" 
                          style={{ opacity: 0.5, cursor: 'not-allowed' }}
                          onClick={() => toast.error('Confirmed or Completed appointments cannot be cancelled. Please contact staff.')}
                        >
                          Cancel
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">📅 Book Appointment</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body form-stack">
                <div className="form-group">
                  <label className="form-label">Service Type *</label>
                  <select name="serviceType" className="form-input" value={form.serviceType} onChange={handle} required>
                    <option value="">— Select Service —</option>
                    <option>Oil Change</option>
                    <option>Brake Service</option>
                    <option>Tire Rotation</option>
                    <option>Engine Diagnostic</option>
                    <option>Full Service</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Date & Time *</label>
                  <input name="scheduledDate" type="datetime-local" className="form-input" value={form.scheduledDate} onChange={handle} required min={new Date().toISOString().slice(0,16)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input name="notes" className="form-input" placeholder="Any specific requests…" value={form.notes} onChange={handle} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Booking…' : 'Book Appointment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
