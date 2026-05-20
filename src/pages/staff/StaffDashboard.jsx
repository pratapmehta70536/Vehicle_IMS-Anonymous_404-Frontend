import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* Staff Dashboard — today's sales, pending appointments, recent invoices */
const StaffDashboard = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/staff')
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">⏳ Loading dashboard…</div>;
  if (!data)   return <div className="empty-state"><p className="empty-state-text">No data available.</p></div>;

  const stats = [
    { label: "Today's Sales",       value: data.todaySalesCount,       icon: '🧾', color: 'var(--blue-500)' },
    { label: "Today's Revenue",     value: `Rs ${data.todaySalesAmount?.toLocaleString()}`, icon: '💰', color: 'var(--green-500)' },
    { label: 'Total Customers',     value: data.totalCustomers,        icon: '👤', color: 'var(--purple-500)' },
    { label: 'Pending Appointments',value: data.pendingAppointments,   icon: '📅', color: 'var(--amber-500)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Dashboard</h1>
          <p className="page-subtitle">Your daily sales overview and activity.</p>
        </div>
        <span className="badge badge-purple">Staff</span>
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

      {/* Recent Sales */}
      {data.recentSales?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🧾 Recent Sales</h2>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Date</th></tr></thead>
              <tbody>
                {data.recentSales.map(s => (
                  <tr key={s.id}>
                    <td className="text-muted text-sm">INV-{String(s.id).padStart(4,'0')}</td>
                    <td style={{ fontWeight: 600 }}>{s.customerName}</td>
                    <td style={{ color: 'var(--green-500)', fontWeight: 600 }}>Rs {s.finalAmount?.toLocaleString()}</td>
                    <td><span className={`badge ${s.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{s.paymentStatus}</span></td>
                    <td className="text-muted text-sm">{new Date(s.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
