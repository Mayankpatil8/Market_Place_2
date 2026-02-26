import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

const DEMOS = [
  { role: 'Administrator', email: 'admin@demo.com', password: 'demo1234', icon: '⚡', desc: 'Full platform access', color: '#fca5a5' },
  { role: 'Supplier', email: 'supplier@demo.com', password: 'demo1234', icon: '🏭', desc: 'Manufacturer portal', color: '#86efac' },
  { role: 'Buyer', email: 'customer@demo.com', password: 'demo1234', icon: '👤', desc: 'Procurement portal', color: '#7dd3fc' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please complete all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'supplier' ? '/supplier/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const useDemo = d => {
    setActiveDemo(d.role);
    setForm({ email: d.email, password: d.password });
  };

  return (
    <div className="auth-page">
      {/* Left */}


      {/* Right */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Sign in</h1>
            <p>Access your IndustrialHub account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="eu-form-group">
              <label className="eu-label">Email Address</label>
              <div className="eu-input-wrap">
                <FiMail className="eu-input-icon" />
                <input className="eu-input eu-input--icon" name="email" type="email"
                  placeholder="you@company.com" value={form.email} onChange={handleChange} autoComplete="email" />
              </div>
            </div>

            <div className="eu-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="eu-label" style={{ margin: 0 }}>Password</label>
                <span style={{ fontSize: 11, color: '#c9a84c', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.04em' }}>Forgot?</span>
              </div>
              <div className="eu-input-wrap">
                <FiLock className="eu-input-icon" />
                <input className="eu-input eu-input--icon" name="password" type={show ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password} onChange={handleChange}
                  autoComplete="current-password" style={{ paddingRight: 44 }} />
                <button type="button" className="eu-eye-btn" onClick={() => setShow(!show)}>
                  {show ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button className="eu-auth-submit" disabled={loading}>
              {loading ? <>Authenticating…</> : <>Sign In →</>}
            </button>
          </form>

          <div className="eu-auth-divider">or continue with</div>
          <div className="eu-auth-socials">
            <button className="eu-auth-social-btn">🌐 Google</button>
            <button className="eu-auth-social-btn">💼 LinkedIn</button>
          </div>

          <div className="eu-auth-switch">
            New to IndustrialHub? <Link to="/register">Create account →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
