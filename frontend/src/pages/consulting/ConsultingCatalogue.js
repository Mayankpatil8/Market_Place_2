import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Consulting.css';

const CATEGORY_FILTERS = ['All', 'Operations', 'Commercial', 'Strategy', 'Technology', 'Finance', 'People', 'Compliance'];

const OUTCOMES_STRIP = [
  { val: '8', label: 'Consulting Disciplines', icon: '🎯' },
  { val: '80+', label: 'Engagements Delivered', icon: '✅' },
  { val: '€340M+', label: 'Client Revenue Impacted', icon: '📈' },
  { val: '94%', label: 'Client Satisfaction', icon: '⭐' },
];

export default function ConsultingCatalogue() {
  const navigate = useNavigate();
  const [services, setServices]     = useState([]);
  const [myEngs, setMyEngs]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('All');
  const [inquiring, setInquiring]   = useState(null);
  const [modalSvc, setModalSvc]     = useState(null);
  const [inquiryForm, setInquiryForm] = useState({ companySize: '', industry: '', scopeNotes: '' });

  useEffect(() => {
    Promise.all([
      API.get('/consulting/services'),
      API.get('/consulting/my'),
    ]).then(([sRes, mRes]) => {
      setServices(sRes.data.data || []);
      setMyEngs(mRes.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getMyEng = id => myEngs.find(e => e.serviceId === id && e.status === 'active');

  const handleInquire = async svc => {
    setInquiring(svc.id);
    try {
      const res = await API.post('/consulting/inquire', {
        serviceId:   svc.id,
        companySize: inquiryForm.companySize,
        industry:    inquiryForm.industry,
        scopeNotes:  inquiryForm.scopeNotes,
      });
      toast.success(`Inquiry submitted — we'll contact you within 2 business days.`);
      const mRes = await API.get('/consulting/my');
      setMyEngs(mRes.data.data || []);
      setModalSvc(null);
      setInquiryForm({ companySize: '', industry: '', scopeNotes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setInquiring(null);
    }
  };

  const filtered = filter === 'All' ? services : services.filter(s => s.category === filter);

  if (loading) return <div className="con-loading"><div className="con-spinner" /></div>;

  return (
    <div className="con-page">

      {/* ── HERO ── */}
      <div className="con-hero">
        <div className="con-hero__bg">
          <div className="con-hero__grid" />
          <div className="con-hero__glow-l" />
          <div className="con-hero__glow-r" />
        </div>
        <div className="con-hero__inner">
          <div className="con-hero__left">
            <div className="con-module-tag">MODULE C · BUSINESS CONSULTING</div>
            <h1 className="con-hero__title">
              Enrich your business.<br />
              <em>Achieve new heights.</em>
            </h1>
            <p className="con-hero__desc">
              Eight specialist consulting disciplines — from supply chain to digital transformation — delivered by practitioners who have built and scaled European industrial businesses.
            </p>
            <div className="con-hero__actions">
              {myEngs.length > 0 && (
                <Link to="/consulting/my" className="con-btn-primary">
                  My Engagements ({myEngs.length}) →
                </Link>
              )}
              <a href="#services" className="con-btn-ghost">Browse Services ↓</a>
            </div>
          </div>
          <div className="con-hero__right">
            {/* Animated service orbit card */}
            <div className="con-orbit-card">
              <div className="con-orbit-card__center">
                <span className="con-orbit-card__hub">💼</span>
                <span className="con-orbit-card__label">Consulting</span>
              </div>
              {['🔗', '📈', '🌍', '⚙', '💻', '💳', '👥', '🌿'].map((icon, i) => (
                <div
                  key={i}
                  className="con-orbit-node"
                  style={{ '--angle': `${i * 45}deg`, '--delay': `${i * 0.2}s` }}
                >
                  {icon}
                </div>
              ))}
              <div className="con-orbit-ring con-orbit-ring--1" />
              <div className="con-orbit-ring con-orbit-ring--2" />
            </div>
          </div>
        </div>

        {/* Outcomes strip */}
        <div className="con-outcomes-strip">
          {OUTCOMES_STRIP.map(o => (
            <div key={o.label} className="con-outcome">
              <span className="con-outcome__icon">{o.icon}</span>
              <span className="con-outcome__val">{o.val}</span>
              <span className="con-outcome__label">{o.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CUSTOM SOLUTION BANNER ── */}
      {myEngs.some(e => e.isCustomSolution) && (
        <div className="con-custom-banner">
          <div className="con-custom-banner__inner">
            <div className="con-custom-banner__icon">🎯</div>
            <div>
              <div className="con-custom-banner__title">A customised solution has been prepared for you</div>
              <div className="con-custom-banner__desc">
                Our team has identified specific areas where we can add value to your business.
              </div>
            </div>
            <Link to="/consulting/my" className="con-btn-primary">View Proposal →</Link>
          </div>
        </div>
      )}

      {/* ── SERVICE CATALOGUE ── */}
      <section className="con-catalogue" id="services">
        <div className="con-catalogue__head">
          <div>
            <div className="con-section-tag">Our Disciplines</div>
            <h2 className="con-section-title">
              Eight pillars of<br /><em>industrial excellence.</em>
            </h2>
          </div>
          <div className="con-filter-tabs">
            {CATEGORY_FILTERS.map(cat => (
              <button
                key={cat}
                className={`con-filter-tab ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="con-grid">
          {filtered.map((svc, i) => {
            const myEng = getMyEng(svc.id);
            return (
              <div
                key={svc.id}
                className="con-card"
                style={{ '--svc-color': svc.colour, animationDelay: `${i * 0.06}s` }}
              >
                {/* Top stripe */}
                <div className="con-card__stripe" />

                <div className="con-card__head">
                  <div className="con-card__icon-ring">{svc.icon}</div>
                  <div className="con-card__meta">
                    <div className="con-card__category">{svc.category}</div>
                    {svc.tags.map(t => (
                      <span key={t} className="con-card__tag">{t}</span>
                    ))}
                  </div>
                </div>

                <h3 className="con-card__name">{svc.name}</h3>
                <p className="con-card__tagline">{svc.tagline}</p>
                <p className="con-card__desc">{svc.description}</p>

                {/* Key outcomes */}
                <div className="con-card__outcomes">
                  {svc.outcomes.map(o => (
                    <div key={o} className="con-card__outcome">
                      <span className="con-card__outcome-dot" />
                      {o}
                    </div>
                  ))}
                </div>

                <div className="con-card__footer">
                  <div className="con-card__pricing">
                    <span className="con-card__price-label">Starting from</span>
                    <span className="con-card__price">€ {svc.startingFee.toLocaleString()}</span>
                    <span className="con-card__duration">· {svc.duration}</span>
                  </div>

                  {myEng ? (
                    <Link
                      to={`/consulting/${myEng._id}`}
                      className="con-card__cta con-card__cta--track"
                    >
                      Track Engagement →
                    </Link>
                  ) : (
                    <button
                      className="con-card__cta"
                      onClick={() => setModalSvc(svc)}
                    >
                      Enquire Now →
                    </button>
                  )}
                </div>

                {myEng && (
                  <div className="con-card__progress">
                    <div
                      className="con-card__progress-fill"
                      style={{ width: `${myEng.progressPercent}%`, background: svc.colour }}
                    />
                    <span>{myEng.progressPercent}% — {myEng.currentStage}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="con-how">
        <div className="con-section-tag" style={{ justifyContent: 'center' }}>The Process</div>
        <h2 className="con-section-title" style={{ textAlign: 'center', marginBottom: 60 }}>
          From enquiry to<br /><em>measurable results.</em>
        </h2>
        <div className="con-how-track">
          {[
            { n: '01', icon: '📋', title: 'Submit Enquiry', desc: 'Tell us your challenge. We respond within 2 business days.' },
            { n: '02', icon: '📞', title: 'Scoping Call', desc: '60-minute session with a specialist to define scope and goals.' },
            { n: '03', icon: '📄', title: 'Proposal Delivered', desc: 'Tailored proposal with clear deliverables, timeline and fee.' },
            { n: '04', icon: '🤝', title: 'Engagement Signed', desc: 'Work begins. Your dedicated consultant is assigned.' },
            { n: '05', icon: '🔬', title: 'Discovery & Delivery', desc: 'On-site or remote engagement. All stages tracked on platform.' },
            { n: '06', icon: '🏆', title: 'Results Delivered', desc: 'Measurable outcomes. Optional follow-up programme available.' },
          ].map((step, i) => (
            <div key={step.n} className="con-how-step">
              <div className="con-how-step__num">{step.n}</div>
              <div className="con-how-step__icon">{step.icon}</div>
              <div className="con-how-step__title">{step.title}</div>
              <div className="con-how-step__desc">{step.desc}</div>
              {i < 5 && <div className="con-how-step__arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── ENQUIRY MODAL ── */}
      {modalSvc && (
        <div className="con-modal-overlay" onClick={() => setModalSvc(null)}>
          <div className="con-modal" style={{ '--svc-color': modalSvc.colour }} onClick={e => e.stopPropagation()}>
            <button className="con-modal__close" onClick={() => setModalSvc(null)}>✕</button>

            <div className="con-modal__svc-head">
              <span className="con-modal__icon">{modalSvc.icon}</span>
              <div>
                <div className="con-modal__cat">{modalSvc.category}</div>
                <h2 className="con-modal__name">{modalSvc.name}</h2>
                <p className="con-modal__tagline">{modalSvc.tagline}</p>
              </div>
            </div>

            <div className="con-modal__deliverables">
              <div className="con-modal__sub">What you receive:</div>
              <div className="con-modal__deliv-grid">
                {modalSvc.deliverables.map(d => (
                  <div key={d} className="con-modal__deliv-item">
                    <span style={{ color: modalSvc.colour }}>✓</span> {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="con-modal__outcomes">
              <div className="con-modal__sub">Proven outcomes:</div>
              {modalSvc.outcomes.map(o => (
                <div key={o} className="con-modal__outcome-item">
                  <span>→</span> {o}
                </div>
              ))}
            </div>

            <div className="con-modal__form">
              <div className="con-modal__sub">Tell us about your business:</div>

              <div className="con-form-row">
                <div className="con-form-group">
                  <label className="con-label">Company Size</label>
                  <select
                    className="con-select"
                    value={inquiryForm.companySize}
                    onChange={e => setInquiryForm(f => ({ ...f, companySize: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    <option value="1-10">1–10 employees</option>
                    <option value="11-50">11–50 employees</option>
                    <option value="51-200">51–200 employees</option>
                    <option value="201-500">201–500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
                <div className="con-form-group">
                  <label className="con-label">Industry / Sector</label>
                  <input
                    className="con-input"
                    placeholder="e.g. Aerospace, Automotive…"
                    value={inquiryForm.industry}
                    onChange={e => setInquiryForm(f => ({ ...f, industry: e.target.value }))}
                  />
                </div>
              </div>

              <div className="con-form-group">
                <label className="con-label">What specific challenge are you facing?</label>
                <textarea
                  className="con-textarea"
                  rows={4}
                  placeholder="Describe your current situation and what you're hoping to achieve…"
                  value={inquiryForm.scopeNotes}
                  onChange={e => setInquiryForm(f => ({ ...f, scopeNotes: e.target.value }))}
                />
              </div>
            </div>

            <div className="con-modal__footer">
              <div className="con-modal__fee">
                Starting from <strong style={{ color: modalSvc.colour }}>€ {modalSvc.startingFee.toLocaleString()}</strong>
                <span> · {modalSvc.duration}</span>
              </div>
              <button
                className="con-btn-primary"
                onClick={() => handleInquire(modalSvc)}
                disabled={inquiring === modalSvc.id}
              >
                {inquiring === modalSvc.id ? 'Submitting…' : 'Submit Enquiry →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
