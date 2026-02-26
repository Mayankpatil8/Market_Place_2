import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiBox, FiShoppingCart, FiPackage, FiBarChart2,
  FiUsers, FiLogOut, FiMenu, FiZap, FiTrendingUp,
  FiBriefcase, FiSearch, FiBell, FiSettings, FiStar,
  FiChevronRight, FiActivity, FiX
} from 'react-icons/fi';
import './Layout.css';

const navConfig = {
  customer: [
    { to: '/products', icon: FiBox, label: 'Marketplace' },
    { to: '/dashboard', icon: FiBarChart2, label: 'Dashboard' },
    { to: '/cart', icon: FiShoppingCart, label: 'Cart', badge: 'cart' },
    { to: '/my-orders', icon: FiPackage, label: 'My Orders' },
    { to: '/suggestions', icon: FiStar, label: 'For You' },
    { to: '/deal-board', icon: FiBriefcase, label: 'Deal Board' },
  ],
  supplier: [
    { to: '/supplier/dashboard', icon: FiBarChart2, label: 'Dashboard' },
    { to: '/supplier/products', icon: FiBox, label: 'Products' },
    { to: '/supplier/deals', icon: FiBriefcase, label: 'Deals' },
    { to: '/supplier/orders', icon: FiPackage, label: 'Orders' },
    { to: '/supplier/analytics', icon: FiActivity, label: 'Analytics' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: FiBarChart2, label: 'Dashboard' },
    { to: '/admin/users', icon: FiUsers, label: 'Users' },
    { to: '/admin/orders', icon: FiPackage, label: 'Orders' },
    { to: '/admin/deals', icon: FiBriefcase, label: 'Deals' },
    { to: '/admin/profit-loss', icon: FiTrendingUp, label: 'P&L Report' },
    { to: '/admin/products', icon: FiBox, label: 'Products' },
    // { to: '/admin/certifications', icon: FiZap, label: 'Certifications' },
    // { to: '/admin/consulting', icon: FiTrendingUp, label: 'Consulting' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((s, i) => s + i.qty, 0));
  }, [location]);

  const navItems = user ? (navConfig[user.role] || []) : [
    { to: '/', icon: FiHome, label: 'Home', exact: true },
    { to: '/products', icon: FiBox, label: 'Products' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const roleGradient = user?.role === 'admin'
    ? 'linear-gradient(135deg,#ff4757,#c0392b)'
    : user?.role === 'supplier'
    ? 'linear-gradient(135deg,#00e676,#00897b)'
    : 'linear-gradient(135deg,#00d4ff,#0077aa)';

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQ.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQ)}`);
      setSearchQ('');
    }
  };

  return (
    <div className={`layout ${collapsed ? 'layout-collapsed' : ''} ${mobileOpen ? 'layout-mobile-open' : ''}`}>
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sb-header">
          <div className="sb-brand">
            <div className="sb-logo"><FiZap /></div>
            {!collapsed && <span className="sb-name">IndustrialHub</span>}
          </div>
          <button className="sb-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <FiMenu /> : <FiX />}
          </button>
        </div>

        {user && (
          <div className={`sb-user ${collapsed ? 'sb-user-mini' : ''}`}>
            <div className="sb-avatar" style={{ background: roleGradient }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="sb-user-info">
                <div className="sb-user-name">{user.name}</div>
                <div className="sb-user-role">{user.role}</div>
              </div>
            )}
            {!collapsed && <div className="sb-online" />}
          </div>
        )}

        <nav className="sb-nav">
          {!collapsed && <div className="sb-section-label">Menu</div>}
          {navItems.map(({ to, icon: Icon, label, badge, exact }) => {
            const active = isActive({ to, exact });
            return (
              <Link
                key={to}
                to={to}
                className={`sb-item ${active ? 'sb-active' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
              >
                <div className="sb-item-icon">
                  <Icon />
                  {badge === 'cart' && cartCount > 0 && <span className="sb-badge">{cartCount > 9 ? '9+' : cartCount}</span>}
                </div>
                {!collapsed && <span className="sb-item-label">{label}</span>}
                {!collapsed && active && <FiChevronRight className="sb-arrow" />}
              </Link>
            );
          })}
        </nav>

        <div className="sb-footer">
          {user && (
            <button className="sb-item sb-logout" onClick={handleLogout} title={collapsed ? 'Sign Out' : undefined}>
              <div className="sb-item-icon"><FiLogOut /></div>
              {!collapsed && <span className="sb-item-label">Sign Out</span>}
            </button>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main className="lm-main">
        <header className="lm-topbar">
          <button className="mobile-menu-btn btn btn-ghost btn-icon" onClick={() => setMobileOpen(true)}>
            <FiMenu />
          </button>

          <div className="lm-search">
            <FiSearch />
            <input
              placeholder="Search products, suppliers, deals…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <div className="lm-topbar-right">
            {user ? (
              <>
                <button className="lm-icon-btn">
                  <FiBell />
                  <span className="lm-notif-dot" />
                </button>
                <div className="lm-user-chip">
                  <div className="lm-chip-avatar" style={{ background: roleGradient }}>
                    {user.name?.charAt(0)}
                  </div>
                  <div className="lm-chip-info">
                    <span className="lm-chip-name">{user.name}</span>
                    <span className="lm-chip-role">{user.role}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started →</Link>
              </div>
            )}
          </div>
        </header>

        <div className="lm-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
