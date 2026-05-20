import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* SalesInvoices — Staff creates sales invoices and can email them to customers */
const SalesInvoices = () => {
  const [invoices, setInvoices]   = useState([]);
  const [customers, setCustomers] = useState([]);
  const [parts, setParts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailingId, setEmailingId] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const [form, setForm] = useState({
    customerId: '', paymentMethod: 'Cash', paymentStatus: 'Paid',
    items: [{ partId: '', quantity: 1 }]
  });

  const fetchAll = useCallback(async () => {
    try {
      const [iRes, cRes, pRes] = await Promise.all([
        api.get('/sales-invoices'),
        api.get('/customers'),
        api.get('/parts'),
      ]);
      setInvoices(iRes.data.data || []);
      setCustomers(cRes.data.data || []);
      setParts(pRes.data.data?.filter(p => p.isActive && p.stock > 0) || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addItem    = () => setForm(p => ({ ...p, items: [...p.items, { partId: '', quantity: 1 }] }));
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, val) =>
    setForm(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }));

  /* Calculate estimated total */
  const estimatedTotal = form.items.reduce((sum, it) => {
    const part = parts.find(p => p.id === parseInt(it.partId));
    return sum + (part?.sellingPrice || 0) * (parseInt(it.quantity) || 0);
  }, 0);
  const loyaltyDiscount = estimatedTotal > 5000 ? estimatedTotal * 0.10 : 0;

  const openCreateModal = () => {
    setEditingInvoiceId(null);
    setForm({ customerId: '', paymentMethod: 'Cash', paymentStatus: 'Paid', items: [{ partId: '', quantity: 1 }] });
    setModalOpen(true);
  };

  const openEditModal = (inv) => {
    setEditingInvoiceId(inv.id);
    setForm({
      customerId: inv.customerId,
      paymentMethod: inv.paymentMethod,
      paymentStatus: inv.paymentStatus,
      items: inv.items.map(it => ({ partId: it.partId, quantity: it.quantity }))
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice? All parts will be restocked.')) return;
    try {
      await api.delete(`/sales-invoices/${id}`);
      toast.success('Invoice deleted and parts restocked');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete invoice'); }
  };

  const handleRefund = async (id) => {
    if (!window.confirm('Are you sure you want to refund this invoice? Parts will be restocked and revenue will be deducted.')) return;
    try {
      await api.post(`/sales-invoices/${id}/refund`);
      toast.success('Invoice refunded and parts restocked');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to refund invoice'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId) { toast.error('Please select a customer'); return; }
    if (form.items.some(it => !it.partId)) { toast.error('Select a part for each line item'); return; }
    setSubmitting(true);
    try {
      const payload = {
        customerId: parseInt(form.customerId),
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentStatus,
        items: form.items.map(it => ({ partId: parseInt(it.partId), quantity: parseInt(it.quantity) }))
      };

      if (editingInvoiceId) {
        await api.put(`/sales-invoices/${editingInvoiceId}`, payload);
        toast.success('Sales invoice updated');
      } else {
        await api.post('/sales-invoices', payload);
        toast.success('Sales invoice created');
      }
      
      setModalOpen(false);
      setForm({ customerId: '', paymentMethod: 'Cash', paymentStatus: 'Paid', items: [{ partId: '', quantity: 1 }] });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save invoice'); }
    finally { setSubmitting(false); }
  };

  const handleEmail = async (invoice) => {
    const email = prompt('Send invoice to email:', invoice.customerEmail);
    if (!email) return;
    setEmailingId(invoice.id);
    try {
      await api.post(`/sales-invoices/${invoice.id}/send-email`, { toEmail: email });
      toast.success('Invoice emailed successfully');
    } catch { toast.error('Failed to send email'); }
    finally { setEmailingId(null); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Invoices</h1>
          <p className="page-subtitle">Create sales invoices and send them to customers.</p>
        </div>
        <button id="create-sale-btn" className="btn btn-primary" onClick={openCreateModal}>➕ New Invoice</button>
      </div>

      <div className="card">
        {loading ? <div className="spinner">⏳ Loading…</div> : invoices.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🧾</div><p className="empty-state-text">No sales invoices yet.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Discount</th><th>Final</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="text-muted text-sm">INV-{String(inv.id).padStart(4,'0')}</td>
                    <td style={{ fontWeight: 600 }}>{inv.customerName}</td>
                    <td className="text-muted">Rs {inv.totalAmount?.toLocaleString()}</td>
                    <td style={{ color: 'var(--amber-500)' }}>{inv.discount > 0 ? `Rs ${inv.discount?.toLocaleString()}` : '—'}</td>
                    <td style={{ color: 'var(--green-500)', fontWeight: 600 }}>Rs {inv.finalAmount?.toLocaleString()}</td>
                    <td><span className="badge badge-neutral">{inv.paymentMethod}</span></td>
                    <td><span className={`badge ${inv.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{inv.paymentStatus}</span></td>
                    <td className="text-muted text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetailInvoice(inv)}>👁</button>
                        
                        {inv.paymentStatus !== 'Refunded' && (
                          <>
                            {inv.paymentMethod === 'Online' && inv.paymentStatus === 'Paid' ? (
                              <button className="btn btn-ghost btn-sm" onClick={() => handleRefund(inv.id)} title="Refund Invoice">↩️</button>
                            ) : (
                              <>
                                <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(inv)}>✏️</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(inv.id)}>🗑️</button>
                              </>
                            )}
                          </>
                        )}

                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEmail(inv)}
                          disabled={emailingId === inv.id}
                          title="Email invoice"
                        >
                          {emailingId === inv.id ? '…' : '📧'}
                        </button>
                      </div>
                    </td>
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
              <h3 className="modal-title">{editingInvoiceId ? '✏️ Edit Sales Invoice' : '➕ New Sales Invoice'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body form-stack">
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">Customer *</label>
                    <select className="form-input" value={form.customerId} onChange={e => setForm(p => ({...p, customerId: e.target.value}))} required>
                      <option value="">— Select Customer —</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-input" value={form.paymentMethod} onChange={e => setForm(p => ({...p, paymentMethod: e.target.value}))}>
                      <option>Cash</option><option>Credit</option><option>Card</option><option>Online</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Status</label>
                    <select className="form-input" value={form.paymentStatus} onChange={e => setForm(p => ({...p, paymentStatus: e.target.value}))}>
                      <option>Paid</option><option>Pending</option>
                    </select>
                  </div>
                </div>

                <div className="section-label">Line Items</div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: 3, minWidth: 180 }}>
                      <select className="form-input" value={item.partId} onChange={e => updateItem(idx, 'partId', e.target.value)} required>
                        <option value="">— Select Part —</option>
                        {parts.map(p => <option key={p.id} value={p.id}>{p.name} — Rs {p.sellingPrice?.toLocaleString()} (stock: {p.stock})</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 80 }}>
                      <input type="number" min="1" className="form-input" placeholder="Qty" value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', e.target.value)} required />
                    </div>
                    <div style={{ minWidth: 90, fontWeight: 600, color: 'var(--green-500)', fontSize: '.9rem' }}>
                      Rs {((parts.find(p => p.id === parseInt(item.partId))?.sellingPrice || 0) * (parseInt(item.quantity) || 0)).toLocaleString()}
                    </div>
                    {form.items.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeItem(idx)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} style={{ alignSelf: 'flex-start' }}>➕ Add Item</button>

                <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '.75rem' }}>
                  <div className="flex justify-between text-sm text-muted mb-1">
                    <span>Subtotal</span><span>Rs {estimatedTotal.toLocaleString()}</span>
                  </div>
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-sm" style={{ color: 'var(--amber-500)', marginBottom: '.25rem' }}>
                      <span>🎁 Loyalty Discount (10%)</span><span>- Rs {loyaltyDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold" style={{ fontSize: '1.0625rem', color: 'var(--green-500)' }}>
                    <span>Total</span><span>Rs {(estimatedTotal - loyaltyDiscount).toLocaleString()}</span>
                  </div>
                  {loyaltyDiscount > 0 && <p className="text-xs text-muted mt-1">10% loyalty discount applied — purchase exceeds Rs 5,000</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : (editingInvoiceId ? 'Save Changes' : 'Create Invoice')}</button>
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
                <div><span className="text-muted text-sm">Customer</span><br/><strong>{detailInvoice.customerName}</strong></div>
                <div><span className="text-muted text-sm">Staff</span><br/><strong>{detailInvoice.staffName}</strong></div>
                <div><span className="text-muted text-sm">Date</span><br/><strong>{new Date(detailInvoice.date).toLocaleDateString()}</strong></div>
                <div><span className="text-muted text-sm">Payment</span><br/><span className={`badge ${detailInvoice.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{detailInvoice.paymentStatus}</span></div>
                {detailInvoice.loyaltyApplied && <div><span className="badge badge-warning">🎁 Loyalty Discount Applied</span></div>}
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Part</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {detailInvoice.items?.map(it => (
                      <tr key={it.id}>
                        <td>{it.partName}</td><td>{it.quantity}</td>
                        <td>Rs {it.unitPrice?.toLocaleString()}</td>
                        <td style={{ color: 'var(--green-500)', fontWeight: 600 }}>Rs {it.totalPrice?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--green-500)' }}>
                Final: Rs {detailInvoice.finalAmount?.toLocaleString()}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-success" onClick={() => { handleEmail(detailInvoice); setDetailInvoice(null); }}>📧 Email Invoice</button>
              <button className="btn btn-ghost" onClick={() => setDetailInvoice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoices;
