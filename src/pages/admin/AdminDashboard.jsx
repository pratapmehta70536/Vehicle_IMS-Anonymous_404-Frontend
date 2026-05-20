import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* ─── AdminDashboard ─────────────────────────────────────────────────────
   Shows KPI cards, low-stock alerts, and recent activity for the admin.
──────────────────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">⏳ Loading dashboard…</div>;
  if (!data)   return <div className="empty-state"><p className="empty-state-text">No dashboard data.</p></div>;

  const stats = [
    { label: 'Total Parts',          value: data.totalParts,         icon: '🔧', color: 'var(--blue-500)' },
    { label: 'Low Stock Alerts',     value: data.lowStockParts,      icon: '⚠️',  color: 'var(--amber-500)' },
    { label: 'Staff Members',        value: data.totalStaff,         icon: '👥', color: 'var(--purple-500)' },
    { label: 'Total Customers',      value: data.totalCustomers,     icon: '👤', color: 'var(--green-500)' },
    { label: 'Vendors',              value: data.totalVendors,       icon: '🏪', color: 'var(--sky-500)' },
    { label: 'Total Revenue',        value: `Rs ${data.totalRevenue?.toLocaleString()}`, icon: '💰', color: 'var(--green-500)' },
    { label: "Today's Revenue",      value: `Rs ${data.todayRevenue?.toLocaleString()}`, icon: '📈', color: 'var(--blue-500)' },
    { label: 'Pending Appointments', value: data.pendingAppointments,icon: '📅', color: 'var(--amber-500)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System overview and key metrics.</p>
        </div>
        <span className="badge badge-success">● Live</span>
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

      {/* Low Stock Alerts */}
      {data.lowStockPartsList?.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">⚠️ Low Stock Alerts</h2>
            <span className="badge badge-warning">{data.lowStockPartsList.length} items</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Part Name</th><th>Category</th><th>Stock</th><th>Min Level</th><th>Vendor</th></tr>
              </thead>
              <tbody>
                {data.lowStockPartsList.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="text-muted">{p.category || '—'}</td>
                    <td><span className="badge badge-danger">{p.stock}</span></td>
                    <td className="text-muted">{p.minStockLevel}</td>
                    <td className="text-muted">{p.vendorName || '—'}</td>
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

export default AdminDashboard;
