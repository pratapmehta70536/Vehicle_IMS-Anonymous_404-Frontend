import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* PartRequests — customer requests unavailable parts */
const PartRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]         = useState({ partName: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    try { const res = await api.get('/part-requests/my'); setRequests(res.data.data || []); }
    catch { toast.error('Failed to load part requests'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const openCreate = () => {
    setEditingId(null);
    setForm({ partName: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditingId(r.id);
    setForm({ partName: r.partName, description: r.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/part-requests/${editingId}`, form);
        toast.success('Part request updated');
      } else {
        await api.post('/part-requests', form);
        toast.success('Part request submitted');
      }
      setModalOpen(false);
      setForm({ partName: '', description: '' });
      setEditingId(null);
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const statusBadge = (s) => {
    if (s === 'Pending')   return 'badge-warning';
    if (s === 'In stock' || s === 'Completed' || s === 'Fulfilled') return 'badge-success';
    if (s === 'cancelled' || s === 'Not available' || s === 'Rejected') return 'badge-danger';
    if (s === 'Available soon' || s === 'Full stock available soon') return 'badge-info';
    if (s === 'Not enough stock') return 'badge-warning';
    return 'badge-neutral';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Part Requests</h1>
          <p className="page-subtitle">Request unavailable parts from the service center.</p>
        </div>
        <button id="request-part-btn" className="btn btn-primary" onClick={openCreate}>📦 Request a Part</button>
      </div>

      {loading ? <div className="spinner">⏳ Loading…</div> : requests.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📦</div><p className="empty-state-text">No part requests yet.</p></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Part Name</th><th>Description</th><th>Status</th><th>Requested On</th><th>Actions</th></tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.partName}</td>
                    <td className="text-muted text-sm">{r.description || '—'}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td className="text-muted text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      {r.status === 'Completed' ? (
                        <button 
                          className="btn btn-ghost btn-sm btn-icon" 
                          style={{ opacity: 0.5, cursor: 'not-allowed' }}
                          onClick={() => toast.error('Completed part requests cannot be modified.')}
                          title="Completed - Cannot Edit"
                        >
                          ✏️
                        </button>
                      ) : (
                        <button 
                          className="btn btn-ghost btn-sm btn-icon" 
                          onClick={() => openEdit(r)} 
                          title="Edit"
                        >
                          ✏️
                        </button>
                      )}
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
              <h3 className="modal-title">📦 {editingId ? 'Edit Part Request' : 'Request a Part'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body form-stack">
                <div className="form-group">
                  <label className="form-label">Part Name *</label>
                  <input name="partName" className="form-input" placeholder="e.g. Clutch Plate for Honda City 2019" value={form.partName} onChange={handle} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input name="description" className="form-input" placeholder="Any additional details…" value={form.description} onChange={handle} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : (editingId ? 'Save Changes' : 'Submit Request')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartRequests;
