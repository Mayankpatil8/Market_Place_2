import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

const STATUS_COLORS = { pending:'yellow', confirmed:'blue', processing:'cyan', shipped:'blue', delivered:'green', cancelled:'red', refunded:'gray' };

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get('/orders/my').then(({ data }) => { setOrders(data.orders || []); setLoading(false); });
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>;

  return (
    <div style={{maxWidth:900}}>
      <div className="page-header flex-between">
        <div><h1>My Orders</h1><p>{orders.length} orders total</p></div>
        <Link to="/products" className="btn btn-accent">Continue Shopping</Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:64}}>📦</div>
          <p style={{marginTop:16,marginBottom:20}}>No orders placed yet</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        orders.map(o => (
          <div key={o._id} className="card" style={{marginBottom:16}}>
            <div style={{padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}
              onClick={()=>setExpanded(expanded===o._id?null:o._id)}>
              <div>
                <div style={{fontFamily:'Syne',fontWeight:700,marginBottom:4}}>{o.orderNumber}</div>
                <div style={{fontSize:13,color:'var(--muted)'}}>{new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:'Syne',fontSize:18,fontWeight:800}}>€{o.totalAmount?.toLocaleString()}</div>
                <span className={`badge badge-${STATUS_COLORS[o.status]||'gray'}`}>{o.status}</span>
              </div>
            </div>

            {expanded === o._id && (
              <div style={{borderTop:'1px solid var(--border)',padding:20}}>
                <h4 style={{marginBottom:12}}>Items</h4>
                {o.items?.map(item => (
                  <div key={item._id} style={{display:'flex',justifyContent:'space-between',fontSize:14,padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                    <span><strong>{item.name}</strong> × {item.quantity}</span>
                    <span>€{(item.price*item.quantity).toLocaleString()}</span>
                  </div>
                ))}

                <div style={{marginTop:16,padding:12,background:'#f8fafc',borderRadius:8}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Shipping Address</div>
                  <div style={{fontSize:13,color:'var(--muted)'}}>{[o.shippingAddress?.street,o.shippingAddress?.city,o.shippingAddress?.state,o.shippingAddress?.pincode].filter(Boolean).join(', ')}</div>
                </div>

                {o.timeline?.length > 0 && (
                  <div style={{marginTop:16}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Order Timeline</div>
                    {o.timeline.map((t,i) => (
                      <div key={i} style={{display:'flex',gap:12,marginBottom:8,fontSize:13}}>
                        <span style={{width:80,color:'var(--muted)'}}>{new Date(t.timestamp).toLocaleDateString('en-IN')}</span>
                        <span className={`badge badge-${STATUS_COLORS[t.status]||'gray'}`}>{t.status}</span>
                        <span style={{color:'var(--muted)'}}>{t.note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
