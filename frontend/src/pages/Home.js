import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const STATS = [
  { value: '1200+', label: 'Verified Suppliers', icon: '🏅', color: '#c9a84c' },
  { value: '12400+', label: 'Products Listed', icon: '📦', color: '#7dd3fc' },
  { value: '340+', label: 'Certifications Done', icon: '📋', color: '#86efac' },
  { value: '48+', label: 'EU Markets Active', icon: '🌍', color: '#c4b5fd' },
];

const CATEGORIES = [
  { name: 'Industrial Motors', slug: 'motors', icon: '⚙', count: '2,400+', desc: 'AC/DC · Servo · Stepper' },
  { name: 'Semiconductors', slug: 'semiconductors', icon: '💡', count: '4,800+', desc: 'ICs · MOSFETs · MCUs' },
  { name: 'Defence Grade', slug: 'defence', icon: '🛡', count: '680+', desc: 'MIL-SPEC · ATEX · CE', restricted: true },
  { name: 'Electronics', slug: 'electronics', icon: '🔌', count: '3,200+', desc: 'PCBs · RF · Sensors' },
  { name: 'Mechanical', slug: 'mechanical', icon: '🔩', count: '1,900+', desc: 'Bearings · Gears · Shafts' },
  { name: 'Automation', slug: 'other', icon: '🏭', count: '2,100+', desc: 'PLCs · HMIs · Drives' },
];

const FEATURES = [
  { icon: '🤝', title: 'Real-Time Deal Board', desc: 'Structured B2B proposals from verified suppliers — claim, negotiate, close. All documented.' },
  { icon: '🏅', title: 'Certification Services', desc: 'ISO · CE · ATEX · MIL-SPEC. Full document preparation and audit management.' },
  { icon: '🧠', title: 'AI Matching Engine', desc: 'Proprietary recommendation system learns your profile and surfaces ideal deals before you search.' },
  { icon: '⚖', title: 'Compliance by Default', desc: 'GDPR compliant. GST/VAT invoicing. LkSG due diligence. Every trade legally protected.' },
  { icon: '📊', title: 'Business Intelligence', desc: 'Live P&L dashboards, revenue charts, and inventory reports for every stakeholder.' },
  { icon: '🌍', title: 'Pan-European Network', desc: '14 EU markets. Integrated logistics, customs brokerage, and supplier support.' },
];

const TESTIMONIALS = [
  { quote: 'We reduced procurement cycle from 6 weeks to 4 days. Supplier verification alone replaced three due-diligence agencies.', name: 'Lars Becker', role: 'CPO · Becker Automation AG', flag: '🇩🇪' },
  { quote: 'The CE certification support was exceptional — documentation, lab coordination, notified body liaison, all handled.', name: 'Isabelle Martin', role: 'Supply Chain Director · Groupe Renault', flag: '🇫🇷' },
  { quote: 'As a Polish manufacturer entering Western Europe, IndustrialHub gave us credibility and buyers we could never reach alone.', name: 'Tomasz Wiśniewski', role: 'CEO · PrecisionWorks Sp. z o.o.', flag: '🇵🇱' },
];

const TICKER = [
  '⚙ Siemens Motor 7.5kW · Available Now',
  '💡 STM32 Microcontrollers · Batch Order Open',
  '🛡 ATEX Capacitors · Verified Stock',
  '🔩 SKF Bearings · Bulk Pricing Active',
  '🏭 ABB VFD 15kW · Deal Proposed',
];

function Counter({ target }) {
  const [val, setVal] = useState(0);
  const ref = useRef(); const ran = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        const n = parseInt(target.replace(/\D/g, ''));
        if (!n) return;
        const step = n / (1400 / 16);
        let cur = 0;
        const iv = setInterval(() => {
          cur = Math.min(cur + step, n);
          setVal(Math.round(cur));
          if (cur >= n) clearInterval(iv);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  const suffix = target.includes('+') ? '+' : '';
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const { user } = useAuth();
  const [tickerIdx, setTickerIdx] = useState(0);
  const [testiIdx, setTestiIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER.length), 3200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTestiIdx(i => (i + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="home-eu">

      {/* TICKER */}
      <div className="eu-ticker">
        <span className="eu-ticker__label">LIVE</span>
        <div className="eu-ticker__track">
          {TICKER.map((item, i) => (
            <span key={i} className={`eu-ticker__item ${i === tickerIdx ? 'active' : i === (tickerIdx - 1 + TICKER.length) % TICKER.length ? 'exit' : 'hidden'}`}>
              {item}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span className="eu-live-dot" />
          <span style={{ fontSize: 10, color: '#86efac', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Market Open</span>
        </div>
      </div>

      {/* HERO */}
      <section className="eu-hero">
        <div className="eu-hero__bg">
          <div className="eu-hero__grid" />
          <div className="eu-hero__glow-a" />
          <div className="eu-hero__glow-b" />
        </div>
        <div className="eu-hero__body">
          <div className="eu-hero__left">
            <div className="eu-eyebrow eu-anim-up">🇪🇺 &nbsp; Europe's Premier Industrial Marketplace</div>
            <h1 className="eu-hero__title eu-anim-up eu-d1">
              Where Industry<br/>
              <em>Meets Commerce.</em>
            </h1>
            <p className="eu-hero__desc eu-anim-up eu-d2">
              1,200+ verified manufacturers. Real-time TradeConnects. ISO/CE certification support built in. GDPR compliant by design. The platform European industry was waiting for.
            </p>
            <div className="eu-hero__checks eu-anim-up eu-d3">
              {['ISO · CE · ATEX Certified Suppliers', 'GDPR Compliant by Default', 'Real-Time TradeConnect Board', 'Defence Procurement Ready'].map(c => (
                <div key={c} className="eu-hero__check"><span>✓</span> {c}</div>
              ))}
            </div>
            <div className="eu-hero__ctas eu-anim-up eu-d4">
              {user ? (
                <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'supplier' ? '/supplier/dashboard' : '/dashboard'} className="eu-gold-btn">Open Dashboard →</Link>
              ) : (
                <>
                  <Link to="/register" className="eu-gold-btn">Join Free →</Link>
                  <Link to="/services" className="eu-ghost-btn">Our Services</Link>
                </>
              )}
            </div>
            <div className="eu-hero__trust eu-anim-up eu-d5">
              <span className="eu-hero__trust-label">Trusted by</span>
              {['Siemens', 'BASF', 'Renault', 'ABB', 'SKF', 'Bosch'].map(c => (
                <span key={c} className="eu-hero__trust-chip">{c}</span>
              ))}
            </div>
          </div>

          <div className="eu-hero__right eu-anim-up eu-d2">
            <div className="eu-dash-card">
              <div className="eu-dash-card__header">
                <span>Platform Intelligence</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="eu-live-dot" />
                  <span style={{ fontSize: 10, color: '#86efac', fontWeight: 700 }}>LIVE</span>
                </div>
              </div>
              <div className="eu-dash-metrics">
                {STATS.map((s, i) => (
                  <div key={s.label} className="eu-dash-metric" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                    <div className="eu-dash-metric__icon">{s.icon}</div>
                    <div className="eu-dash-metric__val" style={{ color: s.color }}><Counter target={s.value} /></div>
                    <div className="eu-dash-metric__label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="eu-dash-chart">
                <div className="eu-dash-chart__label">Monthly Revenue (€M)</div>
                <div className="eu-dash-bars">
                  {[35,52,41,68,55,80,65,90,72,85,60,100].map((h,i)=>(
                    <div key={i} className="eu-dash-bar" style={{ height: `${h}%`, animationDelay: `${0.6 + i*0.06}s` }} />
                  ))}
                </div>
              </div>
              <div className="eu-dash-deals">
                <div className="eu-dash-deals__title">Live Deals</div>
                {[
                  { name: 'Motor Bulk Contract', val: '€ 4.2M', c: 'completed' },
                  { name: 'Semiconductor Supply', val: '€ 1.8M', c: 'negotiating' },
                  { name: 'ATEX Components', val: '€ 12M', c: 'proposed' },
                ].map(d => (
                  <div key={d.name} className="eu-dash-deal-row">
                    <span>{d.name}</span>
                    <span style={{ fontWeight: 700 }}>{d.val}</span>
                    <span className={`eu-deal-status eu-deal-${d.c}`}>{d.c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="eu-float-notif">
              <span>🤝</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#e8e8e2' }}>Deal Signed</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>€ 8.4M · Motors · Frankfurt</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <div className="eu-stats-band">
        {STATS.map((s,i) => (
          <div key={s.label} className={`eu-stat eu-anim-up eu-d${i+1}`}>
            <div className="eu-stat__val" style={{ color: s.color }}><Counter target={s.value} /></div>
            <div className="eu-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <section className="eu-cats-section">
        <div className="eu-sec-head">
          <div>
            <div className="eu-eyebrow">Browse Catalogue</div>
            <h2 className="eu-section-h2">Every component.<br/><em>One platform.</em></h2>
          </div>
          <Link to="/products" className="eu-ghost-btn">Browse All →</Link>
        </div>
        <div className="eu-cats-grid">
          {CATEGORIES.map((cat,i) => (
            <Link key={cat.name} to={`/products?category=${cat.slug}`} className={`eu-cat-card eu-anim-up eu-d${(i%3)+1}`}>
              <div className="eu-cat-card__top">
                <span className="eu-cat-card__icon">{cat.icon}</span>
                {cat.restricted && <span className="eu-restricted-badge">🔒 Restricted</span>}
              </div>
              <div className="eu-cat-card__name">{cat.name}</div>
              <div className="eu-cat-card__desc">{cat.desc}</div>
              <div className="eu-cat-card__count">{cat.count}</div>
              <span className="eu-cat-card__arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="eu-features-section">
        <div className="eu-sec-head">
          <div>
            <div className="eu-eyebrow">Platform Capabilities</div>
            <h2 className="eu-section-h2">Engineering-grade<br/><em>industrial commerce.</em></h2>
          </div>
        </div>
        <div className="eu-features-grid">
          {FEATURES.map((f,i) => (
            <div key={f.title} className={`eu-feature-card eu-anim-up eu-d${(i%3)+1}`}>
              <div className="eu-feature-card__icon">{f.icon}</div>
              <h3 className="eu-feature-card__title">{f.title}</h3>
              <p className="eu-feature-card__desc">{f.desc}</p>
              <Link to="/services" className="eu-feature-card__link">Learn more →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="eu-testi-section">
        <div className="eu-eyebrow" style={{ marginBottom: 16 }}>Client Voices</div>
        <h2 className="eu-section-h2" style={{ marginBottom: 56 }}>Trusted across<br/><em>European industry.</em></h2>
        <div className="eu-testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`eu-testi-card ${i === testiIdx ? 'eu-testi-active' : ''}`} onClick={() => setTestiIdx(i)}>
              <div className="eu-testi-card__quote">"{t.quote}"</div>
              <div className="eu-testi-card__attr">
                <div className="eu-testi-card__avatar">{t.flag}</div>
                <div>
                  <div className="eu-testi-card__name">{t.name}</div>
                  <div className="eu-testi-card__role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES TEASER */}
      <section className="eu-svc-teaser">
        <div className="eu-svc-teaser__inner">
          <div className="eu-svc-teaser__text">
            <div className="eu-eyebrow">Beyond the Marketplace</div>
            <h2 className="eu-section-h2" style={{ fontSize: 'clamp(36px,4.5vw,58px)' }}>Need certification?<br/><em>We handle it.</em></h2>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.85, marginTop: 20, marginBottom: 36, maxWidth: 480 }}>
              ISO 9001 · CE marking · ATEX · MIL-SPEC. We prepare documentation, coordinate audits, and ensure full European market access. Business model design, compliance advisory, and trade finance also available.
            </p>
            <Link to="/services" className="eu-gold-btn">Explore All Services →</Link>
          </div>
          <div className="eu-svc-teaser__cards">
            {[
              { icon: '🏅', title: 'ISO / CE Certification', desc: 'Full doc & audit management' },
              { icon: '🏛', title: 'Business Model Design', desc: '40+ models deployed across EU' },
              { icon: '⚖', title: 'Compliance Advisory', desc: 'GDPR · LkSG · Export Control' },
              { icon: '💳', title: 'Trade Finance', desc: 'LC · Factoring · Up to €5M credit' },
            ].map(s => (
              <Link to="/services" key={s.title} className="eu-svc-mini-card">
                <span className="eu-svc-mini-card__icon">{s.icon}</span>
                <div>
                  <div className="eu-svc-mini-card__title">{s.title}</div>
                  <div className="eu-svc-mini-card__desc">{s.desc}</div>
                </div>
                <span className="eu-svc-mini-card__arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      {!user && (
        <section className="eu-final-cta">
          <div className="eu-final-cta__glow" />
          <div className="eu-final-cta__inner">
            <div className="eu-eyebrow" style={{ justifyContent: 'center' }}>Ready to Begin?</div>
            <h2 className="eu-final-cta__title">Join 1,200+ suppliers<br/>and thousands of buyers.</h2>
            <p style={{ fontSize: 15, color: '#6b7280', marginTop: 14, marginBottom: 40 }}>Free to register. 2% platform fee on completed transactions only.</p>
            <div className="eu-final-cta__actions">
              <Link to="/register?role=customer" className="eu-gold-btn" style={{ padding: '16px 40px' }}>Register as Buyer →</Link>
              <Link to="/register?role=supplier" className="eu-ghost-btn" style={{ padding: '15px 40px' }}>Register as Supplier</Link>
            </div>
            <div className="eu-final-cta__certs">
              {['🇪🇺 GDPR Compliant','🔒 SSL Secured','🏅 ISO 27001','⚖ EU Law Compliant'].map(c=>(
                <span key={c} className="eu-final-cta__cert">{c}</span>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
