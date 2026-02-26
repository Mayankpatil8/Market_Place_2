import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiPackage, FiStar, FiBriefcase, FiArrowRight, FiSearch } from 'react-icons/fi';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    API.get('/orders/my').then(({ data }) => setOrders(data.orders?.slice(0, 5) || [])).catch(() => {});
    API.get('/users/guide/startup').then(({ data }) => setGuide(data.guide)).catch(() => {});
  }, []);

  const totalSpend = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div style={{maxWidth:1100}}>
      <div className="page-header">
        <h1>Welcome, {user.name}! 👋</h1>
        <p>{user.company ? `${user.company} — ` : ''}Your personal marketplace dashboard</p>
      </div>

      {/* Quick actions */}
      <div className="grid-3" style={{marginBottom:28}}>
        <Link to="/products" className="card" style={{padding:24,display:'flex',gap:16,alignItems:'center',textDecoration:'none'}}>
          <div style={{width:48,height:48,borderRadius:12,background:'#dbeafe',color:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}><FiSearch /></div>
          <div><div style={{fontFamily:'Syne',fontWeight:700}}>Browse Products</div><div style={{fontSize:13,color:'var(--muted)'}}>Find motors, chips & more</div></div>
        </Link>
        <Link to="/suggestions" className="card" style={{padding:24,display:'flex',gap:16,alignItems:'center',textDecoration:'none'}}>
          <div style={{width:48,height:48,borderRadius:12,background:'#fef3c7',color:'#92400e',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}><FiStar /></div>
          <div><div style={{fontFamily:'Syne',fontWeight:700}}>For You</div><div style={{fontSize:13,color:'var(--muted)'}}>AI-powered suggestions</div></div>
        </Link>
        <Link to="/my-orders" className="card" style={{padding:24,display:'flex',gap:16,alignItems:'center',textDecoration:'none'}}>
          <div style={{width:48,height:48,borderRadius:12,background:'#d1fae5',color:'#065f46',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}><FiPackage /></div>
          <div><div style={{fontFamily:'Syne',fontWeight:700}}>My Orders</div><div style={{fontSize:13,color:'var(--muted)'}}>Total spend: ₹{totalSpend.toLocaleString()}</div></div>
        </Link>
      </div>

      <div className="grid-2">
        {/* Recent orders */}
        <div className="card" style={{padding:24}}>
          <div className="flex-between" style={{marginBottom:16}}>
            <h3 style={{fontFamily:'Syne',fontSize:16}}>Recent Orders</h3>
            <Link to="/my-orders" className="btn btn-outline btn-sm">View All <FiArrowRight /></Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders yet.</p>
              <Link to="/products" className="btn btn-accent btn-sm" style={{marginTop:12}}>Start Shopping</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td style={{fontSize:11}}>{o.orderNumber}</td>
                      <td>{o.items?.length} item(s)</td>
                      <td>₹{o.totalAmount?.toLocaleString()}</td>
                      <td><span className={`badge badge-${o.status==='delivered'?'green':o.status==='pending'?'yellow':o.status==='cancelled'?'red':'blue'}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Startup guide */}
        {guide && (
          <div className="card" style={{padding:24}}>
            <h3 style={{fontFamily:'Syne',fontSize:16,marginBottom:16}}>🚀 {guide.title}</h3>
            <div>
              {guide.steps.map(s => (
                <div key={s.step} style={{display:'flex',gap:12,marginBottom:14}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:'var(--primary)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>{s.step}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{s.title}</div>
                    <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{s.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:'#f0fdf4',borderRadius:8,padding:12,marginTop:12}}>
              {guide.tips?.map((tip, i) => <div key={i} style={{fontSize:12,color:'#065f46',marginBottom:4}}>✅ {tip}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
