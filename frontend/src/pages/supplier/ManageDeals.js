import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { FiPlus } from 'react-icons/fi';

const EMPTY = { title:'', description:'', totalValue:'', dealType:'TradeConnect', category:'motors', contractTerms:'', startDate:'', endDate:'' };
const STATUS_COLORS = { proposed:'yellow', negotiating:'cyan', agreed:'blue', 'in-progress':'green', completed:'green', cancelled:'red' };

export default function ManageDeals() {
  const [deals, setDeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const fetchDeals = () => {
    API.get('/deals').then(({ data }) => setDeals(data.deals || []));
  };

  useEffect(() => { fetchDeals(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.totalValue) return toast.error('Title and deal value required');
    setLoading(true);
    try {
      await API.post('/deals', { ...form, totalValue: Number(form.totalValue) });
      toast.success('Deal created successfully!');
      setForm(EMPTY); setShowForm(false); fetchDeals();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/deals/${id}/status`, { status });
      toast.success('Deal status updated');
      fetchDeals();
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{maxWidth:1100}}>
      <div className="page-header flex-between">
        <div>
          <h1>TradeConnect Deals</h1>
          <p>Create and manage deals with companies and startups</p>
        </div>
        <button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}><FiPlus/> {showForm?'Cancel':'Create Deal'}</button>
      </div>

      {showForm && (
        <div className="card" style={{padding:28,marginBottom:28}}>
          <h3 style={{fontFamily:'Syne',marginBottom:20}}>New Deal Proposal</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label className="input-label">Deal Title *</label><input className="input" name="title" placeholder="e.g. Bulk Motor Supply — 500 units" value={form.title} onChange={handleChange} /></div>
              <div className="form-group"><label className="input-label">Total Deal Value (₹) *</label><input className="input" type="number" name="totalValue" value={form.totalValue} onChange={handleChange} /></div>
            </div>
            <div className="form-group"><label className="input-label">Description</label><textarea className="input" name="description" rows={3} placeholder="Describe the deal — products, quantities, specs..." value={form.description} onChange={handleChange} /></div>
            <div className="form-row">
              <div className="form-group"><label className="input-label">Deal Type</label>
                <select className="input" name="dealType" value={form.dealType} onChange={handleChange}>
                  {['TradeConnect','bulk','contract','one-time'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="input-label">Category</label>
                <select className="input" name="category" value={form.category} onChange={handleChange}>
                  {['motors','semiconductors','defence','electronics','mechanical','other'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="input-label">Start Date</label><input className="input" type="date" name="startDate" value={form.startDate} onChange={handleChange} /></div>
              <div className="form-group"><label className="input-label">End Date</label><input className="input" type="date" name="endDate" value={form.endDate} onChange={handleChange} /></div>
            </div>
            <div className="form-group"><label className="input-label">Contract Terms</label><textarea className="input" name="contractTerms" rows={2} placeholder="Payment terms, delivery schedule..." value={form.contractTerms} onChange={handleChange} /></div>
            <div style={{background:'#fef3c7',padding:14,borderRadius:8,fontSize:13,color:'#92400e',marginBottom:16}}>
              💡 Platform commission: 1.5% of deal value. Your earning: ₹{form.totalValue ? (Number(form.totalValue)*0.985).toLocaleString() : '—'}
            </div>
            <button className="btn btn-primary" disabled={loading}>{loading?'Creating...':'Create Deal'}</button>
          </form>
        </div>
      )}

      <div className="card" style={{padding:24}}>
        {deals.length === 0 ? (
          <div className="empty-state"><p>No deals yet. Create your first TradeConnect deal to connect with companies.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Deal #</th><th>Title</th><th>Value</th><th>Your Earning</th><th>Buyer</th><th>Type</th><th>Status</th><th>Update Status</th></tr></thead>
              <tbody>
                {deals.map(d => (
                  <tr key={d._id}>
                    <td style={{fontSize:11}}>{d.dealNumber}</td>
                    <td><strong>{d.title}</strong><br/><span style={{fontSize:11,color:'var(--muted)'}}>{d.category}</span></td>
                    <td>₹{d.totalValue?.toLocaleString()}</td>
                    <td style={{color:'var(--success)'}}>₹{d.supplierEarning?.toLocaleString()}</td>
                    <td>{d.buyer?.company || d.buyer?.name || <span style={{color:'var(--muted)',fontSize:12}}>Open (seeking buyer)</span>}</td>
                    <td><span className="badge badge-blue">{d.dealType}</span></td>
                    <td><span className={`badge badge-${STATUS_COLORS[d.status]||'gray'}`}>{d.status}</span></td>
                    <td>
                      <select className="input" style={{width:130,padding:'5px 10px',fontSize:12}} value={d.status}
                        onChange={e=>updateStatus(d._id,e.target.value)}>
                        {['proposed','negotiating','agreed','in-progress','completed','cancelled'].map(s=><option key={s}>{s}</option>)}
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
