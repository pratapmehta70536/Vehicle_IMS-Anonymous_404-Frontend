import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

const StaffAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data || []);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const statusBadge = (s) => {
    if (s === 'Confirmed') return 'badge-success';
    if (s === 'Pending')   return 'badge-warning';
    if (s === 'Cancelled') return 'badge-danger';
    if (s === 'Completed') return 'badge-info';
    return 'badge-neutral';
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterStatus === 'All') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Appointments</h1>
          <p className="page-subtitle">View and update statuses of customer appointments.</p>
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
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner">⏳ Loading appointments…</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p className="empty-state-text">No appointments found matching this status.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Service Type</th>
                  <th>Scheduled Date</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.customerName || 'Customer'}</td>
                    <td style={{ fontWeight: 600 }}>{a.serviceType}</td>
                    <td className="text-muted">{new Date(a.scheduledDate).toLocaleString()}</td>
                    <td className="text-muted text-sm">{a.notes || '—'}</td>
                    <td>
                      <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
                    </td>
                    <td>
                      <select
                        className="form-input text-xs"
                        style={{ width: 'auto', padding: '4px 8px', height: 'auto', display: 'inline-block' }}
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
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

export default StaffAppointments;
