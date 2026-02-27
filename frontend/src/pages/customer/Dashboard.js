import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiPackage, FiStar, FiArrowRight, FiSearch,
  FiShield, FiCreditCard, FiCheckCircle, FiAlertCircle,
  FiUser, FiEdit2, FiSave, FiX, FiPlus, FiTrash2
} from 'react-icons/fi';

const LOAN_BANKS = [
  { id: 'nordea',        name: 'Nordea Bank',   rate: 4.5, flag: '🇫🇮' },
  { id: 's_bank',        name: 'S-Bank',         rate: 5.2, flag: '🇫🇮' },
  { id: 'deutsche_bank', name: 'Deutsche Bank',  rate: 3.9, flag: '🇩🇪' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   PROFILE EDIT PANEL
   Fields: Name · Company · Street · City · Country · Pincode · VAT · Phone
           Optional ISO certifications (add / remove)
───────────────────────────────────────────────────────────────────────────── */
function ProfilePanel({ user, onSaved }) {
  const { updateUser } = useAuth();
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState(null); // null until full user loaded from DB
  const [newCert,  setNewCert]  = useState({ name: '', number: '', issuedBy: '' });

  // Load full user from DB — login only stores minimal fields in localStorage
  useEffect(() => {
    API.get('/auth/me/full').then(({ data }) => {
      const u = data.user;
      setForm({
        name:      u.name      || '',
        company:   u.company   || '',
        phone:     u.phone     || '',
        vatNumber: u.vatNumber || '',
        address: {
          street:  u.address?.street  || '',
          city:    u.address?.city    || '',
          country: u.address?.country || '',
          pincode: u.address?.pincode || '',
        },
        certifications: (u.buyerProfile?.certifications || []).map(c => ({ ...c })),
      });
    }).catch(() => {
      // Fallback to props if endpoint not yet available
      setForm({
        name:      user.name      || '',
        company:   user.company   || '',
        phone:     user.phone     || '',
        vatNumber: user.vatNumber || '',
        address: {
          street:  user.address?.street  || '',
          city:    user.address?.city    || '',
          country: user.address?.country || '',
          pincode: user.address?.pincode || '',
        },
        certifications: (user.buyerProfile?.certifications || []).map(c => ({ ...c })),
      });
    });
  }, []);

  if (!form) return (
    <div className="card" style={{ padding: 24, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  const pct = (() => {
    const checks = [form.name, form.company, form.address.street, form.vatNumber, form.phone];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  })();

  const handleField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const handleAddr  = (key, val) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));

  const addCert = () => {
    if (!newCert.name) return;
    setForm(f => ({ ...f, certifications: [...f.certifications, { ...newCert, verified: false }] }));
    setNewCert({ name: '', number: '', issuedBy: '' });
  };
  const removeCert = (i) => setForm(f => ({ ...f, certifications: f.certifications.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name:      form.name,
        company:   form.company,
        phone:     form.phone,
        vatNumber: form.vatNumber,
        address:   form.address,
        buyerProfile: { certifications: form.certifications },
      };
      const { data } = await API.put('/auth/profile', payload);
      updateUser({ ...user, ...payload, ...data.user });
      onSaved && onSaved();
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header row */}
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: 15, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiUser style={{ color: 'var(--accent)' }} /> My Profile
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {editing ? (
            <>
              <button className="btn btn-accent btn-sm" onClick={save} disabled={saving}>
                <FiSave /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}><FiX /></button>
            </>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Completeness bar */}
      <div style={{ marginBottom: 18 }}>
        <div className="flex-between" style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profile Completeness</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: pct >= 80 ? 'var(--green)' : 'var(--accent)' }}>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill progress-gold" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--green)' : undefined }} />
        </div>
      </div>

      {!editing ? (
        /* ── View Mode ── */
        <div>
          {/* Name + Company */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Full Name</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{form.name || <span style={{ color: 'var(--text-3)' }}>Not set</span>}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Company</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{form.company || <span style={{ color: 'var(--text-3)' }}>Not set</span>}</div>
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Company Address</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              {[form.address.street, form.address.city, form.address.country, form.address.pincode].filter(Boolean).join(', ') || <span style={{ color: 'var(--text-3)' }}>Not set</span>}
            </div>
          </div>

          {/* VAT + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>VAT Number</div>
              <div style={{ fontSize: 13, fontFamily: 'monospace', color: form.vatNumber ? 'var(--text)' : 'var(--text-3)' }}>
                {form.vatNumber || '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Phone</div>
              <div style={{ fontSize: 13, color: form.phone ? 'var(--text)' : 'var(--text-3)' }}>{form.phone || '—'}</div>
            </div>
          </div>

          {/* Certifications (optional) */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              ISO / Other Certifications <span style={{ fontWeight: 400 }}>(optional)</span>
            </div>
            {form.certifications.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>No certifications added yet</div>
            ) : (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {form.certifications.map((c, i) => (
                  <span key={i} className="badge badge-green" style={{ fontSize: 11 }}>
                    <FiShield style={{ marginRight: 3, fontSize: 9 }} />
                    {c.name}{c.number ? ` · ${c.number}` : ''}{c.issuedBy ? ` (${c.issuedBy})` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Edit Mode ── */
        <div>
          {/* Name + Company */}
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Full Name *</label>
              <input className="input" value={form.name} onChange={e => handleField('name', e.target.value)} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label className="input-label">Company Name</label>
              <input className="input" value={form.company} onChange={e => handleField('company', e.target.value)} placeholder="Your company" />
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: 4 }}>
            <label className="input-label">Company Address</label>
          </div>
          <div className="form-group">
            <input className="input" value={form.address.street} onChange={e => handleAddr('street', e.target.value)} placeholder="Street address" style={{ marginBottom: 8 }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input className="input" value={form.address.city} onChange={e => handleAddr('city', e.target.value)} placeholder="City" />
            </div>
            <div className="form-group">
              <input className="input" value={form.address.country} onChange={e => handleAddr('country', e.target.value)} placeholder="Country" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <input className="input" value={form.address.pincode} onChange={e => handleAddr('pincode', e.target.value)} placeholder="Postal / ZIP code" />
            </div>
            <div className="form-group">
              <label className="input-label">Phone</label>
              <input className="input" value={form.phone} onChange={e => handleField('phone', e.target.value)} placeholder="+49 89 123 456" />
            </div>
          </div>

          {/* VAT Number */}
          <div className="form-group">
            <label className="input-label">VAT Number</label>
            <input className="input" value={form.vatNumber} onChange={e => handleField('vatNumber', e.target.value)} placeholder="e.g. DE123456789 · FR87654321 · PL9876543210" style={{ fontFamily: 'monospace' }} />
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Required for TradeConnect transactions and invoicing in the EU</div>
          </div>

          {/* ISO / Certifications — optional */}
          <div className="form-group">
            <label className="input-label">
              ISO / Other Certifications <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-3)' }}>(optional)</span>
            </label>

            {/* Existing certs */}
            {form.certifications.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <FiShield style={{ color: 'var(--green)', flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12 }}>
                  <strong>{c.name}</strong>
                  {c.number && <span style={{ color: 'var(--text-3)' }}> · {c.number}</span>}
                  {c.issuedBy && <span style={{ color: 'var(--text-3)' }}> · {c.issuedBy}</span>}
                </div>
                <button type="button" onClick={() => removeCert(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, fontSize: 14 }}><FiTrash2 /></button>
              </div>
            ))}

            {/* Add new cert */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginTop: 8 }}>
              <input className="input" placeholder="Name (e.g. ISO 9001:2015)" style={{ fontSize: 12 }}
                value={newCert.name} onChange={e => setNewCert(n => ({ ...n, name: e.target.value }))} />
              <input className="input" placeholder="Cert number" style={{ fontSize: 12 }}
                value={newCert.number} onChange={e => setNewCert(n => ({ ...n, number: e.target.value }))} />
              <input className="input" placeholder="Issued by" style={{ fontSize: 12 }}
                value={newCert.issuedBy} onChange={e => setNewCert(n => ({ ...n, issuedBy: e.target.value }))} />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addCert} disabled={!newCert.name}>
                <FiPlus />
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>Add ISO 9001, ISO 14001, CE Mark, or any relevant certification</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MEMBERSHIP CARD
───────────────────────────────────────────────────────────────────────────── */
function MembershipCard({ membership, user }) {
  const [plans,       setPlans]       = useState(null);
  const [showPlans,   setShowPlans]   = useState(false);
  const [emi,         setEmi]         = useState({ bank: 'nordea', term: 12, amount: 500 });
  const [emiResult,   setEmiResult]   = useState(null);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    API.get('/membership/plans').then(r => setPlans(r.data.data)).catch(() => {});
  }, []);

  const calcEmi = async () => {
    try {
      const r = await API.post('/membership/emi-calculate', { amount: emi.amount, bankId: emi.bank, termMonths: emi.term });
      setEmiResult(r.data.data);
    } catch {}
  };

  const subscribe = async (planType) => {
    setSubscribing(planType);
    try {
      await API.post('/membership/subscribe', { planType });
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
      setSubscribing(null);
    }
  };

  const buyerPlans = plans?.plans?.buyer;
  const isActive   = membership?.status === 'active';

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: 15, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiCreditCard style={{ color: 'var(--accent)' }} /> Membership
        </h3>
        {!isActive && (
          <button className="btn btn-accent btn-sm" onClick={() => setShowPlans(!showPlans)}>
            {showPlans ? 'Hide Plans' : 'Get Membership'}
          </button>
        )}
      </div>

      {isActive ? (
        <div>
          <div style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <FiCheckCircle style={{ color: 'var(--green)' }} />
              <strong style={{ color: 'var(--green)' }}>Active — {membership.planLabel}</strong>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>€{membership.fee} {membership.planType === 'one_time' ? 'one-time lifetime' : `/ ${membership.planType}`}</div>
            {membership.discount > 0 && <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>✓ {membership.discount}% discount applied on all services</div>}
            {membership.endDate && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Renews: {new Date(membership.endDate).toLocaleDateString()}</div>}
          </div>
          {membership.financed && (
            <div style={{ fontSize: 12, color: 'var(--text-2)', background: 'rgba(245,166,35,0.07)', padding: 10, borderRadius: 8, border: '1px solid rgba(245,166,35,0.15)' }}>
              🏦 Financed via {membership.loanBank} · EMI: €{membership.emiAmount}/mo × {membership.loanTermMonths} months
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ padding: '10px 14px', background: 'rgba(255,70,85,0.07)', border: '1px solid rgba(255,70,85,0.15)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)', marginBottom: showPlans ? 16 : 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiAlertCircle style={{ color: '#ff4655' }} />
            No active membership. Buyer plans from €200/month or €500 one-time. 10% discount on annual plan.
          </div>

          {showPlans && buyerPlans && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                {Object.values(buyerPlans).map(p => (
                  <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, position: 'relative' }}>
                    {p.type === 'annual' && (
                      <div style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#000', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                        10% OFF
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{p.label}</div>
                    {p.originalFee && <div style={{ fontSize: 10, color: 'var(--text-3)', textDecoration: 'line-through' }}>€{p.originalFee}</div>}
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', marginBottom: 6 }}>€{p.fee}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8 }}>
                      {p.type === 'one_time' ? 'one-time · lifetime' : p.type === 'monthly' ? '/month' : '/year (10% off)'}
                    </div>
                    {p.features.map(f => (
                      <div key={f} style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 3 }}>✓ {f}</div>
                    ))}
                    <button className="btn btn-accent btn-sm" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
                      disabled={subscribing === p.type} onClick={() => subscribe(p.type)}>
                      {subscribing === p.type ? 'Activating…' : 'Subscribe'}
                    </button>
                  </div>
                ))}
              </div>

              {/* EMI Calculator */}
              <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🏦 Finance with EMI — Nordea · S-Bank · Deutsche Bank</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4, fontWeight: 700 }}>Bank</label>
                    <select className="input" style={{ fontSize: 12 }} value={emi.bank} onChange={e => setEmi({ ...emi, bank: e.target.value })}>
                      {LOAN_BANKS.map(b => <option key={b.id} value={b.id}>{b.flag} {b.name} ({b.rate}%)</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4, fontWeight: 700 }}>Amount (€)</label>
                    <input className="input" type="number" style={{ fontSize: 12 }} value={emi.amount} onChange={e => setEmi({ ...emi, amount: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4, fontWeight: 700 }}>Term (months)</label>
                    <select className="input" style={{ fontSize: 12 }} value={emi.term} onChange={e => setEmi({ ...emi, term: e.target.value })}>
                      {[6, 12, 24, 36, 48].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={calcEmi}>Calculate</button>
                </div>
                {emiResult && (
                  <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {[
                      ['Monthly EMI', `€${emiResult.emiAmount}`, 'var(--green)'],
                      ['Total Payable', `€${emiResult.totalPayable}`, 'var(--text)'],
                      ['Total Interest', `€${emiResult.totalInterest}`, 'var(--accent)'],
                    ].map(([l, v, c]) => (
                      <div key={l} style={{ textAlign: 'center', padding: 8, background: 'var(--surface-2)', borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{l}</div>
                        <div style={{ fontWeight: 800, color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────────────────────────── */
export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders,     setOrders]     = useState([]);
  const [guide,      setGuide]      = useState(null);
  const [membership, setMembership] = useState(null);

  useEffect(() => {
    API.get('/orders/my').then(({ data }) => setOrders(data.orders?.slice(0, 5) || [])).catch(() => {});
    API.get('/users/guide/startup').then(({ data }) => setGuide(data.guide)).catch(() => {});
    API.get('/membership/my').then(({ data }) => setMembership(data.data)).catch(() => {});
  }, []);

  const totalSpend = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const isActive   = membership?.status === 'active';

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <h1>Welcome, {user.name}! 👋</h1>
        <p>
          {user.company ? `${user.company} · ` : ''}
          {user.address?.country || 'European Industrial Marketplace'}
          {user.vatNumber ? ` · VAT: ${user.vatNumber}` : ''}
        </p>
      </div>

      {/* Membership upgrade banner */}
      {!isActive && (
        <div style={{ background: 'linear-gradient(135deg,rgba(245,166,35,0.12),rgba(245,166,35,0.04))', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <FiCreditCard style={{ fontSize: 28, color: 'var(--accent)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Unlock full platform access</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Buyer membership from €200/month or €500 one-time. 10% discount with annual plan. Financing available via Nordea, S-Bank &amp; Deutsche Bank.
            </div>
          </div>
          <a href="#membership" className="btn btn-accent btn-sm" style={{ flexShrink: 0 }}>View Plans</a>
        </div>
      )}

      {/* Quick action cards */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <Link to="/products" className="card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'center', textDecoration: 'none' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}><FiSearch /></div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700 }}>Browse Products</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Motors, chips, hydraulics & more</div>
          </div>
        </Link>
        <Link to="/suggestions" className="card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'center', textDecoration: 'none' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}><FiStar /></div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700 }}>For You</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>AI-powered suggestions</div>
          </div>
        </Link>
        <Link to="/my-orders" className="card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'center', textDecoration: 'none' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}><FiPackage /></div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700 }}>My Orders</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Total spend: €{totalSpend.toLocaleString()}</div>
          </div>
        </Link>
      </div>

      {/* Profile + Orders row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <ProfilePanel user={user} />

        <div className="card" style={{ padding: 24 }}>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 15 }}>Recent Orders</h3>
            <Link to="/my-orders" className="btn btn-outline btn-sm">View All <FiArrowRight /></Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders yet.</p>
              <Link to="/products" className="btn btn-accent btn-sm" style={{ marginTop: 12 }}>Start Shopping</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Order</th><th>Items</th><th>Total (€)</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td style={{ fontSize: 11 }}>{o.orderNumber}</td>
                      <td>{o.items?.length} item(s)</td>
                      <td>€{o.totalAmount?.toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${o.status === 'delivered' ? 'green' : o.status === 'pending' ? 'yellow' : o.status === 'cancelled' ? 'red' : 'blue'}`}>
                          {o.status}
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

      {/* Membership section */}
      <div id="membership" style={{ marginBottom: 24 }}>
        <MembershipCard membership={membership} user={user} />
      </div>

      {/* Startup guide */}
      {guide && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontSize: 16, marginBottom: 16 }}>🚀 {guide.title}</h3>
          <div>
            {guide.steps.map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {s.step}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
