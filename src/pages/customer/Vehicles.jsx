import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const EMPTY = { vehicleNumber: '', make: '', model: '', year: '', color: '' };

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try { const res = await api.get('/vehicles'); setVehicles(res.data.data || []); }
    catch { toast.error('Failed to load vehicles'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit   = (v)  => { setEditingId(v.id); setForm({ vehicleNumber: v.vehicleNumber, make: v.make, model: v.model, year: v.year || '', color: v.color || '' }); setModalOpen(true); };

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, year: form.year ? parseInt(form.year) : null };
    try {
      if (editingId) { await api.put(`/vehicles/${editingId}`, payload); toast.success('Vehicle updated'); }
      else           { await api.post('/vehicles', payload); toast.success('Vehicle added'); }
      setModalOpen(false); fetchVehicles();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, num) => {
    if (!window.confirm(`Remove vehicle "${num}"?`)) return;
    try { await api.delete(`/vehicles/${id}`); toast.success('Vehicle removed'); fetchVehicles(); }
    catch { toast.error('Failed to remove vehicle'); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Vehicles</h1>
          <p className="page-subtitle">Manage your registered vehicles.</p>
        </div>
        <button id="add-vehicle-btn" className="btn btn-primary" onClick={openCreate}>➕ Add Vehicle</button>
      </div>

      {loading ? <div className="spinner">⏳ Loading…</div> : vehicles.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🚗</div><p className="empty-state-text">No vehicles registered. Add your first vehicle.</p></div>
      ) : (
        <div className="grid-2">
          {vehicles.map(v => (
            <div className="stat-card" key={v.id} style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <div style={{ fontSize: '2rem' }}>🚗</div>
              <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{v.vehicleNumber}</div>
              <div className="text-muted">{v.make} {v.model} {v.year ? `(${v.year})` : ''}</div>
              {v.color && <div className="text-muted text-sm">Color: {v.color}</div>}
              <div className="flex gap-2 mt-2">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id, v.vehicleNumber)}>🗑️ Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? '✏️ Edit Vehicle' : '🚗 Add Vehicle'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body form-stack">
                <div className="form-group">
                  <label className="form-label">Vehicle Number *</label>
                  <input name="vehicleNumber" className="form-input" placeholder="BA 1 PA 1234" value={form.vehicleNumber} onChange={handle} required />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Make *</label>
                    <input name="make" className="form-input" placeholder="Toyota" value={form.make} onChange={handle} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model *</label>
                    <input name="model" className="form-input" placeholder="Corolla" value={form.model} onChange={handle} required />
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input name="year" type="number" min="1980" max={new Date().getFullYear()} className="form-input" placeholder="2020" value={form.year} onChange={handle} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input name="color" className="form-input" placeholder="White" value={form.color} onChange={handle} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : (editingId ? 'Update' : 'Add Vehicle')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
