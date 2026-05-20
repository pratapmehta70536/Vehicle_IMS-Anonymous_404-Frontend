import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const AvailableParts = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchParts = useCallback(async () => {
    try {
      const res = await api.get('/parts');
      setParts(res.data.data || []);
    } catch {
      toast.error('Failed to load parts inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const filteredParts = parts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Available Parts</h1>
          <p className="page-subtitle">View items in stock, selling prices, and current levels.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-icon">🔧</div>
          <div className="stat-card-value">{parts.length}</div>
          <div className="stat-card-label">Total Unique Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">⚠️</div>
          <div className="stat-card-value">{parts.filter(p => p.isLowStock).length}</div>
          <div className="stat-card-label">Low Stock items</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📦</div>
          <div className="stat-card-value">{parts.reduce((sum, p) => sum + p.stock, 0)}</div>
          <div className="stat-card-label">Total Units Available</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-bar" style={{ marginBottom: '1rem', marginTop: '1rem' }}>
        <div className="search-input-wrap" style={{ maxWidth: 360 }}>
          <span className="search-icon">🔍</span>
          <input 
            className="form-input" 
            placeholder="Search by item name or category…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ paddingLeft: '2.5rem' }} 
          />
        </div>
      </div>

      {/* Parts Table */}
      <div className="card">
        {loading ? (
          <div className="spinner">⏳ Loading inventory…</div>
        ) : filteredParts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-text">No parts found matching your query.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Price per Item</th>
                  <th>Available Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="text-muted">{p.category || '—'}</td>
                    <td style={{ color: 'var(--green-500)', fontWeight: 600 }}>
                      Rs {p.sellingPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      {p.isLowStock ? (
                        <span className="badge badge-danger" title="Low Stock Warning">{p.stock} (Low)</span>
                      ) : (
                        <span className="badge badge-success">{p.stock}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${p.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableParts;
