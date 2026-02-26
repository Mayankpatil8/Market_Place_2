import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import API from '../../utils/api';
import { FiUsers, FiBox, FiPackage, FiBriefcase, FiTrendingUp, FiArrowRight, FiArrowUp, FiArrowDown, FiActivity, FiZap } from 'react-icons/fi';
import './AdminDash.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#f5a623','#00d4ff','#00e676','#ff4757','#9c6afe'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '12px 16px', fontSize: 12 }}>
      <div style={{ fontWeight: 800, marginBottom: 8, color: 'var(--text-2)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-2)' }}>{p.name}:</span>
          <strong style={{ color: 'var(--text)' }}>₹{Number(p.value).toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    API.get('/admin/dashboard').then(({ data }) => {
      setStats(data.stats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-spinner">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Loading dashboard data…</div>
      </div>
    </div>
  );

  const kpis = [
    { label: 'Total Users', value: stats?.totalUsers || 0, fmt: 'num', icon: FiUsers, color: 'var(--cyan)', delta: '+12%', up: true, bg: 'rgba(0,212,255,0.08)' },
    { label: 'Products Listed', value: stats?.totalProducts || 0, fmt: 'num', icon: FiBox, color: 'var(--green)', delta: '+8%', up: true, bg: 'rgba(0,230,118,0.08)' },
    { label: 'Platform Revenue', value: stats?.revenue?.totalFees || 0, fmt: 'inr', icon: FiTrendingUp, color: 'var(--accent)', delta: '+24%', up: true, bg: 'rgba(245,166,35,0.08)' },
    { label: 'Active Deals', value: stats?.totalDeals || 0, fmt: 'num', icon: FiBriefcase, color: 'var(--purple)', delta: '+5%', up: true, bg: 'rgba(156,106,254,0.08)' },
  ];

  const monthlyData = (stats?.monthlyRevenue || []).map(m => ({
    month: MONTHS[m._id.month - 1],
    'Gross Revenue': m.revenue,
    'Platform Fees': m.fees,
    Orders: m.orders,
  }));

  const pieData = (stats?.usersByRole || []).map(r => ({ name: r._id, value: r.count }));
  const orderStatus = (stats?.ordersByStatus || []).map(o => ({ name: o._id, value: o.count }));

  return (
    <div className="admin-dash">
      {/* Header */}
      <div className="page-header flex-between">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, background: 'var(--green)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Dashboard</span>
          </div>
          <h1>Platform Overview</h1>
          <p>Real-time analytics and business intelligence</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/admin/profit-loss" className="btn btn-secondary"><FiTrendingUp /> P&L Report</Link>
          <Link to="/admin/users" className="btn btn-primary">Manage Users <FiArrowRight /></Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {kpis.map((k, i) => (
          <div key={k.label} className={`card stat-card anim-fade-up d${i + 1}`} style={{ background: k.bg, borderColor: `${k.color}25` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${k.color}20`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                <k.icon />
              </div>
              <span className={`badge ${k.up ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                {k.up ? <FiArrowUp /> : <FiArrowDown />} {k.delta}
              </span>
            </div>
            <div className="stat-value" style={{ color: k.color }}>
              {k.fmt === 'inr' ? `₹${Number(k.value).toLocaleString()}` : Number(k.value).toLocaleString()}
            </div>
            <div className="stat-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue cards */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card anim-fade-up d1" style={{ padding: 24 }}>
          <div className="ad-card-title">Order Revenue Breakdown</div>
          <div className="rev-grid">
            {[
              { label: 'Gross Revenue', val: stats?.revenue?.totalRevenue || 0, color: 'var(--text)' },
              { label: 'Platform Fee (2%)', val: stats?.revenue?.totalFees || 0, color: 'var(--green)' },
              { label: 'Supplier Payout', val: (stats?.revenue?.totalRevenue||0) - (stats?.revenue?.totalFees||0), color: 'var(--text-2)' },
            ].map(r => (
              <div key={r.label} className="rev-row">
                <span className="rev-label">{r.label}</span>
                <span className="rev-val" style={{ color: r.color }}>₹{Number(r.val).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="progress-bar" style={{ marginTop: 16 }}>
            <div className="progress-fill progress-gold" style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
            <span>From {stats?.revenue?.totalOrders || 0} paid orders</span>
            <span>{stats?.totalOrders || 0} total orders</span>
          </div>
        </div>

        <div className="card anim-fade-up d2" style={{ padding: 24 }}>
          <div className="ad-card-title">Deal Revenue</div>
          <div className="rev-grid">
            {[
              { label: 'Total Deal Value', val: stats?.dealRevenue?.totalValue || 0, color: 'var(--text)' },
              { label: 'Platform Commission (1.5%)', val: stats?.dealRevenue?.totalFees || 0, color: 'var(--green)' },
            ].map(r => (
              <div key={r.label} className="rev-row">
                <span className="rev-label">{r.label}</span>
                <span className="rev-val" style={{ color: r.color }}>₹{Number(r.val).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: 16, background: 'rgba(245,166,35,0.07)', borderRadius: 10, border: '1px solid rgba(245,166,35,0.2)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>Total Platform Income</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--accent)' }}>
              ₹{((stats?.revenue?.totalFees || 0) + (stats?.dealRevenue?.totalFees || 0)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly revenue chart */}
      {monthlyData.length > 0 && (
        <div className="card anim-fade-up" style={{ padding: 28, marginBottom: 24 }}>
          <div className="flex-between" style={{ marginBottom: 24 }}>
            <div className="ad-card-title" style={{ margin: 0 }}>Monthly Revenue Trend</div>
            <div className="tab-bar" style={{ width: 'auto', padding: '3px' }}>
              {['overview', 'fees'].map(t => (
                <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                  style={{ padding: '6px 14px', fontSize: 12 }}
                  onClick={() => setActiveTab(t)}>
                  {t === 'overview' ? 'Gross Revenue' : 'Platform Fees'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5a623" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f5a623" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#55557a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#55557a' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {activeTab === 'overview' ? (
                <Area type="monotone" dataKey="Gross Revenue" stroke="#f5a623" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
              ) : (
                <Area type="monotone" dataKey="Platform Fees" stroke="#00d4ff" strokeWidth={2.5} fill="url(#feeGrad)" dot={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie + Bar charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="ad-card-title">Users by Role</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={44} paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
              </Pie>
              <Tooltip formatter={(v) => [v, 'Users']} contentStyle={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="ad-card-title">Orders by Status</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={orderStatus} barSize={24}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#55557a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#55557a' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products */}
      <div className="card" style={{ padding: 24 }}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div className="ad-card-title" style={{ margin: 0 }}>Top Selling Products</div>
          <Link to="/admin/products" className="btn btn-secondary btn-sm">View All <FiArrowRight /></Link>
        </div>
        {(stats?.topProducts || []).length === 0 ? (
          <div className="empty-state">No sales data yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {(stats.topProducts || []).map((p, i) => {
                  const maxSold = stats.topProducts[0]?.totalSold || 1;
                  const pct = Math.round((p.totalSold / maxSold) * 100);
                  return (
                    <tr key={p._id}>
                      <td><span style={{ fontWeight: 800, color: i === 0 ? 'var(--accent)' : 'var(--text-3)' }}>#{i + 1}</span></td>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="badge badge-gray">{p.category}</span></td>
                      <td>₹{p.price?.toLocaleString()}</td>
                      <td><strong>{p.totalSold || 0}</strong></td>
                      <td style={{ color: 'var(--green)' }}>₹{((p.totalSold || 0) * (p.price || 0)).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-fill progress-gold" style={{ width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
