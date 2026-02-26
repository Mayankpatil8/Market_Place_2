import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Certifications.css';
import '../public/Services.css';

const CERT_LOGOS = [
  { name: 'ISO 9001', icon: '📋', color: '#c9a84c' },
  { name: 'CE Mark', icon: '🇪🇺', color: '#60a5fa' },
  { name: 'RoHS', icon: '🌿', color: '#86efac' },
  { name: 'ATEX', icon: '💥', color: '#f9a8d4' },
  { name: 'MIL-SPEC', icon: '🛡', color: '#94a3b8' },
  { name: 'REACH', icon: '⚗', color: '#c4b5fd' },
  { name: 'IECEx', icon: '⚡', color: '#fca5a5' },
  { name: 'GDPR', icon: '🔒', color: '#7dd3fc' },
];

const PROCESS = [
  { step: '01', title: 'Initial Assessment', desc: 'We review your product, target markets, and regulatory requirements.' },
  { step: '02', title: 'Roadmap Delivery', desc: 'You receive a clear certification roadmap with timelines and costs.' },
  { step: '03', title: 'Execution & Audit', desc: 'We handle documents, labs, audits, and coordination.' },
  { step: '04', title: 'Certificate Issuance', desc: 'Certificates issued and valid across target markets.' },
];

export default function CertificationCatalogue() {
  const navigate = useNavigate();
  const [certTypes, setCertTypes] = useState([]);
  const [myCerts, setMyCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      API.get('/certifications/types'),
      API.get('/certifications/my'),
    ]).then(([typesRes, myRes]) => {
      setCertTypes(typesRes.data.data || []);
      setMyCerts(myRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getMyApp = (certTypeId) => myCerts.find(c => c.certType === certTypeId);

  const handleApply = async (certTypeId) => {
    setApplying(certTypeId);
    try {
      await API.post('/certifications/apply', { certType: certTypeId });
      toast.success('Application submitted! Track your progress in My Certifications.');
      // Refresh
      const res = await API.get('/certifications/my');
      setMyCerts(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(null);
    }
  };

  const categories = ['all', ...new Set((certTypes || []).map(c => c.category))];
  const filtered = filter === 'all' ? certTypes : certTypes.filter(c => c.category === filter);

  const getStatusBadge = (cert) => {
    if (!cert) return null;
    const map = {
      active: { label: 'In Progress', color: '#c9a84c' },
      completed: { label: '✓ Certified', color: '#86efac' },
      rejected: { label: 'Rejected', color: '#fca5a5' },
      on_hold: { label: 'On Hold', color: '#94a3b8' },
    };
    const info = map[cert.status] || map.active;
    return <span className="cert-status-badge" style={{ color: info.color, borderColor: info.color + '40', background: info.color + '14' }}>{info.label}</span>;
  };

  if (loading) return <div className="cert-loading"><div className="cert-spinner" /></div>;

  return (
    <div className="cert-page">
      {/* Header */}
      <div className="cert-page-header">
        <div>
          <div className="cert-page-tag">· DEFENCE CERTIFICATION</div>
          <h1 className="cert-page-title">
            Become Eligible for<br />
            <em>Defence Supply.</em>
          </h1>
          <p className="cert-page-desc">
            Navigate every certification pathway required to supply defence, aerospace, and government procurement programmes. We prepare documentation, coordinate audits, and manage every stage.
          </p>
        </div>
        {myCerts.length > 0 && (
          <div className="cert-page-header__actions">
            <Link to="/certifications/my" className="cert-primary-btn">
              📋 My Certifications ({myCerts.length}) →
            </Link>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="cert-stats-bar">
        {[
          { val: '8', label: 'Certification Pathways', icon: '📋' },
          { val: '340+', label: 'Certificates Issued', icon: '🏅' },
          { val: '92%', label: 'First-Time Pass Rate', icon: '✓' },
          { val: '4.8 mo', label: 'Average Duration', icon: '⏱' },
        ].map(s => (
          <div key={s.label} className="cert-stat">
            <span className="cert-stat__icon">{s.icon}</span>
            <span className="cert-stat__val">{s.val}</span>
            <span className="cert-stat__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── CERTIFICATION DETAIL ── */}
<section className="svc-cert-section">
  <div className="eu-section">
    <div className="svc-cert-header">
      <div>
        <div className="eu-eyebrow">Certification Services</div>
        <h2 className="svc-section-title" style={{ fontSize: 'clamp(36px,5vw,64px)' }}>
          Every certificate.<br /><em>One trusted partner.</em>
        </h2>
        <p className="eu-lead" style={{ marginTop: 20 }}>
          Navigating European certification is complex. We simplify it — preparing all documentation,
          liaising with notified bodies, and managing the full audit process on your behalf.
        </p>
        <Link to="/register" className="eu-gold-btn" style={{ marginTop: 36 }}>
          Request Free Assessment →
        </Link>
      </div>

      <div className="svc-cert-cards">
        {CERT_LOGOS.map(c => (
          <div key={c.name} className="svc-cert-card" style={{ '--cert-color': c.color }}>
            <span className="svc-cert-card__icon">{c.icon}</span>
            <span className="svc-cert-card__name">{c.name}</span>
            <span className="svc-cert-card__arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

{/* ── HOW IT WORKS ── */}
<section className="svc-process-section">
  <div className="eu-section">
    <div className="svc-section-head" style={{ textAlign: 'center', alignItems: 'center' }}>
      <div>
        <div className="eu-eyebrow" style={{ justifyContent: 'center' }}>Our Process</div>
        <h2 className="svc-section-title">Four steps to<br /><em>full certification.</em></h2>
      </div>
    </div>
    <div className="svc-process-track">
      {PROCESS.map((p, i) => (
        <div key={p.step} className={`svc-process-step eu-anim-up eu-d${i + 1}`}>
          <div className="svc-process-num">{p.step}</div>
          <div className="svc-process-line" />
          <h3 className="svc-process-title">{p.title}</h3>
          <p className="svc-process-desc">{p.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>  



      {/* Certification cards */}
      <div className="cert-catalogue-grid">
        {filtered.map(cert => {
          const myApp = getMyApp(cert.id);
          return (
            <div key={cert.id} className="cert-card" style={{ '--cert-color': cert.colour }}>
              {/* Top */}
              <div className="cert-card__head">
                <div className="cert-card__icon-wrap">
                  <span className="cert-card__icon">{cert.icon}</span>
                </div>
                <div>
                  <div className="cert-card__category">{cert.category}</div>
                  <h3 className="cert-card__name">{cert.name}</h3>
                </div>
                {myApp && getStatusBadge(myApp)}
              </div>

              <p className="cert-card__desc">{cert.description}</p>

              {/* Standards */}
              <div className="cert-card__standards">
                {cert.standards.map(s => (
                  <span key={s} className="cert-card__std-chip">{s}</span>
                ))}
              </div>

              {/* Details row */}
              <div className="cert-card__details">
                <div className="cert-card__detail">
                  <span className="cert-card__detail-label">Duration</span>
                  <span className="cert-card__detail-val">⏱ {cert.duration}</span>
                </div>
                <div className="cert-card__detail">
                  <span className="cert-card__detail-label">Assessment Fee</span>
                  <span className="cert-card__detail-val" style={{ color: 'var(--cert-color)' }}>€ {cert.fee?.toLocaleString()}</span>
                </div>
              </div>

              {/* Eligibility */}
              <div className="cert-card__eligibility">
                <span className="cert-card__elig-label">Eligible for:</span>
                <span className="cert-card__elig-text">{cert.eligibility}</span>
              </div>

              {/* Progress if applied */}
              {myApp && (
                <div className="cert-card__progress-wrap">
                  <div className="cert-card__progress-bar">
                    <div className="cert-card__progress-fill" style={{ width: `${myApp.progressPercent}%`, background: cert.colour }} />
                  </div>
                  <span className="cert-card__progress-pct">{myApp.progressPercent}% complete</span>
                </div>
              )}

              {/* Actions */}
              <div className="cert-card__footer">
                {myApp ? (
                  <Link to={`/certifications/${myApp._id}`} className="cert-track-btn" style={{ '--cert-color': cert.colour }}>
                    Track Progress →
                  </Link>
                ) : (
                  <button
                    className="cert-apply-btn"
                    style={{ '--cert-color': cert.colour }}
                    onClick={() => handleApply(cert.id)}
                    disabled={applying === cert.id}
                  >
                    {applying === cert.id ? 'Submitting…' : '+ Apply Now'}
                  </button>
                )}
                <button className="cert-info-btn" onClick={() => setSelectedCert(cert)}>Details</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selectedCert && (
        <div className="cert-modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="cert-modal" onClick={e => e.stopPropagation()} style={{ '--cert-color': selectedCert.colour }}>
            <button className="cert-modal__close" onClick={() => setSelectedCert(null)}>✕</button>
            <div className="cert-modal__icon">{selectedCert.icon}</div>
            <div className="cert-modal__cat">{selectedCert.category}</div>
            <h2 className="cert-modal__name">{selectedCert.name}</h2>
            <p className="cert-modal__desc">{selectedCert.description}</p>

            <div className="cert-modal__section-title">Standards Covered</div>
            <div className="cert-modal__standards">
              {selectedCert.standards.map(s => <span key={s} className="cert-card__std-chip">{s}</span>)}
            </div>

            <div className="cert-modal__section-title">Eligibility</div>
            <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7 }}>{selectedCert.eligibility}</p>

            <div className="cert-modal__meta">
              <div className="cert-modal__meta-item">
                <div className="cert-modal__meta-label">Duration</div>
                <div className="cert-modal__meta-val">{selectedCert.duration}</div>
              </div>
              <div className="cert-modal__meta-item">
                <div className="cert-modal__meta-label">Assessment Fee</div>
                <div className="cert-modal__meta-val" style={{ color: selectedCert.colour }}>€ {selectedCert.fee?.toLocaleString()}</div>
              </div>
            </div>

            <div className="cert-modal__actions">
              {getMyApp(selectedCert.id) ? (
                <Link to={`/certifications/${getMyApp(selectedCert.id)._id}`} className="cert-primary-btn" onClick={() => setSelectedCert(null)}>
                  Track Progress →
                </Link>
              ) : (
                <button className="cert-primary-btn" style={{ background: selectedCert.colour, color: '#080b14', border: 'none' }}
                  onClick={() => { handleApply(selectedCert.id); setSelectedCert(null); }}>
                  Apply for {selectedCert.name} →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
