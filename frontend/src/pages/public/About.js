import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const TEAM = [
  {
    name: 'Klaus Hartmann',
    role: 'Chief Executive Officer',
    location: 'Frankfurt, Germany',
    bio: 'Former Siemens VP with 22 years in industrial supply chain. Founded IndustrialHub to digitise what he saw failing — fragmented TradeConnect procurement across Europe.',
    avatar: 'KH',
    color: '#c9a84c',
    linkedin: '#',
  },
  {
    name: 'Sophie Delacroix',
    role: 'Chief Operating Officer',
    location: 'Paris, France',
    bio: 'Ex-Airbus procurement director. Built the supplier verification framework and compliance engine now protecting 1,200+ supply relationships.',
    avatar: 'SD',
    color: '#7dd3fc',
    linkedin: '#',
  },
  {
    name: 'Pieter van der Berg',
    role: 'Chief Technology Officer',
    location: 'Amsterdam, Netherlands',
    bio: 'Former Philips R&D lead and startup CTO. Architected the AI matching engine and real-time deal infrastructure serving 40,000+ monthly users.',
    avatar: 'PB',
    color: '#86efac',
    linkedin: '#',
  },
  {
    name: 'Dr. Aditi Sharma',
    role: 'Head of Compliance',
    location: 'Vienna, Austria',
    bio: 'LLM from Vienna Law School. Specialist in EU commercial law, GDPR, and cross-border trade compliance. Author of our supplier due diligence framework.',
    avatar: 'AS',
    color: '#f9a8d4',
    linkedin: '#',
  },
  {
    name: 'Marco Bianchi',
    role: 'Head of Marketplace',
    location: 'Milan, Italy',
    bio: '15 years in Italian industrial manufacturing. Built the product taxonomy covering 18 categories and standardised specifications for 12,000+ SKUs.',
    avatar: 'MB',
    color: '#c4b5fd',
    linkedin: '#',
  },
  {
    name: 'Aleksandra Nowak',
    role: 'Head of Growth',
    location: 'Warsaw, Poland',
    bio: 'Led TradeConnect growth at two unicorns before joining IndustrialHub. Responsible for the supplier onboarding programme that reduced time-to-first-deal to 11 days.',
    avatar: 'AN',
    color: '#fca5a5',
    linkedin: '#',
  },
];

const TIMELINE = [
  { year: '2019', title: 'Founded in Frankfurt', desc: 'Klaus Hartmann and three co-founders register IndustrialHub GmbH. Seed round of €1.8M closed in Q3.' },
  { year: '2020', title: 'First 100 Suppliers', desc: 'Platform launches with 100 verified German and Austrian manufacturers. First TradeConnect closed: €240K motor procurement contract.' },
  { year: '2021', title: 'Series A · €12M', desc: 'Expansion into France, Italy, Poland, and Netherlands. Compliance engine launched. 18,000 products listed.' },
  { year: '2022', title: 'CE Certification Services', desc: 'Full certification advisory service launched. ATEX and MIL-SPEC capabilities added. 400+ certifications completed.' },
  { year: '2023', title: 'AI Matching Engine', desc: 'Proprietary recommendation engine deployed. Average deal discovery time drops from 14 days to 48 hours.' },
  { year: '2024', title: 'Series B · €38M', desc: 'Pan-European expansion to 14 countries. Trade finance partnership launched. 1,200+ verified suppliers.' },
  { year: '2025', title: 'Defence Procurement', desc: 'MIL-SPEC certified supplier network launched. First €5M+ defence component contract brokered on platform.' },
];

const VALUES = [
  { icon: '⚖', title: 'Integrity First', desc: 'Every supplier is verified. Every deal is documented. We hold all parties to the same European standard of commercial conduct.' },
  { icon: '🔬', title: 'Precision Engineering', desc: 'We approach platform design the way engineers approach product design — with obsessive attention to tolerance, reliability, and failure modes.' },
  { icon: '🇪🇺', title: 'European by Design', desc: 'GDPR compliant by default. CE marked where applicable. Designed for the complexity of 27 legal systems and 24 official languages.' },
  { icon: '🌱', title: 'Sustainable Trade', desc: 'ESG reporting integrated into every supplier profile. We help buyers source from manufacturers with verified environmental credentials.' },
];

const NUMBERS = [
  { val: '€ 1.2B+', label: 'Total GMV', sub: 'since 2019' },
  { val: '1,200+', label: 'Verified Suppliers', sub: 'across 14 countries' },
  { val: '14', label: 'European Markets', sub: 'active presence' },
  { val: '400+', label: 'Certifications', sub: 'completed' },
  { val: '48 hrs', label: 'Avg. Deal Discovery', sub: 'with AI matching' },
  { val: '99.4%', label: 'Compliance Rate', sub: 'supplier audits' },
];

const OFFICES = [
  { city: 'Frankfurt', country: 'Germany', type: 'Headquarters', address: 'Bockenheimer Landstraße 24, 60323' },
  { city: 'Paris', country: 'France', type: 'Operations', address: '47 Rue de la Paix, 75002' },
  { city: 'Amsterdam', country: 'Netherlands', type: 'Technology', address: 'Herengracht 124, 1015 BT' },
  { city: 'Warsaw', country: 'Poland', type: 'Eastern Europe Hub', address: 'ul. Marszałkowska 80, 00-517' },
];

export default function About() {
  return (
    <div className="about-page">

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero__bg">
          <div className="about-hero__grid" />
          <div className="about-hero__glow" />
        </div>
        <div className="eu-section about-hero__content">
          <div className="eu-eyebrow eu-anim-up">About IndustrialHub</div>
          <h1 className="eu-display-title eu-anim-up eu-d1">
            Built in Europe.<br />
            <em>Built for industry.</em>
          </h1>
          <p className="eu-lead eu-anim-up eu-d2" style={{ maxWidth: 700 }}>
            We are a Frankfurt-based industrial commerce platform — founded by engineers and operators who lived through the fragmentation of European TradeConnect procurement and decided to fix it.
          </p>
          <div className="about-hero__ctas eu-anim-up eu-d3">
            <Link to="/register" className="eu-gold-btn">Join the Platform →</Link>
            <Link to="/services" className="eu-ghost-btn">Our Services</Link>
          </div>

          <div className="about-hero__numbers eu-anim-up eu-d4">
            {NUMBERS.map(n => (
              <div key={n.label} className="about-hero__num">
                <div className="about-hero__num-val">{n.val}</div>
                <div className="about-hero__num-label">{n.label}</div>
                <div className="about-hero__num-sub">{n.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="about-mission">
        <div className="eu-section about-mission__inner">
          <div className="about-mission__left">
            <div className="eu-eyebrow">Our Mission</div>
            <h2 className="about-h2">
              The infrastructure<br />
              Europe's industry<br />
              <em>deserves.</em>
            </h2>
          </div>
          <div className="about-mission__right">
            <p className="about-body-lg">
              European industrial trade is worth over €4 trillion annually — yet most of it still runs on email threads, PDF quotations, and handshake agreements that take months to close.
            </p>
            <p className="about-body">
              IndustrialHub was built to change that. We bring the rigour of European engineering to the commercial layer of trade: verified identities, standardised specifications, structured deal flows, and integrated compliance — all in one platform.
            </p>
            <p className="about-body">
              We don't just connect buyers and sellers. We ensure every connection meets the legal, quality, and ethical standards that European commerce demands.
            </p>
            <div className="about-mission__quote">
              <span className="about-mission__qmark">"</span>
              <blockquote>
                We built the platform we wished existed when we were running procurement at Siemens. Rigorous. Transparent. Built for scale.
              </blockquote>
              <div className="about-mission__attr">— Klaus Hartmann, CEO & Co-founder</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="about-values">
        <div className="eu-section">
          <div className="about-values__head">
            <div className="eu-eyebrow">What We Believe</div>
            <h2 className="about-h2" style={{ maxWidth: 500 }}>Four principles. <em>Non-negotiable.</em></h2>
          </div>
          <div className="about-values__grid">
            {VALUES.map((v, i) => (
              <div key={v.title} className={`about-value-card eu-card eu-anim-up eu-d${i + 1}`}>
                <div className="about-value-card__icon">{v.icon}</div>
                <h3 className="about-value-card__title">{v.title}</h3>
                <p className="about-value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="about-timeline-section">
        <div className="eu-section">
          <div className="about-timeline__head">
            <div className="eu-eyebrow">Our Journey</div>
            <h2 className="about-h2"><em>Six years.</em> One mission.</h2>
          </div>
          <div className="about-timeline">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className={`about-tl-item eu-anim-up eu-d${(i % 4) + 1}`}>
                <div className="about-tl-year">{t.year}</div>
                <div className="about-tl-dot" />
                <div className="about-tl-body">
                  <div className="about-tl-title">{t.title}</div>
                  <div className="about-tl-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="about-team-section">
        <div className="eu-section">
          <div className="about-team-head">
            <div>
              <div className="eu-eyebrow">Leadership</div>
              <h2 className="about-h2">The people<br /><em>behind the platform.</em></h2>
            </div>
            <p style={{ maxWidth: 360, fontSize: 14, color: 'var(--eu-muted)', lineHeight: 1.8 }}>
              A team of operators, engineers, and lawyers who have built and run industrial businesses across Europe.
            </p>
          </div>

          <div className="about-team-grid">
            {TEAM.map((m, i) => (
              <div key={m.name} className={`about-team-card eu-card eu-anim-up eu-d${(i % 3) + 1}`}>
                <div className="about-team-card__avatar" style={{ background: m.color + '22', color: m.color, border: `1px solid ${m.color}44` }}>
                  {m.avatar}
                </div>
                <div className="about-team-card__info">
                  <div className="about-team-card__name">{m.name}</div>
                  <div className="about-team-card__role">{m.role}</div>
                  <div className="about-team-card__location">📍 {m.location}</div>
                  <p className="about-team-card__bio">{m.bio}</p>
                  <a href={m.linkedin} className="about-team-card__li">LinkedIn →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFICES ── */}
      <section className="about-offices-section">
        <div className="eu-section">
          <div className="eu-eyebrow">Our Offices</div>
          <h2 className="about-h2" style={{ marginBottom: 48 }}>Present across<br /><em>14 European markets.</em></h2>
          <div className="about-offices-grid">
            {OFFICES.map((o, i) => (
              <div key={o.city} className={`about-office-card eu-card eu-anim-up eu-d${i + 1}`}>
                <div className="about-office-type">{o.type}</div>
                <div className="about-office-city">{o.city}</div>
                <div className="about-office-country">{o.country}</div>
                <div className="about-office-addr">{o.address}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAREERS CTA ── */}
      <section className="about-cta-section">
        <div className="eu-section about-cta-inner">
          <div className="about-cta-content">
            <div className="eu-eyebrow">Join the Team</div>
            <h2 className="about-h2">Building something<br /><em>worth building.</em></h2>
            <p style={{ fontSize: 15, color: 'var(--eu-muted)', lineHeight: 1.8, marginTop: 16, maxWidth: 520 }}>
              We're hiring across engineering, compliance, growth, and product. Remote-first with offices in Frankfurt, Paris, and Amsterdam. Equity from day one.
            </p>
          </div>
          <div className="about-cta-actions">
            <Link to="/register" className="eu-gold-btn" style={{ marginBottom: 14, justifyContent: 'center' }}>
              Join as Supplier / Buyer →
            </Link>
            <a href="mailto:careers@industrialhub.eu" className="eu-ghost-btn" style={{ justifyContent: 'center' }}>
              careers@industrialhub.eu
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
