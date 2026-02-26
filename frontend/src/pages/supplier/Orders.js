import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    API.get('/orders/supplier').then(({ data }) => { setOrders(data.orders || []); setLoading(false); });
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Failed to update'); }
  };

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div style={{maxWidth:1100}}>
      <div className="page-header flex-between">
        <div><h1>My Orders</h1><p>Orders containing your products</p></div>
        <div className="card" style={{padding:'12px 20px',textAlign:'right'}}>
          <div style={{fontSize:12,color:'var(--muted)'}}>Total Revenue</div>
          <div style={{fontFamily:'Syne',fontSize:22,fontWeight:800,color:'var(--success)'}}>₹{Math.round(totalRevenue).toLocaleString()}</div>
        </div>
      </div>

      <div className="card" style={{padding:24}}>
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> :
          orders.length === 0 ? <div className="empty-state">No orders received yet.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Update</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td style={{fontSize:11}}>{o.orderNumber}</td>
                      <td>
                        <strong>{o.customer?.name}</strong><br/>
                        <span style={{fontSize:11,color:'var(--muted)'}}>{o.customer?.phone}</span>
                      </td>
                      <td>
                        {o.items?.map(i=><div key={i._id} style={{fontSize:12}}>{i.name} × {i.quantity}</div>)}
                      </td>
                      <td><strong>₹{o.totalAmount?.toLocaleString()}</strong></td>
                      <td><span className={`badge badge-${o.paymentStatus==='paid'?'green':o.paymentStatus==='refunded'?'red':'yellow'}`}>{o.paymentStatus}</span></td>
                      <td><span className={`badge badge-${o.status==='delivered'?'green':o.status==='pending'?'yellow':o.status==='cancelled'?'red':'blue'}`}>{o.status}</span></td>
                      <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <select className="input" style={{width:130,padding:'5px 10px',fontSize:12}} value={o.status}
                          onChange={e=>updateStatus(o._id,e.target.value)}>
                          {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}
