import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import { FiFilter, FiArrowRight, FiZap, FiBriefcase, FiCheck } from 'react-icons/fi';

const DEAL_TYPES = ['', 'TradeConnect', 'bulk', 'contract', 'one-time'];
const STATUS_MAP = { proposed: 'badge-gold', negotiating: 'badge-cyan', agreed: 'badge-blue', 'in-progress': 'badge-green', completed: 'badge-green', cancelled: 'badge-red' };

export default function DealBoard() {
  const [deals, setDeals] = useState([]);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    setLoading(true);
    API.get('/deals?status=proposed').then(({ data }) => {
      setDeals(data.deals || []);
      setLoading(false);
    });
  }, [type]);

  const joinDeal = async (id) => {
    setJoining(id);
    try {
      await API.put(`/deals/${id}/assign-buyer`);
      toast.success('🎉 Request sent! Supplier will contact you soon.');
      setDeals(d => d.filter(x => x._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join deal');
    } finally { setJoining(null); }
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header flex-between">
        <div>
          <h1>TradeConnect Deal Board 🤝</h1>
          <p>Open deals from verified suppliers — claim a deal to start negotiation</p>
        </div>
        <select className="input" style={{ width: 160 }} value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Types</option>
          {DEAL_TYPES.slice(1).map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Open Deals', val: deals.length, color: 'var(--accent)' },
          { label: 'Total Value', val: `€${Math.round(deals.reduce((s, d) => s + (d.totalValue || 0), 0) / 100000).toLocaleString()}L`, color: 'var(--cyan)' },
          { label: 'Categories', val: new Set(deals.map(d => d.category)).size, color: 'var(--green)' },
          { label: 'Verified Suppliers', val: deals.filter(d => d.supplier?.supplierInfo?.verified).length, color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} className="card stat-card">
            <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> :
        deals.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🤝</span>
            <h3>No open deals right now</h3>
            <p style={{ marginTop: 8 }}>Check back later — suppliers post new deals daily</p>
          </div>
        ) : (
          <div className="grid-2">
            {deals.map(d => (
              <div key={d._id} className="card card-hover anim-fade-up" style={{ padding: 24, cursor: 'default', borderColor: 'var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-gold">{d.dealType}</span>
                    <span className={`badge ${STATUS_MAP[d.status] || 'badge-gray'}`}>{d.status}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</span>
                </div>

                <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>{d.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>
                  {d.description?.slice(0, 130)}{d.description?.length > 130 ? '…' : ''}
                </p>

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Deal Value</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>€{d.totalValue?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Category</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{d.category}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--green)' }}>
                    {d.supplier?.company?.charAt(0) || d.supplier?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{d.supplier?.company || d.supplier?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {d.supplier?.supplierInfo?.verified ? '✓ Verified Supplier' : 'Supplier'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => joinDeal(d._id)}
                    disabled={joining === d._id}
                  >
                    {joining === d._id ? 'Sending…' : <><FiCheck /> Join This Deal</>}
                  </button>
                  <button className="btn btn-secondary btn-icon">
                    <FiBriefcase />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
