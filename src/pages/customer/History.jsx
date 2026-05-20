import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* Purchase History — customer views all their past sales invoices */
const History = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [detail, setDetail]     = useState(null);

  const fetchHistory = useCallback(async () => {
    try { const res = await api.get('/sales-invoices/my'); setInvoices(res.data.data || []); }
    catch { toast.error('Failed to load purchase history'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const totalSpent = invoices.reduce((sum, inv) => sum + (inv.finalAmount || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase History</h1>
          <p className="page-subtitle">View all your past purchases and invoices.</p>
        </div>
        {invoices.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div className="text-muted text-sm">Total Spent</div>
            <div style={{ fontWeight: 800, fontSize: '1.375rem', color: 'var(--green-500)' }}>Rs {totalSpent.toLocaleString()}</div>
          </div>
        )}
      </div>

      {loading ? <div className="spinner">⏳ Loading…</div> : invoices.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🧾</div><p className="empty-state-text">No purchases yet.</p></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Invoice</th><th>Items</th><th>Amount</th><th>Discount</th><th>Final</th><th>Payment</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="text-muted text-sm">INV-{String(inv.id).padStart(4,'0')}</td>
                    <td className="text-muted">{inv.items?.length || 0} items</td>
                    <td className="text-muted">Rs {inv.totalAmount?.toLocaleString()}</td>
                    <td style={{ color: 'var(--amber-500)' }}>{inv.discount > 0 ? `Rs ${inv.discount?.toLocaleString()}` : '—'}</td>
                    <td style={{ color: 'var(--green-500)', fontWeight: 700 }}>Rs {inv.finalAmount?.toLocaleString()}</td>
                    <td><span className={`badge ${inv.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{inv.paymentStatus}</span></td>
                    <td className="text-muted text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setDetail(inv)}>👁</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal modal--lg">
            <div className="modal-header">
              <h3 className="modal-title">🧾 INV-{String(detail.id).padStart(4,'0')}</h3>
              <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
                <div><span className="text-muted text-sm">Date</span><br/><strong>{new Date(detail.date).toLocaleDateString()}</strong></div>
                <div><span className="text-muted text-sm">Served By</span><br/><strong>{detail.staffName}</strong></div>
                <div><span className="text-muted text-sm">Payment</span><br/><span className={`badge ${detail.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{detail.paymentStatus}</span></div>
                {detail.loyaltyApplied && <div><span className="badge badge-warning">🎁 Loyalty Discount Applied</span></div>}
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Part</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {detail.items?.map(it => (
                      <tr key={it.id}>
                        <td>{it.partName}</td><td>{it.quantity}</td>
                        <td>Rs {it.unitPrice?.toLocaleString()}</td>
                        <td style={{ color: 'var(--green-500)', fontWeight: 600 }}>Rs {it.totalPrice?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 800, fontSize: '1.125rem', color: 'var(--green-500)' }}>
                Final: Rs {detail.finalAmount?.toLocaleString()}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
