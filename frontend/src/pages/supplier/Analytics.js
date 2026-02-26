import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiTrendingUp, FiPackage, FiBriefcase, FiBox, FiEye, FiShoppingCart } from 'react-icons/fi';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function SupplierAnalytics() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/products?limit=50'),
      API.get('/orders/supplier'),
      API.get('/deals'),
    ]).then(([p, o, d]) => {
      setProducts((p.data.products || []).filter(x => x.supplier?._id === user._id || x.supplier === user._id));
      setOrders(o.data.orders || []);
      setDeals(d.data.deals || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
  const totalDealValue = deals.filter(d => d.status === 'completed').reduce((s, d) => s + d.totalValue, 0);
  const totalViews = products.reduce((s, p) => s + (p.views || 0), 0);

  // Monthly order data
  const monthlyOrders = MONTHS.map((m, i) => {
    const monthData = orders.filter(o => new Date(o.createdAt).getMonth() === i);
    return { month: m, Orders: monthData.length, Revenue: monthData.reduce((s, o) => s + o.totalAmount, 0) };
  });

  // Product performance
  const topProducts = [...products].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 6);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <h1>Performance Analytics 📊</h1>
        <p>Your business performance overview and insights</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Revenue', val: `₹${Math.round(totalRevenue).toLocaleString()}`, icon: FiTrendingUp, color: 'var(--accent)' },
          { label: 'Total Orders', val: orders.length, icon: FiPackage, color: 'var(--cyan)' },
          { label: 'Products Listed', val: products.length, icon: FiBox, color: 'var(--green)' },
          { label: 'Deal Revenue', val: `₹${Math.round(totalDealValue).toLocaleString()}`, icon: FiBriefcase, color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} className="card stat-card">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>
              <s.icon />
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 800, marginBottom: 20 }}>Monthly Revenue</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyOrders}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5a623" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f5a623" stopOpacity="0" />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#55557a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#55557a' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: 8, fontSize: 12 }} formatter={v => `₹${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="Revenue" stroke="#f5a623" strokeWidth={2.5} fill="url(#aGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 800, marginBottom: 20 }}>Monthly Orders</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyOrders} barSize={16}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#55557a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#55557a' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="Orders" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product performance */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 800, marginBottom: 20 }}>Product Performance</div>
        {topProducts.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">📦</span><p>No products listed yet</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Product</th><th>Category</th><th>Price</th><th>Views</th><th>Units Sold</th><th>Revenue</th><th>Stock</th><th>Performance</th></tr>
              </thead>
              <tbody>
                {topProducts.map(p => {
                  const maxSold = topProducts[0]?.totalSold || 1;
                  return (
                    <tr key={p._id}>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="badge badge-gray">{p.category}</span></td>
                      <td>₹{p.price?.toLocaleString()}</td>
                      <td><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiEye style={{ fontSize: 12 }} /> {p.views || 0}</span></td>
                      <td><strong>{p.totalSold || 0}</strong></td>
                      <td style={{ color: 'var(--green)' }}>₹{((p.totalSold || 0) * (p.price || 0)).toLocaleString()}</td>
                      <td>
                        <span style={{ color: p.stock < 10 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
                          {p.stock < 10 ? '⚠️ ' : ''}{p.stock}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-fill progress-gold" style={{ width: `${Math.round((p.totalSold || 0) / maxSold * 100)}%` }} />
                          </div>
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
