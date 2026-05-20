import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* Purchase Invoices — Admin creates purchase invoices from vendors to restock parts */
const PurchaseInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors]   = useState([]);
  const [parts, setParts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ vendorId: '', notes: '', items: [{ partId: '', quantity: 1, unitPrice: '' }] });

  const fetchAll = useCallback(async () => {
    try {
      const [iRes, vRes, pRes] = await Promise.all([
        api.get('/purchase-invoices'),
        api.get('/vendors'),
        api.get('/parts'),
      ]);
      setInvoices(iRes.data.data || []);
      setVendors(vRes.data.data?.filter(v => v.isActive) || []);
      setParts(pRes.data.data?.filter(p => p.isActive) || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { partId: '', quantity: 1, unitPrice: '' }] }));
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, val) =>
    setForm(p => ({ ...p, items: p.items.map((item, i) => i === idx ? { ...item, [field]: val } : item) }));

  const total = form.items.reduce((sum, it) => sum + (parseFloat(it.unitPrice) || 0) * (parseInt(it.quantity) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vendorId) { toast.error('Please select a vendor'); return; }
    if (form.items.some(it => !it.partId || !it.unitPrice)) { toast.error('Complete all line items'); return; }
    setSubmitting(true);
    try {
      await api.post('/purchase-invoices', {
        vendorId: parseInt(form.vendorId),
        notes: form.notes,
        items: form.items.map(it => ({ partId: parseInt(it.partId), quantity: parseInt(it.quantity), unitPrice: parseFloat(it.unitPrice) }))
      });
      toast.success('Purchase invoice created — stock updated');
      setModalOpen(false);
      setForm({ vendorId: '', notes: '', items: [{ partId: '', quantity: 1, unitPrice: '' }] });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Invoices</h1>
          <p className="page-subtitle">Create vendor purchase invoices to update stock levels.</p>
        </div>
        <button id="create-purchase-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>➕ New Invoice</button>
      </div>

      <div className="card">
        {loading ? <div className="spinner">⏳ Loading…</div> : invoices.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🧾</div><p className="empty-state-text">No purchase invoices yet.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>#</th><th>Vendor</th><th>Total</th><th>Date</th><th>Created By</th><th>Actions</th></tr></thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv.id}>
                    <td className="text-muted text-sm">INV-{String(inv.id).padStart(4,'0')}</td>
                    <td style={{ fontWeight: 600 }}>{inv.vendorName}</td>
                    <td style={{ color: 'var(--blue-400)', fontWeight: 600 }}>Rs {inv.totalAmount?.toLocaleString()}</td>
                    <td className="text-muted text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="text-muted">{inv.createdBy}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setDetailInvoice(inv)}>👁 View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal modal--lg">
            <div className="modal-header">
              <h3 className="modal-title">➕ New Purchase Invoice</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body form-stack">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Vendor *</label>
                    <select className="form-input" value={form.vendorId} onChange={e => setForm(p => ({...p, vendorId: e.target.value}))} required>
                      <option value="">— Select Vendor —</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <input className="form-input" placeholder="Optional notes" value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} />
                  </div>
                </div>

                <div className="section-label">Line Items</div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: 2, minWidth: 160 }}>
                      <select className="form-input" value={item.partId} onChange={e => updateItem(idx, 'partId', e.target.value)} required>
                        <option value="">— Select Part —</option>
                        {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 80 }}>
                      <input type="number" min="1" className="form-input" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} required />
                    </div>
                    <div style={{ flex: 1, minWidth: 100 }}>
                      <input type="number" min="0" step="0.01" className="form-input" placeholder="Unit Price" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} required />
                    </div>
                    <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 600, color: 'var(--blue-400)' }}>
                      Rs {((parseFloat(item.unitPrice)||0) * (parseInt(item.quantity)||0)).toLocaleString()}
                    </div>
                    {form.items.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeItem(idx)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} style={{ alignSelf: 'flex-start' }}>➕ Add Item</button>

                <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.125rem', color: 'var(--green-500)', paddingTop: '.5rem', borderTop: '1px solid rgba(255,255,255,.08)' }}>
                  Total: Rs {total.toLocaleString()}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create Invoice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailInvoice && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailInvoice(null)}>
          <div className="modal modal--lg">
            <div className="modal-header">
              <h3 className="modal-title">🧾 Invoice INV-{String(detailInvoice.id).padStart(4,'0')}</h3>
              <button className="modal-close" onClick={() => setDetailInvoice(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
                <div><span className="text-muted text-sm">Vendor</span><br/><strong>{detailInvoice.vendorName}</strong></div>
                <div><span className="text-muted text-sm">Date</span><br/><strong>{new Date(detailInvoice.date).toLocaleDateString()}</strong></div>
                <div><span className="text-muted text-sm">Created By</span><br/><strong>{detailInvoice.createdBy}</strong></div>
                <div><span className="text-muted text-sm">Total</span><br/><strong style={{ color: 'var(--green-500)' }}>Rs {detailInvoice.totalAmount?.toLocaleString()}</strong></div>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Part</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {detailInvoice.items?.map(it => (
                      <tr key={it.id}>
                        <td>{it.partName}</td>
                        <td>{it.quantity}</td>
                        <td>Rs {it.unitPrice?.toLocaleString()}</td>
                        <td style={{ color: 'var(--green-500)', fontWeight: 600 }}>Rs {it.totalPrice?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetailInvoice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoices;
