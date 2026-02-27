import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';

export default function SupplierOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    API.get('/orders/supplier')
      .then(({ data }) => { setOrders(data.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
  };

  // ✅ Safe revenue calculation (case insensitive + stable)

const paidOrders = orders.filter(
  o => String(o.paymentStatus || '').toLowerCase().trim() === 'paid'
);

const totalRevenue = paidOrders.reduce(
  (sum, o) => sum + Number(o.totalAmount || 0),
  0
);

const pendingRevenue = orders
  .filter(o => String(o.paymentStatus || '').toLowerCase().trim() !== 'paid')
  .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

const totalOrders = orders.length;

const thisMonthOrders = orders.filter(o => {
  const d = new Date(o.createdAt);
  const now = new Date();
  return d.getMonth() === now.getMonth() &&
         d.getFullYear() === now.getFullYear();
});

const handleDelete = async (id) => {
  if (!window.confirm('Delete this order?')) return;

  try {
    await API.delete(`/orders/${id}`);
    toast.success('Order deleted');
    fetchOrders();
  } catch {
    toast.error('Failed to delete');
  }
};

const commissionRate = 0.015;
const commission = totalRevenue * commissionRate;
const netEarnings = totalRevenue - commission;

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header flex-between">
        <div>
          <h1>My Orders</h1>
          <p>Orders containing your products</p>
        </div>
        <div className="page-header flex-between">
</div>

{/* 👇 PASTE NEW REVENUE BLOCK HERE */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
  
  <div className="card" style={{ padding: 18 }}>
    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Total Revenue (Paid)</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>
      €{Math.round(totalRevenue).toLocaleString()}
    </div>
  </div>

  <div className="card" style={{ padding: 18 }}>
    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Pending Revenue</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>
      €{Math.round(pendingRevenue).toLocaleString()}
    </div>
  </div>

  <div className="card" style={{ padding: 18 }}>
    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Net Earnings (After 1.5%)</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>
      €{Math.round(netEarnings).toLocaleString()}
    </div>
  </div>

  <div className="card" style={{ padding: 18 }}>
    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Orders This Month</div>
    <div style={{ fontSize: 20, fontWeight: 800 }}>
      {totalOrders}
    </div>
  </div>

</div>

      </div>

      <div className="card" style={{ padding: 24 }}>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">No orders received yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount (€)</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td style={{ fontSize: 11 }}>{o.orderNumber}</td>
                    <td>
                      <strong>{o.customer?.name || '—'}</strong>
                      {o.customer?.phone && (
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{o.customer.phone}</div>
                      )}
                    </td>
                    <td>
                      {(o.items || []).map(i => (
                        <div key={i._id} style={{ fontSize: 12 }}>{i.name} × {i.quantity}</div>
                      ))}
                    </td>
                    <td><strong>€{(o.totalAmount || 0).toLocaleString()}</strong></td>
                    <td>
                      <span className={`badge badge-${
                        o.paymentStatus === 'paid'     ? 'green' :
                        o.paymentStatus === 'refunded' ? 'red'   : 'yellow'
                      }`}>{o.paymentStatus}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${
                        o.status === 'delivered' ? 'green' :
                        o.status === 'cancelled' ? 'red'   :
                        o.status === 'shipped'   ? 'cyan'  :
                        o.status === 'pending'   ? 'yellow' : 'blue'
                      }`}>{o.status}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-DE')}
                    </td>
                    <td>
                      <select
                        className="input"
                        style={{ width: 130, padding: '5px 10px', fontSize: 12 }}
                        value={o.status}
                        onChange={e => updateStatus(o._id, e.target.value)}
                      >
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
