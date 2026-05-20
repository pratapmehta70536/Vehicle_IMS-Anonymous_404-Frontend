import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const StaffPartRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get('/part-requests');
      setRequests(res.data.data || []);
    } catch {
      toast.error('Failed to load part requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/part-requests/${id}/status?status=${newStatus}`);
      toast.success(`Part request status set to: ${newStatus}`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const statusBadge = (s) => {
    if (s === 'Pending')   return 'badge-warning';
    if (s === 'In stock' || s === 'Completed' || s === 'Fulfilled') return 'badge-success';
    if (s === 'cancelled' || s === 'Not available' || s === 'Rejected') return 'badge-danger';
    if (s === 'Available soon' || s === 'Full stock available soon') return 'badge-info';
    if (s === 'Not enough stock') return 'badge-warning';
    return 'badge-neutral';
  };

  const filteredRequests = requests.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Part Requests</h1>
          <p className="page-subtitle">View and update statuses of custom part requests requested by customers.</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="form-input" 
            style={{ width: 'auto' }} 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="cancelled">cancelled</option>
            <option value="Not available">Not available</option>
            <option value="Available soon">Available soon</option>
            <option value="In stock">In stock</option>
            <option value="Not enough stock">Not enough stock</option>
            <option value="Full stock available soon">Full stock available soon</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner">⏳ Loading part requests…</div>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p className="empty-state-text">No part requests found.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Part Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Requested On</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.customerName || 'Customer'}</td>
                    <td style={{ fontWeight: 600 }}>{r.partName}</td>
                    <td className="text-muted text-sm">{r.description || '—'}</td>
                    <td>
                      <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="text-muted text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="form-input text-xs"
                        style={{ width: 'auto', padding: '4px 8px', height: 'auto', display: 'inline-block' }}
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="cancelled">cancelled</option>
                        <option value="Not available">Not available</option>
                        <option value="Available soon">Available soon</option>
                        <option value="In stock">In stock</option>
                        <option value="Not enough stock">Not enough stock</option>
                        <option value="Full stock available soon">Full stock available soon</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
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

export default StaffPartRequests;
