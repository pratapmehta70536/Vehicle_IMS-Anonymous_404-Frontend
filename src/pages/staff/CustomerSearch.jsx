import React, { useState, useCallback, useEffect } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* CustomerSearch — staff searches customers by name, phone, ID, or vehicle number */
const CustomerSearch = () => {
  const [query, setQuery]       = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);

  // Load all customers on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.get('/customers');
        setResults(res.data.data || []);
        setSearched(true);
      } catch { toast.error('Failed to load customers'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      if (!query.trim()) {
        // Empty query → reload all customers
        const res = await api.get('/customers');
        setResults(res.data.data || []);
      } else {
        const res = await api.get('/customers/search', { params: { q: query, by: searchBy } });
        setResults(res.data.data || []);
      }
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  }, [query, searchBy]);

  const fetchDetail = async (id) => {
    try {
      const res = await api.get(`/customers/${id}`);
      // ASP.NET Core serializes to camelCase: { customer, vehicles, invoices }
      const { customer, vehicles, invoices } = res.data.data;
      setSelected({
        ...customer,
        vehicles: vehicles || [],
        recentPurchases: invoices || [],
      });
    } catch { toast.error('Failed to load customer details'); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Search</h1>
          <p className="page-subtitle">Find customers by name, phone, ID, or vehicle number.</p>
        </div>
      </div>

      {/* Search form */}
      <div className="card card-body" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} className="flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ minWidth: 160 }}>
            <label className="form-label">Search By</label>
            <select className="form-input" value={searchBy} onChange={e => setSearchBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="phone">Phone</option>
              <option value="id">Customer ID</option>
              <option value="vehicle">Vehicle Number</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
            <label className="form-label">Search Query</label>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder={`Enter ${searchBy}…`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        loading ? <div className="spinner">⏳ Searching…</div> : results.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔍</div><p className="empty-state-text">No customers found for that query.</p></div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">{query.trim() ? 'Search Results' : 'All Customers'}</h2>
              <span className="badge badge-neutral">{results.length} found</span>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {results.map(c => (
                    <tr key={c.id}>
                      <td className="text-muted text-sm">#{c.id}</td>
                      <td style={{ fontWeight: 600 }}>{c.fullName}</td>
                      <td className="text-muted">{c.email}</td>
                      <td className="text-muted">{c.phone || '—'}</td>
                      <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-neutral'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => fetchDetail(c.id)}>👁 View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Customer Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal modal--lg">
            <div className="modal-header">
              <h3 className="modal-title">👤 {selected.fullName}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Basic info */}
              <div className="grid-2 mb-4">
                <div><span className="text-muted text-sm">Email</span><br/><strong>{selected.email}</strong></div>
                <div><span className="text-muted text-sm">Phone</span><br/><strong>{selected.phone || '—'}</strong></div>
                <div><span className="text-muted text-sm">Address</span><br/><strong>{selected.address || '—'}</strong></div>
                <div><span className="text-muted text-sm">Registered</span><br/><strong>{new Date(selected.createdAt).toLocaleDateString()}</strong></div>
              </div>

              {/* Vehicles */}
              {selected.vehicles?.length > 0 && (
                <>
                  <div className="section-label">🚗 Vehicles</div>
                  <div className="table-wrapper mb-4">
                    <table className="data-table">
                      <thead><tr><th>Number</th><th>Make</th><th>Model</th><th>Year</th><th>Color</th></tr></thead>
                      <tbody>
                        {selected.vehicles.map(v => (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 600 }}>{v.vehicleNumber}</td>
                            <td>{v.make}</td><td>{v.model}</td>
                            <td>{v.year || '—'}</td><td>{v.color || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Purchase history */}
              {selected.recentPurchases?.length > 0 && (
                <>
                  <div className="section-label">🧾 Recent Purchases</div>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead><tr><th>Invoice</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {selected.recentPurchases.map(p => (
                          <tr key={p.id}>
                            <td className="text-muted text-sm">INV-{String(p.id).padStart(4,'0')}</td>
                            <td style={{ color: 'var(--green-500)', fontWeight: 600 }}>Rs {p.finalAmount?.toLocaleString()}</td>
                            <td><span className={`badge ${p.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{p.paymentStatus}</span></td>
                            <td className="text-muted text-sm">{new Date(p.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;
