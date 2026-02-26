import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiCheck } from 'react-icons/fi';
import './Auth.css';

const ROLES = [
  { value: 'customer', icon: '👤', label: 'Buyer / Startup', desc: 'Source certified components' },
  { value: 'supplier', icon: '🏭', label: 'Manufacturer', desc: 'List and sell products' },
  { value: 'admin', icon: '⚡', label: 'Administrator', desc: 'Platform management' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') || 'customer', company: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = () => {
    if (!form.name.trim()) return toast.error('Full name is required');
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Please enter a valid email');
    setStep(2);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to IndustrialHub, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'supplier' ? '/supplier/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">

      {/* Right */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>{step === 1 ? 'Create account' : 'Your role'}</h1>
            <p>Step {step} of 2 — {step === 1 ? 'Basic information' : 'Choose how you will use IndustrialHub'}</p>
          </div>

          <div className="auth-step-bar">
            {[1, 2].map(s => (
              <div key={s} className={`auth-step-bar__item ${s <= step ? 'auth-step-bar__item--active' : ''}`} />
            ))}
          </div>

          {step === 1 ? (
            <div>
              <div className="eu-form-row">
                <div className="eu-form-group">
                  <label className="eu-label">Full Name *</label>
                  <input className="eu-input" name="name" placeholder="Klaus Müller" value={form.name} onChange={handleChange} />
                </div>
                <div className="eu-form-group">
                  <label className="eu-label">Phone</label>
                  <input className="eu-input" name="phone" placeholder="+49 69 1234 5678" value={form.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="eu-form-group">
                <label className="eu-label">Email Address *</label>
                <input className="eu-input" name="email" type="email" placeholder="you@company.eu" value={form.email} onChange={handleChange} />
              </div>
              <div className="eu-form-group">
                <label className="eu-label">Company Name</label>
                <input className="eu-input" name="company" placeholder="Your company or organisation" value={form.company} onChange={handleChange} />
              </div>
              <button className="eu-auth-submit" onClick={nextStep}>Continue →</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="eu-form-group">
                <label className="eu-label">I am joining as</label>
                <div className="eu-role-grid">
                  {ROLES.map(r => (
                    <div key={r.value} className={`eu-role-option ${form.role === r.value ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, role: r.value })}>
                      <span className="eu-role-option__icon">{r.icon}</span>
                      <div className="eu-role-option__name">{r.label}</div>
                      <div style={{ fontSize: 10, color: '#4b5563', marginTop: 3 }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="eu-form-group">
                <label className="eu-label">Create Password *</label>
                <input className="eu-input" name="password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} />
              </div>
              <div className="eu-auth-info">
                <strong>✓ Free to start</strong> — No credit card required. A platform fee of 2% applies only on completed transactions.
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="eu-back-btn" onClick={() => setStep(1)}>← Back</button>
                <button className="eu-auth-submit" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Creating account…' : <><FiCheck /> Create Account</>}
                </button>
              </div>
            </form>
          )}

          <div className="eu-auth-switch" style={{ marginTop: 24 }}>
            Already have an account? <Link to="/login">Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
