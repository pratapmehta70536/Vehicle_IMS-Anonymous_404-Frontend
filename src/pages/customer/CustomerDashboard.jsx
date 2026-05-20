import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const [payingInvoice, setPayingInvoice] = useState(null);
  const [dummyCardNumber, setDummyCardNumber] = useState('');
  const [dummyExpiry, setDummyExpiry] = useState('');
  const [dummyCvv, setDummyCvv] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const fetchDashboard = () => {
    setLoading(true);
    api.get('/dashboard/customer')
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!dummyCardNumber || !dummyExpiry || !dummyCvv) {
      toast.error('Please enter all payment details');
      return;
    }
    setPaymentSubmitting(true);
    try {
      await api.post(`/sales-invoices/${payingInvoice.id}/pay`);
      toast.success('Payment successful! Invoice paid.');
      setPayingInvoice(null);
      setDummyCardNumber('');
      setDummyExpiry('');
      setDummyCvv('');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed.');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (loading) return <div className="spinner">⏳ Loading dashboard…</div>;
  if (!data)   return <div className="empty-state"><p className="empty-state-text">No data available.</p></div>;

  const stats = [
    { label: 'Total Purchases',       value: data.totalPurchases,    icon: '🧾', color: 'var(--blue-500)' },
    { label: 'Total Spent',           value: `Rs ${data.totalSpent?.toLocaleString()}`, icon: '💰', color: 'var(--green-500)' },
    { label: 'Vehicles',              value: data.vehicleCount,      icon: '🚗', color: 'var(--purple-500)' },
    { label: 'Pending Appointments',  value: data.pendingAppointments, icon: '📅', color: 'var(--amber-500)' },
    { label: 'Pending Part Requests', value: data.pendingPartRequests, icon: '📦', color: 'var(--sky-500)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Your service history and upcoming appointments.</p>
        </div>
        <span className="badge badge-success">Customer</span>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-accent" style={{ background: s.color }} />
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value">{s.value ?? 0}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Purchases */}
      {data.recentPurchases?.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header"><h2 className="card-title">🧾 Recent Purchases</h2></div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Invoice</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {data.recentPurchases.map(p => (
                  <tr key={p.id}>
                    <td className="text-muted text-sm">INV-{String(p.id).padStart(4,'0')}</td>
                    <td style={{ color: 'var(--green-500)', fontWeight: 600 }}>Rs {p.finalAmount?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${p.paymentStatus === 'Paid' ? 'badge-success' : p.paymentStatus === 'Refunded' ? 'badge-neutral' : 'badge-warning'}`}>{p.paymentStatus}</span>
                      {p.paymentMethod === 'Online' && p.paymentStatus === 'Pending' && (
                        <button className="btn btn-primary btn-sm" onClick={() => setPayingInvoice(p)} style={{ marginLeft: '.5rem', padding: '2px 8px', fontSize: '.8rem' }}>💳 Pay Now</button>
                      )}
                    </td>
                    <td className="text-muted text-sm">{new Date(p.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      {data.upcomingAppointments?.length > 0 && (
        <div className="card">
          <div className="card-header"><h2 className="card-title">📅 Upcoming Appointments</h2></div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Service</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {data.upcomingAppointments.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.serviceType}</td>
                    <td className="text-muted">{new Date(a.scheduledDate).toLocaleString()}</td>
                    <td><span className={`badge ${a.status === 'Confirmed' ? 'badge-success' : a.status === 'Pending' ? 'badge-warning' : 'badge-neutral'}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Online Payment Dummy Sandbox Modal */}
      {payingInvoice && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPayingInvoice(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">💳 Online Payment Sandbox</h3>
              <button className="modal-close" onClick={() => setPayingInvoice(null)}>✕</button>
            </div>
            <form onSubmit={handlePaySubmit}>
              <div className="modal-body form-stack">
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '.9rem', margin: 0, opacity: 0.8 }}>You are paying for:</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '4px 0 0 0', color: 'var(--green-500)' }}>
                    INV-{String(payingInvoice.id).padStart(4,'0')} — Rs {payingInvoice.finalAmount?.toLocaleString()}
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">Dummy Card Number</label>
                  <input type="text" className="form-input" placeholder="1234 5678 9012 3456" maxLength="19" required
                    value={dummyCardNumber} onChange={e => setDummyCardNumber(e.target.value)} />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="text" className="form-input" placeholder="MM/YY" maxLength="5" required
                      value={dummyExpiry} onChange={e => setDummyExpiry(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input type="password" className="form-input" placeholder="123" maxLength="3" required
                      value={dummyCvv} onChange={e => setDummyCvv(e.target.value)} />
                  </div>
                </div>
                <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                  ⚠️ This is a dummy sandbox payment environment. Feel free to input any dummy digits.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setPayingInvoice(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={paymentSubmitting}>
                  {paymentSubmitting ? 'Processing…' : `Pay Rs ${payingInvoice.finalAmount?.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
