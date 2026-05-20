import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* Financial Reports — daily / monthly / yearly with breakdown table */
const FinancialReports = () => {
  const [period, setPeriod] = useState('monthly');
  const [year, setYear]     = useState(new Date().getFullYear());
  const [month, setMonth]   = useState(new Date().getMonth() + 1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = period === 'daily'
        ? { period, year, month }
        : period === 'monthly'
        ? { period, year }
        : { period, year };
      const res = await api.get('/reports/financial', { params });
      setReport(res.data.data);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [period, year, month]); // eslint-disable-line

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years  = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Reports</h1>
          <p className="page-subtitle">Sales, purchases, and profit analysis.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-body flex gap-3" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ minWidth: 140 }}>
          <label className="form-label">Period</label>
          <select className="form-input" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="daily">Daily (per day in month)</option>
            <option value="monthly">Monthly (per month in year)</option>
            <option value="yearly">Yearly (per year)</option>
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 110 }}>
          <label className="form-label">Year</label>
          <select className="form-input" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {period === 'daily' && (
          <div className="form-group" style={{ minWidth: 120 }}>
            <label className="form-label">Month</label>
            <select className="form-input" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
        )}
      </div>

      {loading ? <div className="spinner">⏳ Generating report…</div> : !report ? null : (
        <>
          {/* Summary cards */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-card-accent" style={{ background: 'var(--green-500)' }} />
              <div className="stat-card-icon">💰</div>
              <div className="stat-card-value">Rs {report.totalSales?.toLocaleString()}</div>
              <div className="stat-card-label">Total Sales</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-accent" style={{ background: 'var(--red-500)' }} />
              <div className="stat-card-icon">🛒</div>
              <div className="stat-card-value">Rs {report.totalPurchases?.toLocaleString()}</div>
              <div className="stat-card-label">Total Purchases</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-accent" style={{ background: 'var(--blue-500)' }} />
              <div className="stat-card-icon">📈</div>
              <div className="stat-card-value" style={{ color: report.profit >= 0 ? 'var(--green-500)' : 'var(--red-500)' }}>
                Rs {report.profit?.toLocaleString()}
              </div>
              <div className="stat-card-label">Net Profit</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-accent" style={{ background: 'var(--purple-500)' }} />
              <div className="stat-card-icon">🧾</div>
              <div className="stat-card-value">{report.invoiceCount}</div>
              <div className="stat-card-label">Invoices</div>
            </div>
          </div>

          {/* Breakdown table */}
          {report.breakdown?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📊 Breakdown</h2>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Period</th><th>Sales (Rs)</th><th>Purchases (Rs)</th><th>Profit (Rs)</th><th>Invoices</th></tr></thead>
                  <tbody>
                    {report.breakdown.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{row.label}</td>
                        <td style={{ color: 'var(--green-500)' }}>Rs {row.sales?.toLocaleString()}</td>
                        <td style={{ color: 'var(--red-500)' }}>Rs {row.purchases?.toLocaleString()}</td>
                        <td style={{ color: row.profit >= 0 ? 'var(--green-500)' : 'var(--red-500)', fontWeight: 600 }}>Rs {row.profit?.toLocaleString()}</td>
                        <td className="text-muted">{row.invoiceCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FinancialReports;
