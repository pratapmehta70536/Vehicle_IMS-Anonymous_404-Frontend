import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const EMPTY = { companyName: '', contactName: '', email: '', phone: '', address: '' };

const VendorsManagement = () => {
  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchVendors = useCallback(async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data.data || []);
    } catch { toast.error('Failed to load vendors'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit   = (v) => { setEditingId(v.id); setForm({ companyName: v.companyName, contactName: v.contactName || '', email: v.email || '', phone: v.phone || '', address: v.address || '' }); setModalOpen(true); };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) { await api.put(`/vendors/${editingId}`, form); toast.success('Vendor updated'); }
      else           { await api.post('/vendors', form); toast.success('Vendor added'); }
      setModalOpen(false); fetchVendors();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate vendor "${name}"?`)) return;
    try { await api.delete(`/vendors/${id}`); toast.success('Vendor deactivated'); fetchVendors(); }
    catch { toast.error('Failed'); }
  };

  const filtered = vendors.filter(v => v.companyName.toLowerCase().includes(search.toLowerCase()) || (v.contactName || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Manage supplier and vendor information.</p>
        </div>
        <button id="add-vendor-btn" className="btn btn-primary" onClick={openCreate}>➕ Add Vendor</button>
      </div>

      <div className="search-bar" style={{ marginBottom: '1rem' }}>
        <div className="search-input-wrap" style={{ maxWidth: 360 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>
        <span className="badge badge-neutral">{vendors.length} vendors</span>
      </div>

      <div className="card">
        {loading ? <div className="spinner">⏳ Loading…</div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🏪</div><p className="empty-state-text">No vendors found.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.companyName}</td>
                    <td className="text-muted">{v.contactName || '—'}</td>
                    <td className="text-muted">{v.email || '—'}</td>
                    <td className="text-muted">{v.phone || '—'}</td>
                    <td><span className={`badge ${v.isActive ? 'badge-success' : 'badge-neutral'}`}>{v.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(v)}>✏️</button>
                        {v.isActive && <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(v.id, v.companyName)}>🚫</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? '✏️ Edit Vendor' : '➕ Add Vendor'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body form-stack">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input name="companyName" className="form-input" placeholder="ABC Auto Parts Ltd." value={form.companyName} onChange={handleChange} required />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input name="contactName" className="form-input" placeholder="John Smith" value={form.contactName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input name="email" type="email" className="form-input" placeholder="vendor@example.com" value={form.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input name="phone" className="form-input" placeholder="9812345678" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input name="address" className="form-input" placeholder="City, State" value={form.address} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : (editingId ? 'Update' : 'Add Vendor')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsManagement;
