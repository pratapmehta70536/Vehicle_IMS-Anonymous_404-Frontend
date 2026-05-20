import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', category: '', costPrice: '', sellingPrice: '', stock: '', minStockLevel: 10, vendorId: '' };

const PartsManagement = () => {
  const [parts, setParts]       = useState([]);
  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, vRes] = await Promise.all([api.get('/parts'), api.get('/vendors')]);
      setParts(pRes.data.data || []);
      setVendors(vRes.data.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit   = (p)  => { setEditingId(p.id); setForm({ name: p.name, description: p.description || '', category: p.category || '', costPrice: p.costPrice, sellingPrice: p.sellingPrice, stock: p.stock, minStockLevel: p.minStockLevel, vendorId: p.vendorId || '' }); setModalOpen(true); };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, costPrice: parseFloat(form.costPrice), sellingPrice: parseFloat(form.sellingPrice), stock: parseInt(form.stock), minStockLevel: parseInt(form.minStockLevel), vendorId: form.vendorId ? parseInt(form.vendorId) : null };
    try {
      if (editingId) { await api.put(`/parts/${editingId}`, payload); toast.success('Part updated'); }
      else           { await api.post('/parts', payload); toast.success('Part created'); }
      setModalOpen(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await api.delete(`/parts/${id}`); toast.success('Part deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = parts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parts Inventory</h1>
          <p className="page-subtitle">Manage vehicle parts stock, pricing, and vendors.</p>
        </div>
        <div className="page-actions">
          <button id="add-part-btn" className="btn btn-primary" onClick={openCreate}>➕ Add Part</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
        <div className="stat-card"><div className="stat-card-icon">🔧</div><div className="stat-card-value">{parts.length}</div><div className="stat-card-label">Total Parts</div></div>
        <div className="stat-card"><div className="stat-card-icon">⚠️</div><div className="stat-card-value">{parts.filter(p => p.isLowStock).length}</div><div className="stat-card-label">Low Stock</div></div>
        <div className="stat-card"><div className="stat-card-icon">📦</div><div className="stat-card-value">{parts.reduce((a, p) => a + p.stock, 0)}</div><div className="stat-card-label">Total Units</div></div>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: '1rem' }}>
        <div className="search-input-wrap" style={{ maxWidth: 360 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search parts or category…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? <div className="spinner">⏳ Loading…</div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔧</div><p className="empty-state-text">No parts found.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Category</th><th>Stock</th><th>Cost</th><th>Sell Price</th><th>Vendor</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="text-muted">{p.category || '—'}</td>
                    <td>{p.isLowStock ? <span className="badge badge-danger">{p.stock}</span> : <span className="badge badge-success">{p.stock}</span>}</td>
                    <td className="text-muted">Rs {p.costPrice?.toLocaleString()}</td>
                    <td style={{ color: 'var(--green-500)', fontWeight: 600 }}>Rs {p.sellingPrice?.toLocaleString()}</td>
                    <td className="text-muted">{p.vendorName || '—'}</td>
                    <td><span className={`badge ${p.isActive ? 'badge-success' : 'badge-neutral'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(p)} title="Edit">✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(p.id, p.name)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal modal--lg">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? '✏️ Edit Part' : '➕ Add Part'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body form-stack">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Part Name *</label>
                    <input name="name" className="form-input" placeholder="e.g. Brake Pad" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input name="category" className="form-input" placeholder="e.g. Braking System" value={form.category} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input name="description" className="form-input" placeholder="Optional description" value={form.description} onChange={handleChange} />
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">Cost Price (Rs) *</label>
                    <input name="costPrice" type="number" min="0" step="0.01" className="form-input" value={form.costPrice} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Selling Price (Rs) *</label>
                    <input name="sellingPrice" type="number" min="0" step="0.01" className="form-input" value={form.sellingPrice} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input name="stock" type="number" min="0" className="form-input" value={form.stock} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Min Stock Level</label>
                    <input name="minStockLevel" type="number" min="0" className="form-input" value={form.minStockLevel} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Vendor</label>
                    <select name="vendorId" className="form-input" value={form.vendorId} onChange={handleChange}>
                      <option value="">— No Vendor —</option>
                      {vendors.filter(v => v.isActive).map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : (editingId ? 'Update' : 'Add Part')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsManagement;
