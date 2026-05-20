import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* CustomerReports — top spenders, regulars, overdue credits */
const CustomerReports = () => {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('topSpenders');

  useEffect(() => {
    api.get('/reports/customers')
      .then(res => setReport(res.data.data))
      .catch(() => toast.error('Failed to load customer reports'))
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'topSpenders',       label: '🏆 Top Spenders' },
    { key: 'regularCustomers',  label: '🔄 Regular Customers' },
    { key: 'overdueCredits',    label: '⚠️ Overdue Credits' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Reports</h1>
          <p className="page-subtitle">Identify top spenders, regular customers, and overdue credits.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner">⏳ Loading…</div> : !report ? null : (
        <div className="card">
          {/* Top Spenders */}
          {tab === 'topSpenders' && (
            report.topSpenders?.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">🏆</div><p className="empty-state-text">No data yet.</p></div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Rank</th><th>Customer</th><th>Email</th><th>Total Spent</th><th>Purchases</th></tr></thead>
                  <tbody>
                    {report.topSpenders?.map((s, i) => (
                      <tr key={s.customerId}>
                        <td>
                          <span style={{ fontSize: '1.25rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{s.customerName}</td>
                        <td className="text-muted">{s.email || '—'}</td>
                        <td style={{ color: 'var(--green-500)', fontWeight: 700 }}>Rs {s.totalSpent?.toLocaleString()}</td>
                        <td><span className="badge badge-info">{s.purchaseCount}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Regular Customers */}
          {tab === 'regularCustomers' && (
            report.regularCustomers?.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">🔄</div><p className="empty-state-text">No regular customers yet.</p></div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Customer</th><th>Email</th><th>Purchases</th><th>Total Spent</th><th>Last Purchase</th></tr></thead>
                  <tbody>
                    {report.regularCustomers?.map(c => (
                      <tr key={c.customerId}>
                        <td style={{ fontWeight: 600 }}>{c.customerName}</td>
                        <td className="text-muted">{c.email || '—'}</td>
                        <td><span className="badge badge-purple">{c.purchaseCount}</span></td>
                        <td style={{ color: 'var(--green-500)', fontWeight: 600 }}>Rs {c.totalSpent?.toLocaleString()}</td>
                        <td className="text-muted text-sm">{new Date(c.lastPurchase).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Overdue Credits */}
          {tab === 'overdueCredits' && (
            report.overdueCredits?.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">✅</div><p className="empty-state-text">No overdue credits! All payments are up to date.</p></div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Customer</th><th>Phone</th><th>Invoice</th><th>Credit Amount</th><th>Days Overdue</th><th>Invoice Date</th></tr></thead>
                  <tbody>
                    {report.overdueCredits?.map(c => (
                      <tr key={c.invoiceId}>
                        <td style={{ fontWeight: 600 }}>{c.customerName}</td>
                        <td className="text-muted">{c.phone || '—'}</td>
                        <td className="text-muted text-sm">INV-{String(c.invoiceId).padStart(4,'0')}</td>
                        <td style={{ color: 'var(--red-500)', fontWeight: 700 }}>Rs {c.creditAmount?.toLocaleString()}</td>
                        <td><span className={`badge ${c.daysOverdue > 60 ? 'badge-danger' : 'badge-warning'}`}>{c.daysOverdue} days</span></td>
                        <td className="text-muted text-sm">{new Date(c.invoiceDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerReports;
