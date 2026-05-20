import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register({ fullName: form.fullName, email: form.email, password: form.password, phone: form.phone, address: form.address });
      if (user) navigate('/customer');
    } catch (_) {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb--top" />
      <div className="auth-bg-orb auth-bg-orb--bottom" />
      <div className="auth-card auth-card--wide">
        <div className="auth-logo">
          <span className="auth-logo-icon">⚙</span>
        </div>
        <h1 className="auth-title">Customer Registration</h1>
        <p className="auth-subtitle">Create your account to book services and track your vehicles.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-fullName">Full Name</label>
              <input id="reg-fullName" name="fullName" type="text" className="form-input" placeholder="John Doe" value={form.fullName} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" className="form-input" placeholder="Min 6 chars" value={form.password} onChange={handle} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" name="confirmPassword" type="password" className="form-input" placeholder="••••••••" value={form.confirmPassword} onChange={handle} required />
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone</label>
              <input id="reg-phone" name="phone" type="text" className="form-input" placeholder="9812345678" value={form.phone} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-address">Address</label>
              <input id="reg-address" name="address" type="text" className="form-input" placeholder="City, State" value={form.address} onChange={handle} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
