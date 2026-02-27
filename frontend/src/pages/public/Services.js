import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

const SERVICES = [
  {
    id: 'certification',
    icon: '🏅',
    tag: 'Quality Assurance',
    title: 'Industrial Certification',
    subtitle: 'We handle it. You focus on business.',
    desc: 'From ISO to CE marking, our certified partner network guides your products through every European regulatory requirement. We prepare documentation, coordinate audits, and ensure full market access.',
    features: [
      'ISO 9001:2015 Quality Management',
      'ISO 14001 Environmental Systems',
      'CE Marking for EU Market Access',
      'ATEX Certification for Explosive Atmospheres',
      'MIL-SPEC for Defence Grade Components',
      'RoHS & REACH Compliance',
      'IECEx for Explosive Gas Environments',
      'UKCA Post-Brexit Certification',
    ],
    highlight: '€ 2,400 — Average savings vs. independent certification',
    cta: 'Request Certification Consultation',
    accent: 'var(--eu-gold)',
  },
  {
    id: 'business-models',
    icon: '🏛',
    tag: 'Commercial Strategy',
    title: 'Business Model Design',
    subtitle: 'Structure that survives scale.',
    desc: 'Our commercial strategists help suppliers and buyers design revenue frameworks built for European TradeConnect markets — from distribution contracts to platform-native deal structures and joint ventures.',
    features: [
      'TradeConnect Distribution Framework Design',
      'OEM & White-Label Agreements',
      'Revenue Share & Commission Models',
      'Subscription Procurement Contracts',
      'Joint Venture Structuring',
      'Reseller Network Architecture',
      'Framework Agreement Templates',
      'Incoterms & Trade Term Advisory',
    ],
    highlight: '40+ business models deployed across 12 European markets',
    cta: 'Book a Strategy Session',
    accent: '#7dd3fc',
  },
  {
    id: 'compliance',
    icon: '⚖',
    tag: 'Regulatory',
    title: 'Compliance & Due Diligence',
    subtitle: 'European standards. Zero compromise.',
    desc: 'Operate with confidence across all EU member states. Our compliance team handles GDPR, supply chain due diligence (LkSG), anti-corruption screening, and customs classification for every trade.',
    features: [
      'GDPR Data Processing Assessments',
      'German Supply Chain Act (LkSG)',
      'Anti-Money Laundering Screening',
      'Sanctions & Embargo Checks',
      'Customs Classification (HS Codes)',
      'Export Control Advisory (ITAR/EAR)',
      'Corporate Beneficial Owner Verification',
      'ESG & Sustainability Reporting',
    ],
    highlight: '99.4% compliance rate across 3,200+ verified suppliers',
    cta: 'Start Compliance Review',
    accent: '#86efac',
  },
  {
    id: 'trade-finance',
    icon: '💳',
    tag: 'Financial Services',
    title: 'Trade Finance & Insurance',
    subtitle: 'Capital that moves with your deals.',
    desc: 'We partner with leading European banks and insurers to provide Letters of Credit, payment guarantees, cargo insurance, and invoice factoring — all integrated directly into your deal flow.',
    features: [
      'Letter of Credit (LC) Facilitation',
      'Bank Payment Obligation (BPO)',
      'Export Credit Insurance',
      'Invoice Factoring & Discounting',
      'Cargo & Marine Insurance',
      'FX Hedging Advisory',
      'Supply Chain Finance Programs',
      'Payment Escrow Services',
    ],
    highlight: 'Up to €5M credit lines available for verified platform members',
    cta: 'Explore Financing Options',
    accent: '#f9a8d4',
  },
  {
    id: 'logistics',
    icon: '🚢',
    tag: 'Supply Chain',
    title: 'Logistics & Trade Services',
    subtitle: 'Pan-European. Predictable. Paperless.',
    desc: 'Full-service freight forwarding, customs brokerage, and last-mile delivery across 28 EU member states and 14 additional European markets. Integrated tracking on every shipment.',
    features: [
      'Multimodal Freight (Sea / Air / Rail)',
      'Intra-EU Customs Brokerage',
      'Pan-European Last Mile Delivery',
      'Bonded Warehouse Network',
      'Dangerous Goods Handling (ADR)',
      'Cold Chain for Sensitive Components',
      'Real-Time Shipment Tracking',
      'Reverse Logistics Management',
    ],
    highlight: '48-hour average clearance time across all EU ports',
    cta: 'Get Logistics Quote',
    accent: '#c4b5fd',
  },
  {
    id: 'consulting',
    icon: '🎯',
    tag: 'Advisory',
    title: 'Market Entry Consulting',
    subtitle: 'Enter Europe the right way.',
    desc: 'Detailed market intelligence, competitor mapping, regulatory landscape analysis, and go-to-market roadmaps for manufacturers entering the European industrial market for the first time.',
    features: [
      'European Market Sizing & Analysis',
      'Competitor Intelligence Reports',
      'Channel Partner Identification',
      'Regulatory Roadmap by Country',
      'Pricing Strategy Advisory',
      'Trade Show & Exhibition Planning',
      'Local Entity Setup Guidance',
      'IP & Patent Protection Advice',
    ],
    highlight: 'Average time-to-market reduced by 7 months for our clients',
    cta: 'Schedule a Discovery Call',
    accent: '#fca5a5',
  },
];

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
  { step: '01', title: 'Initial Assessment', desc: 'We review your product, target markets, and regulatory requirements within 48 hours.' },
  { step: '02', title: 'Roadmap Delivery', desc: 'A tailored compliance and certification roadmap with timelines, costs, and responsibilities.' },
  { step: '03', title: 'Execution & Audit', desc: 'Our certified partners manage the full process — documents, lab tests, audits.' },
  { step: '04', title: 'Certificate Issuance', desc: 'Certificates delivered digitally and physically. Valid across all target markets.' },
];

const PRICING = [
  {
    name: 'Starter',
    price: '€ 990',
    period: 'one-time',
    desc: 'For single-product certification with standard timeline.',
    features: ['1 certification pathway', 'Document preparation', 'Basic compliance check', '60-day turnaround', 'Email support'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '€ 3,200',
    period: 'per quarter',
    desc: 'For growing suppliers with multiple product lines.',
    features: ['Up to 8 certifications', 'Full business model review', 'GDPR compliance audit', 'Trade finance intro', 'Priority support', 'Monthly advisory call'],
    cta: 'Most Popular',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'annual contract',
    desc: 'For manufacturers entering multiple European markets.',
    features: ['Unlimited certifications', 'Dedicated compliance manager', 'Full market entry program', 'Trade finance up to €5M', 'Legal entity setup', '24/7 SLA support'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function Services() {
  const [activeService, setActiveService] = useState(0);

  return (
    <div className="svc-page">

      {/* ── HERO ── */}
      <section className="svc-hero">
        <div className="svc-hero__bg">
          <div className="svc-hero__grid" />
          <div className="svc-hero__glow-left" />
          <div className="svc-hero__glow-right" />
        </div>
        <div className="eu-section svc-hero__content">
          <div className="eu-eyebrow eu-anim-up">Our Services</div>
          <h1 className="eu-display-title eu-anim-up eu-d1">
            Built for European<br />
            <em>Industrial Commerce.</em>
          </h1>
          <p className="eu-lead eu-anim-up eu-d2">
            From ISO certification to market-entry consulting — we provide every service a manufacturer or buyer needs to trade confidently across Europe.
          </p>
          <div className="svc-hero__ctas eu-anim-up eu-d3">
            <Link to="/register" className="eu-gold-btn">Start Free Today →</Link>
            <Link to="/about" className="eu-ghost-btn">Learn About Us</Link>
          </div>

          {/* Cert strip */}
          <div className="svc-cert-strip eu-anim-up eu-d4">
            {CERT_LOGOS.map(c => (
              <div key={c.name} className="svc-cert-item">
                <span className="svc-cert-icon">{c.icon}</span>
                <span className="svc-cert-name">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="svc-section">
        <div className="eu-section">
          <div className="svc-section-head">
            <div className="eu-eyebrow">What We Do</div>
            <h2 className="svc-section-title">
              Six pillars of<br /><em>industrial excellence.</em>
            </h2>
          </div>

          <div className="svc-grid">
            {SERVICES.map((s, i) => (
              <div
                key={s.id}
                className={`svc-card eu-card eu-anim-up eu-d${(i % 3) + 1}`}
                style={{ '--card-accent': s.accent }}
              >
                <div className="svc-card__icon">{s.icon}</div>
                <div className="svc-card__tag">{s.tag}</div>
                <h3 className="svc-card__title">{s.title}</h3>
                <p className="svc-card__subtitle">{s.subtitle}</p>
                <p className="svc-card__desc">{s.desc}</p>
                <ul className="svc-card__features">
                  {s.features.slice(0, 4).map(f => (
                    <li key={f}><span>✓</span> {f}</li>
                  ))}
                </ul>
                <div className="svc-card__highlight">
                  <span>→</span> {s.highlight}
                </div>
                <Link to="/register" className="svc-card__cta">{s.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                Navigating European certification is complex. We simplify it — preparing all documentation, liaising with notified bodies, and managing the full audit process on your behalf.
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

      {/* ── BUSINESS MODELS ── */}
      <section className="svc-bm-section">
        <div className="eu-section">
          <div className="svc-bm-inner">
            <div className="svc-bm-left">
              <div className="eu-eyebrow">Business Architecture</div>
              <h2 className="svc-section-title" style={{ fontSize: 'clamp(36px,5vw,60px)' }}>
                The right business<br /><em>model changes everything.</em>
              </h2>
              <p className="eu-lead" style={{ marginTop: 20, marginBottom: 36 }}>
                Choosing the wrong commercial structure costs years. Our strategists have designed and deployed 40+ TradeConnect business models across European industrial markets — from distribution frameworks to platform-native revenue share contracts.
              </p>
              {[
                { label: 'OEM & White Label', desc: "Manufacture under buyer's brand with legal protections built in." },                { label: 'Joint Venture Frameworks', desc: 'Shared risk, shared reward — properly structured.' },
                { label: 'Reseller Network Design', desc: 'Recruit, tier, and incentivise distribution partners.' },
              ].map(m => (
                <div key={m.label} className="svc-bm-model">
                  <div className="svc-bm-model__dot" />
                  <div>
                    <div className="svc-bm-model__label">{m.label}</div>
                    <div className="svc-bm-model__desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="svc-bm-right">
              <div className="svc-bm-visual">
                <div className="svc-bm-stat">
                  <div className="svc-bm-stat__num">40+</div>
                  <div className="svc-bm-stat__label">Models Deployed</div>
                </div>
                <div className="svc-bm-stat">
                  <div className="svc-bm-stat__num">12</div>
                  <div className="svc-bm-stat__label">EU Markets</div>
                </div>
                <div className="svc-bm-stat">
                  <div className="svc-bm-stat__num">€ 340M+</div>
                  <div className="svc-bm-stat__label">Deal Value Structured</div>
                </div>
                <div className="svc-bm-stat">
                  <div className="svc-bm-stat__num">94%</div>
                  <div className="svc-bm-stat__label">Client Retention</div>
                </div>
                <div className="svc-bm-cta">
                  <Link to="/register" className="eu-gold-btn" style={{ width: '100%', justifyContent: 'center' }}>
                    Book Strategy Session
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      {/* <section className="svc-pricing-section">
        <div className="eu-section">
          <div className="svc-section-head" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div>
              <div className="eu-eyebrow" style={{ justifyContent: 'center' }}>Transparent Pricing</div>
              <h2 className="svc-section-title">Clear costs.<br /><em>No surprises.</em></h2>
              <p className="eu-lead" style={{ marginTop: 16, textAlign: 'center', margin: '16px auto 0' }}>
                All plans include access to the IndustrialHub marketplace. Upgrade or downgrade at any time.
              </p>
            </div>
          </div>

          <div className="svc-pricing-grid">
            {PRICING.map((plan, i) => (
              <div key={plan.name} className={`svc-plan ${plan.highlight ? 'svc-plan--highlight' : ''} eu-anim-up eu-d${i + 1}`}>
                {plan.highlight && <div className="svc-plan__badge">Most Popular</div>}
                <div className="svc-plan__name">{plan.name}</div>
                <div className="svc-plan__price">{plan.price}</div>
                <div className="svc-plan__period">{plan.period}</div>
                <p className="svc-plan__desc">{plan.desc}</p>
                <div className="svc-plan__divider" />
                <ul className="svc-plan__features">
                  {plan.features.map(f => (
                    <li key={f}><span>✓</span> {f}</li>
                  ))}
                </ul>
                <Link to="/register" className={plan.highlight ? 'eu-gold-btn' : 'eu-ghost-btn'} style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                  {plan.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section> */}




      {/* ── CTA BANNER ── */}
      <section className="svc-banner">
        <div className="eu-section svc-banner__inner">
          <div className="svc-banner__glow" />
          <div className="svc-banner__content">
            <div className="eu-eyebrow">Ready to Begin?</div>
            <h2 className="svc-banner__title">
              Your first consultation<br /><em>is complimentary.</em>
            </h2>
            <p className="svc-banner__desc">
              Speak with a European industrial commerce specialist. No commitment required.
            </p>
          </div>
          <div className="svc-banner__ctas">
            <Link to="/register" className="eu-gold-btn">Create Free Account →</Link>
            <Link to="/about" className="eu-ghost-btn">Meet Our Team</Link>
          </div>
        </div>
      </section>

    </div>
      
  );
}
