import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './PublicLayout.css';

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/certifications', label: 'Certifications' },  // ✅ added
  { to: '/consulting', label: 'Consulting' },          // ✅ added
  { to: '/products', label: 'Marketplace' },
  { to: '/about', label: 'About' },
];

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <div className="pub-layout">
      {/* ── NAVBAR ── */}
      <header className={`pub-header ${scrolled ? 'pub-header--scrolled' : ''}`}>
        <div className="pub-header__inner">
          <Link to="/" className="pub-brand">
            <div className="pub-brand__icon">⚙</div>
            <div className="pub-brand__text">
              <span className="pub-brand__name">IndustrialHub</span>
              <span className="pub-brand__tagline">European Commerce</span>
            </div>
          </Link>

          <nav className={`pub-nav ${menuOpen ? 'pub-nav--open' : ''}`}>
            <div className="pub-nav__links">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={`pub-nav__link ${isActive(to) ? 'pub-nav__link--active' : ''}`}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="pub-nav__divider" />
            <div className="pub-nav__actions">
              <Link to="/login" className="pub-nav__signin">Sign In</Link>
              <Link to="/register" className="pub-nav__cta">Get Started →</Link>
            </div>
          </nav>

          <button
            className={`pub-burger ${menuOpen ? 'pub-burger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {menuOpen && <div className="pub-overlay" onClick={() => setMenuOpen(false)} />}

      {/* ── PAGE CONTENT ── */}
      <main className="pub-main">
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="pub-footer">
        <div className="pub-footer__top">
          <div className="pub-footer__brand">
            <div className="pub-brand" style={{ marginBottom: 16 }}>
              <div className="pub-brand__icon">⚙</div>
              <div className="pub-brand__text">
                <span className="pub-brand__name">IndustrialHub</span>
                <span className="pub-brand__tagline">European Commerce</span>
              </div>
            </div>
            <p className="pub-footer__desc">
              Europe's premier TradeConnect industrial marketplace. Connecting manufacturers, suppliers, and buyers since 2019. ISO 9001 · CE Certified · GDPR Compliant.
            </p>
            <div className="pub-footer__certs">
              <span>🏅 ISO 9001:2015</span>
              <span>🇪🇺 CE Mark</span>
              <span>🔒 GDPR</span>
            </div>
          </div>

          <div className="pub-footer__cols">
            {[
              {
                title: 'Platform',
                links: ['Marketplace', 'Deal Board', 'AI Matching', 'Analytics', 'API Access'],
                tos: ['/products', '/products', '/suggestions', '/', '/'],
              },
              {
                  title: 'Services',
                  links: ['Certification', 'Consulting', 'Business Models', 'Compliance', 'Logistics'],
                  tos: ['/certifications', '/consulting', '/services', '/services', '/services'],
              },
              {
                title: 'Company',
                links: ['About Us', 'Our Team', 'Press', 'Careers', 'Contact'],
                tos: ['/about', '/about', '/about', '/about', '/about'],
              },
              {
                title: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR Rights', 'Imprint'],
                tos: ['/', '/', '/', '/', '/'],
              },
            ].map(col => (
              <div key={col.title} className="pub-footer__col">
                <div className="pub-footer__col-title">{col.title}</div>
                {col.links.map((l, i) => (
                  <Link key={l} to={col.tos[i]} className="pub-footer__col-link">{l}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="pub-footer__bottom">
          <span>© 2025 IndustrialHub GmbH, Frankfurt am Main, Germany. All rights reserved.</span>
          <div className="pub-footer__socials">
            <a href="#" className="pub-footer__social">LinkedIn</a>
            <a href="#" className="pub-footer__social">Xing</a>
            <a href="#" className="pub-footer__social">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
