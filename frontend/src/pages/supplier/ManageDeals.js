import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { FiPlus } from 'react-icons/fi';

const EMPTY = {
  title: '', description: '', totalValue: '', dealType: 'b2b',
  category: 'motors', contractTerms: '', startDate: '', endDate: '',
};

const STATUS_COLORS = {
  proposed: 'yellow', negotiating: 'cyan', agreed: 'blue',
  'in-progress': 'green', completed: 'green', cancelled: 'red',
};

export default function ManageDeals() {
  const [deals,    setDeals]    = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [loading,  setLoading]  = useState(false);

  const fetchDeals = () => {
    API.get('/deals').then(({ data }) => setDeals(data.deals || [])).catch(() => {});
  };

  useEffect(() => { fetchDeals(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.totalValue) return toast.error('Title and deal value required');
    if (Number(form.totalValue) <= 0) return toast.error('Deal value must be greater than 0');
    setLoading(true);
    try {
      await API.post('/deals', { ...form, totalValue: Number(form.totalValue) });
      toast.success('Deal created successfully!');
      setForm(EMPTY); setShowForm(false); fetchDeals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating deal');
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/deals/${id}/status`, { status });
      toast.success('Deal status updated');
      fetchDeals();
    } catch { toast.error('Failed to update status'); }
  };

  const earning = form.totalValue ? (Number(form.totalValue) * 0.985).toLocaleString() : '—';

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header flex-between">
        <div>
          <h1>B2B Deals</h1>
          <p>Create and manage deals with companies and buyers</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm(s => !s)}>
          <FiPlus /> {showForm ? 'Cancel' : 'Create Deal'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <h3 style={{ fontFamily: 'Syne', marginBottom: 20 }}>New Deal Proposal</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="input-label">Deal Title *</label>
                <input className="input" name="title" placeholder="e.g. Bulk Motor Supply — 500 units"
                  value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="input-label">Total Deal Value (€) *</label>
                <input className="input" type="number" name="totalValue" min="1"
                  value={form.totalValue} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Description</label>
              <textarea className="input" name="description" rows={3}
                placeholder="Describe the deal — products, quantities, specs…"
                value={form.description} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="input-label">Deal Type</label>
                <select className="input" name="dealType" value={form.dealType} onChange={handleChange}>
                  {['b2b', 'bulk', 'contract', 'one-time'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label">Category</label>
                <select className="input" name="category" value={form.category} onChange={handleChange}>
                  {['motors', 'semiconductors', 'defence', 'electronics', 'mechanical', 'automation', 'hydraulics', 'sensors', 'other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="input-label">Start Date</label>
                <input className="input" type="date" name="startDate" value={form.startDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="input-label">End Date</label>
                <input className="input" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Contract Terms</label>
              <textarea className="input" name="contractTerms" rows={2}
                placeholder="Payment terms, delivery schedule, incoterms…"
                value={form.contractTerms} onChange={handleChange} />
            </div>

            <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', padding: 14, borderRadius: 8, fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
              💡 Platform commission: 1.5% of deal value.{' '}
              Your earning: <strong style={{ color: 'var(--green)' }}>€{earning}</strong>
            </div>

            <button className="btn btn-accent" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create Deal'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        {deals.length === 0 ? (
          <div className="empty-state">
            <p>No deals yet. Create your first B2B deal to connect with buyers.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Deal #</th>
                  <th>Title</th>
                  <th>Value (€)</th>
                  <th>Your Earning (€)</th>
                  <th>Buyer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {deals.map(d => (
                  <tr key={d._id}>
                    <td style={{ fontSize: 11 }}>{d.dealNumber}</td>
                    <td>
                      <strong>{d.title}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{d.category}</div>
                    </td>
                    <td>€{(d.totalValue || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 700 }}>
                      €{(d.supplierEarning || 0).toLocaleString()}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {d.buyer?.company || d.buyer?.name || (
                        <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Open (seeking buyer)</span>
                      )}
                    </td>
                    <td><span className="badge badge-blue">{d.dealType}</span></td>
                    <td>
                      <span className={`badge badge-${STATUS_COLORS[d.status] || 'gray'}`}>{d.status}</span>
                    </td>
                    <td>
                      <select className="input" style={{ width: 130, padding: '5px 10px', fontSize: 12 }}
                        value={d.status} onChange={e => updateStatus(d._id, e.target.value)}>
                        {['proposed', 'negotiating', 'agreed', 'in-progress', 'completed', 'cancelled'].map(s => (
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
