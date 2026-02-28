import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

const STATUS_COLORS = { pending:'yellow', confirmed:'blue', processing:'cyan', shipped:'blue', delivered:'green', cancelled:'red', refunded:'gray' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (status) params.append('status', status);
    API.get(`/admin/orders?${params}`).then(({ data }) => {
      setOrders(data.orders); setTotal(data.total); setLoading(false);
    });
  };

  useEffect(() => { fetchOrders(); }, [page, status]);

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{maxWidth: 1200}}>
      <div className="page-header flex-between">
        <div>
          <h1>Order Management</h1>
          <p>Total: {total} orders</p>
        </div>
        <select className="input" style={{width:160}} value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
          <option value="">All Status</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{padding:24}}>
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Fee</th><th>Status</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td><strong style={{fontSize:12}}>{o.orderNumber}</strong></td>
                    <td>{o.customer?.name}<br/><span style={{fontSize:11,color:'var(--muted)'}}>{o.customer?.email}</span></td>
                    <td>{o.items?.length} item(s)</td>
                    <td><strong>€{o.totalAmount?.toLocaleString()}</strong></td>
                    <td style={{color:'var(--success)'}}>€{o.platformFee?.toLocaleString()}</td>
                    <td><span className={`badge badge-${STATUS_COLORS[o.status]||'gray'}`}>{o.status}</span></td>
                    <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <select className="input" style={{width:130,padding:'5px 10px',fontSize:12}} value={o.status}
                        onChange={e => updateStatus(o._id, e.target.value)}>
                        {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'center'}}>
          <button className="btn btn-outline btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
          <span style={{fontSize:14,alignSelf:'center'}}>Page {page}</span>
          <button className="btn btn-outline btn-sm" disabled={orders.length<20} onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
