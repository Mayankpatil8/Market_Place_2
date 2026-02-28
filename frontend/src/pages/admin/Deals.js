import React, { useState, useEffect } from 'react';
import API from '../../utils/api';

const STATUS_COLORS = { proposed:'yellow', negotiating:'cyan', agreed:'blue', 'in-progress':'green', completed:'green', cancelled:'red' };

export default function AdminDeals() {
  const [deals, setDeals] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (status) params.append('status', status);
    API.get(`/admin/deals?${params}`).then(({ data }) => {
      setDeals(data.deals); setTotal(data.total); setLoading(false);
    });
  }, [page, status]);

  return (
    <div style={{maxWidth: 1200}}>
      <div className="page-header flex-between">
        <div><h1>Deal Management</h1><p>Total: {total} deals on platform</p></div>
        <select className="input" style={{width:160}} value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
          <option value="">All Status</option>
          {['proposed','negotiating','agreed','in-progress','completed','cancelled'].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{padding:24}}>
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Deal #</th><th>Title</th><th>Supplier</th><th>Buyer</th><th>Value</th><th>Platform Fee</th><th>Type</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {deals.map(d => (
                  <tr key={d._id}>
                    <td><strong style={{fontSize:12}}>{d.dealNumber}</strong></td>
                    <td><strong>{d.title}</strong></td>
                    <td>{d.supplier?.company || d.supplier?.name}</td>
                    <td>{d.buyer?.company || d.buyer?.name || <span style={{color:'var(--muted)'}}>Open</span>}</td>
                    <td><strong>€{d.totalValue?.toLocaleString()}</strong></td>
                    <td style={{color:'var(--success)'}}>€{d.platformFee?.toLocaleString()}</td>
                    <td><span className="badge badge-blue">{d.dealType}</span></td>
                    <td><span className={`badge badge-${STATUS_COLORS[d.status]||'gray'}`}>{d.status}</span></td>
                    <td>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'center'}}>
          <button className="btn btn-outline btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
          <span style={{fontSize:14,alignSelf:'center'}}>Page {page}</span>
          <button className="btn btn-outline btn-sm" disabled={deals.length<20} onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
