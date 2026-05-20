import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/* RegisterCustomer — Staff registers a new customer with optional vehicle details (Feature 6) */
const EMPTY_CUSTOMER = { fullName: '', email: '', password: '', phone: '', address: '' };
const EMPTY_VEHICLE  = { vehicleNumber: '', make: '', model: '', year: '', color: '' };

const RegisterCustomer = () => {
  const [customer, setCustomer]   = useState(EMPTY_CUSTOMER);
  const [vehicle, setVehicle]     = useState(EMPTY_VEHICLE);
  const [addVehicle, setAddVehicle] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(null);

  const handleCustomer = (e) => setCustomer(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleVehicle  = (e) => setVehicle(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (customer.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...customer,
        vehicle: addVehicle && vehicle.vehicleNumber ? vehicle : null,
      };
      const res = await api.post('/customers', payload);
      const created = res.data.data;
      toast.success(`Customer "${created.fullName}" registered`);
      setSuccess(created);
      setCustomer(EMPTY_CUSTOMER);
      setVehicle(EMPTY_VEHICLE);
      setAddVehicle(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Register Customer</h1>
          <p className="page-subtitle">Add a new customer and optionally register their vehicle.</p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>✅ Customer <strong>{success.fullName}</strong> ({success.email}) registered successfully!</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setSuccess(null)}>✕</button>
        </div>
      )}

      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-header">
          <h2 className="card-title">👤 Customer Details</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card-body form-stack">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="rc-fullName">Full Name *</label>
                <input id="rc-fullName" name="fullName" className="form-input" placeholder="John Doe" value={customer.fullName} onChange={handleCustomer} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rc-email">Email *</label>
                <input id="rc-email" name="email" type="email" className="form-input" placeholder="customer@example.com" value={customer.email} onChange={handleCustomer} required />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="rc-password">Password *</label>
                <input id="rc-password" name="password" type="password" className="form-input" placeholder="Min 6 characters" value={customer.password} onChange={handleCustomer} required minLength={6} />
                <span className="text-xs text-muted mt-1">Customer will use this to log in.</span>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rc-phone">Phone</label>
                <input id="rc-phone" name="phone" className="form-input" placeholder="9812345678" value={customer.phone} onChange={handleCustomer} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="rc-address">Address</label>
              <input id="rc-address" name="address" className="form-input" placeholder="City, State" value={customer.address} onChange={handleCustomer} />
            </div>

            {/* Vehicle toggle */}
            <label className="flex items-center gap-2 mt-2" style={{ cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={addVehicle}
                onChange={e => setAddVehicle(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--blue-500)' }}
              />
              <span className="font-semibold" style={{ fontSize: '.9rem' }}>🚗 Also register a vehicle for this customer</span>
            </label>

            {addVehicle && (
              <>
                <div className="section-label">Vehicle Details</div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="rv-number">Vehicle Number *</label>
                    <input id="rv-number" name="vehicleNumber" className="form-input" placeholder="BA 1 PA 1234" value={vehicle.vehicleNumber} onChange={handleVehicle} required={addVehicle} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rv-make">Make *</label>
                    <input id="rv-make" name="make" className="form-input" placeholder="Toyota" value={vehicle.make} onChange={handleVehicle} required={addVehicle} />
                  </div>
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="rv-model">Model *</label>
                    <input id="rv-model" name="model" className="form-input" placeholder="Corolla" value={vehicle.model} onChange={handleVehicle} required={addVehicle} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rv-year">Year</label>
                    <input id="rv-year" name="year" type="number" min="1980" max={new Date().getFullYear()} className="form-input" placeholder="2020" value={vehicle.year} onChange={handleVehicle} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rv-color">Color</label>
                    <input id="rv-color" name="color" className="form-input" placeholder="White" value={vehicle.color} onChange={handleVehicle} />
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="reset" className="btn btn-ghost" onClick={() => { setCustomer(EMPTY_CUSTOMER); setVehicle(EMPTY_VEHICLE); setAddVehicle(false); }}>Reset</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Registering…' : 'Register Customer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterCustomer;
