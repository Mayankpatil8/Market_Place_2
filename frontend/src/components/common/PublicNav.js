import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PublicNav.css';

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/about', label: 'About' },
    { to: '/products', label: 'Marketplace' },
  ];

  return (
    <header className={`pub-nav ${scrolled ? 'pub-nav-scrolled' : ''}`}>
      <div className="pub-nav-inner">
        {/* Logo */}
        <Link to="/" className="pub-logo">
          <span className="pub-logo-mark">⚙</span>
          <div className="pub-logo-text">
            <span className="pub-logo-name">IndustrialHub</span>
            <span className="pub-logo-sub">European Commerce</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className={`pub-links ${mobileOpen ? 'pub-links-open' : ''}`}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`pub-link ${location.pathname === l.to ? 'pub-link-active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="pub-nav-divider" />
          <Link to="/login" className="pub-link">Sign In</Link>
          <Link to="/register" className="pub-nav-cta">Get Started</Link>
        </nav>

        {/* Mobile toggle */}
        <button className="pub-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className={`hb ${mobileOpen ? 'hb-open' : ''}`}>
            <span /><span /><span />
          </span>
        </button>
      </div>
    </header>
  );
}
