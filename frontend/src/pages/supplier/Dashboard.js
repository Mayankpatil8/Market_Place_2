import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiBox, FiBriefcase, FiPackage, FiTrendingUp, FiArrowRight, FiPlus } from 'react-icons/fi';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, deals: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);

  useEffect(() => {
    Promise.all([
      API.get('/products?limit=1').then(r => r.data.total),
      API.get('/deals?limit=5').then(r => { setRecentDeals(r.data.deals || []); return r.data.total; }),
      API.get('/orders/supplier').then(r => {
        const orders = r.data.orders || [];
        setRecentOrders(orders.slice(0, 5));
        const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => {
          const myItems = o.items.filter(i => i.supplier?.toString() === user._id);
          return sum + myItems.reduce((s, i) => s + i.price * i.quantity, 0);
        }, 0);
        return { count: orders.length, revenue };
      }),
    ]).then(([products, deals, orderInfo]) => {
      setStats({ products, deals, orders: orderInfo.count, revenue: orderInfo.revenue });
    }).catch(() => {});
  }, []);

  return (
    <div style={{maxWidth: 1100}}>
      <div className="page-header flex-between">
        <div>
          <h1>Supplier Dashboard</h1>
          <p>Welcome back, {user.name} — {user.company || 'Your Company'}</p>
        </div>
        <Link to="/supplier/products" className="btn btn-accent"><FiPlus /> Add Product</Link>
      </div>

      <div className="grid-4" style={{marginBottom:28}}>
        {[
          { label: 'My Products', value: stats.products, icon: FiBox, to: '/supplier/products', color:'#dbeafe', ic:'#1e40af' },
          { label: 'My Deals', value: stats.deals, icon: FiBriefcase, to: '/supplier/deals', color:'#d1fae5', ic:'#065f46' },
          { label: 'Total Orders', value: stats.orders, icon: FiPackage, to: '/supplier/orders', color:'#fef3c7', ic:'#92400e' },
          { label: 'Revenue Earned', value: `₹${Math.round(stats.revenue).toLocaleString()}`, icon: FiTrendingUp, to: '/supplier/orders', color:'#fce7f3', ic:'#9d174d' },
        ].map(({ label, value, icon: Icon, to, color, ic }) => (
          <Link key={label} to={to} className="card stat-card" style={{textDecoration:'none'}}>
            <div style={{width:44,height:44,borderRadius:10,background:color,color:ic,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:12}}>
              <Icon />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div style={{color:'var(--accent2)',fontSize:12,marginTop:8,display:'flex',alignItems:'center',gap:4}}>View <FiArrowRight /></div>
          </Link>
        ))}
      </div>

      <div className="grid-2">
        <div className="card" style={{padding:24}}>
          <div className="flex-between" style={{marginBottom:16}}>
            <h3 style={{fontFamily:'Syne',fontSize:16}}>Recent Orders</h3>
            <Link to="/supplier/orders" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {recentOrders.length === 0 ? <div className="empty-state">No orders yet</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o._id}>
                      <td style={{fontSize:11}}>{o.orderNumber}</td>
                      <td>{o.customer?.name}</td>
                      <td>₹{o.totalAmount?.toLocaleString()}</td>
                      <td><span className={`badge badge-${o.status==='delivered'?'green':o.status==='pending'?'yellow':'blue'}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{padding:24}}>
          <div className="flex-between" style={{marginBottom:16}}>
            <h3 style={{fontFamily:'Syne',fontSize:16}}>Recent Deals</h3>
            <Link to="/supplier/deals" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {recentDeals.length === 0 ? <div className="empty-state">No deals yet. <Link to="/supplier/deals">Create one</Link></div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Deal</th><th>Value</th><th>Status</th></tr></thead>
                <tbody>
                  {recentDeals.map(d => (
                    <tr key={d._id}>
                      <td><strong style={{fontSize:13}}>{d.title}</strong></td>
                      <td>₹{d.totalValue?.toLocaleString()}</td>
                      <td><span className={`badge badge-${d.status==='completed'?'green':d.status==='proposed'?'yellow':'blue'}`}>{d.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
