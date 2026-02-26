import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import "../certifications/Certifications.css";

const STAGE_OPTIONS = [
  { key: 'applied', label: 'Application Submitted' },
  { key: 'fee_paid', label: 'Fee Paid' },
  { key: 'docs_review', label: 'Docs Under Review' },
  { key: 'docs_additional', label: 'Additional Docs Needed' },
  { key: 'internal_audit', label: 'Internal Audit Report' },
  { key: 'scrutiny', label: 'Scrutiny Stage' },
  { key: 'external_audit', label: 'External Auditor Report' },
  { key: 'final_audit', label: 'Final Audit' },
  { key: 'approved', label: 'Certificate Issued' },
  { key: 'rejected', label: 'Rejected' },
];

const CERT_TYPE_LABELS = {
  iso9001_aqap: 'ISO 9001 + AQAP', en9100: 'EN 9100', ipc_aqap: 'IPC-A-610 + AQAP',
  iso17025: 'ISO 17025', nadcap: 'NADCAP', atex_iecex: 'ATEX/IECEx',
  mil_spec: 'MIL-SPEC', iso14001: 'ISO 14001',
};

const STAGE_COLOURS = {
  applied: '#94a3b8', fee_paid: '#c9a84c', docs_review: '#7dd3fc', docs_additional: '#f9a8d4',
  internal_audit: '#c4b5fd', scrutiny: '#fbbf24', external_audit: '#a78bfa', final_audit: '#34d399',
  approved: '#86efac', rejected: '#fca5a5',
};

export default function AdminCertifications() {
  const [tab, setTab] = useState('overview');
  const [dashData, setDashData] = useState(null);
  const [allCerts, setAllCerts] = useState([]);
  const [salesReport, setSalesReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [newStage, setNewStage] = useState('');
  const [stageNote, setStageNote] = useState('');
  const [newAdminNote, setNewAdminNote] = useState('');
  const [advancing, setAdvancing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const loadAll = async () => {
    try {
      const [dash, certs, sales] = await Promise.all([
        API.get('/certifications/admin/dashboard'),
        API.get(`/certifications/admin/all?status=${statusFilter}&stage=${stageFilter}`),
        API.get('/certifications/admin/sales-report'),
      ]);
      setDashData(dash.data.data);
      setAllCerts(certs.data.data || []);
      setSalesReport(sales.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [statusFilter, stageFilter]);

  const handleAdvanceStage = async () => {
    if (!newStage) return toast.error('Select a stage');
    setAdvancing(true);
    try {
      await API.patch(`/certifications/admin/${selectedCert._id}/advance-stage`, {
        stage: newStage,
        note: stageNote,
      });
      toast.success('Stage updated!');
      setSelectedCert(null);
      setNewStage('');
      setStageNote('');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setAdvancing(false);
    }
  };

  const handleAddNote = async (certId) => {
    if (!newAdminNote.trim()) return;
    try {
      await API.patch(`/certifications/admin/${certId}/add-note`, { note: newAdminNote });
      toast.success('Note added');
      setNewAdminNote('');
      if (selectedCert?._id === certId) {
        const res = await API.get(`/certifications/${certId}`);
        setSelectedCert(res.data.data);
      }
      loadAll();
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const handleFlagSales = async (certId, note) => {
    try {
      await API.patch(`/certifications/admin/${certId}/flag-sales`, { salesNote: note || 'Follow up required' });
      toast.success('Flagged for sales team');
      loadAll();
    } catch (err) {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="cert-loading"><div className="cert-spinner" /></div>;

  const stats = dashData?.stats || {};

  return (
    <div className="admin-cert-page">
      {/* Header */}
      <div className="admin-cert-header">
        <div>
          <div className="cert-page-tag">ADMIN · MODULE B</div>
          <h1 className="admin-cert-title">Certification Management</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 6 }}>
            Track all applications, advance stages, and generate sales intelligence.
          </p>
        </div>
        <div className="admin-cert-header__stats">
          {[
            { val: stats.total || 0, label: 'Total', color: '#e8e8e2' },
            { val: stats.active || 0, label: 'Active', color: '#c9a84c' },
            { val: stats.completed || 0, label: 'Certified', color: '#86efac' },
            { val: stats.salesFlagged || 0, label: 'Sales Flagged', color: '#fca5a5' },
          ].map(s => (
            <div key={s.label} className="admin-cert-stat">
              <span style={{ color: s.color, fontSize: 28, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif' }}>{s.val}</span>
              <span style={{ fontSize: 10, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-cert-tabs">
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'applications', label: '📋 All Applications' },
          { key: 'sales', label: '🎯 Sales Intelligence' },
        ].map(t => (
          <button key={t.key} className={`admin-cert-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && dashData && (
        <div className="admin-cert-overview">
          {/* Revenue card */}
          <div className="admin-cert-kpi-grid">
            <div className="admin-cert-kpi" style={{ '--kpi-color': '#c9a84c' }}>
              <div className="admin-cert-kpi__label">Total Revenue</div>
              <div className="admin-cert-kpi__val">€ {dashData.totalRevenue?.toLocaleString() || '0'}</div>
              <div className="admin-cert-kpi__sub">from paid assessment fees</div>
            </div>
            <div className="admin-cert-kpi" style={{ '--kpi-color': '#86efac' }}>
              <div className="admin-cert-kpi__label">Certificates Issued</div>
              <div className="admin-cert-kpi__val">{stats.completed}</div>
              <div className="admin-cert-kpi__sub">active certifications</div>
            </div>
            <div className="admin-cert-kpi" style={{ '--kpi-color': '#7dd3fc' }}>
              <div className="admin-cert-kpi__label">In Progress</div>
              <div className="admin-cert-kpi__val">{stats.active}</div>
              <div className="admin-cert-kpi__sub">awaiting action</div>
            </div>
            <div className="admin-cert-kpi" style={{ '--kpi-color': '#fca5a5' }}>
              <div className="admin-cert-kpi__label">Uncertified Users</div>
              <div className="admin-cert-kpi__val">{dashData.uncertifiedUsers?.length || 0}</div>
              <div className="admin-cert-kpi__sub">sales opportunity</div>
            </div>
          </div>

          {/* By stage breakdown */}
          <div className="admin-cert-breakdown-grid">
            <div className="admin-cert-breakdown-card">
              <h3 className="admin-cert-card-title">Applications by Stage</h3>
              <div className="admin-cert-stage-bars">
                {(dashData.byStage || []).sort((a, b) => b.count - a.count).map(s => {
                  const stageInfo = STAGE_OPTIONS.find(st => st.key === s._id);
                  const max = Math.max(...(dashData.byStage || []).map(x => x.count), 1);
                  return (
                    <div key={s._id} className="admin-cert-stage-bar-row">
                      <span className="admin-cert-stage-bar-label">{stageInfo?.label || s._id}</span>
                      <div className="admin-cert-stage-bar-track">
                        <div className="admin-cert-stage-bar-fill"
                          style={{ width: `${(s.count / max) * 100}%`, background: STAGE_COLOURS[s._id] || '#4b5563' }} />
                      </div>
                      <span className="admin-cert-stage-bar-count">{s.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="admin-cert-breakdown-card">
              <h3 className="admin-cert-card-title">Revenue by Certification Type</h3>
              <div className="admin-cert-type-list">
                {(dashData.byType || []).sort((a, b) => b.revenue - a.revenue).map(t => (
                  <div key={t._id} className="admin-cert-type-row">
                    <span className="admin-cert-type-name">{CERT_TYPE_LABELS[t._id] || t._id}</span>
                    <div className="admin-cert-type-right">
                      <span className="admin-cert-type-count">{t.count} apps</span>
                      <span className="admin-cert-type-rev" style={{ color: '#c9a84c' }}>€ {t.revenue?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent applications */}
          <div className="admin-cert-recent">
            <h3 className="admin-cert-card-title">Recent Applications</h3>
            <div className="admin-cert-recent-list">
              {(dashData.recentApps || []).map(app => (
                <div key={app._id} className="admin-cert-recent-row" onClick={() => setSelectedCert(app)}>
                  <div>
                    <div className="admin-cert-recent-name">{app.applicant?.name || app.applicantName}</div>
                    <div className="admin-cert-recent-company">{app.applicant?.company || app.companyName}</div>
                  </div>
                  <div className="admin-cert-recent-cert">{app.certName}</div>
                  <div className="admin-cert-recent-stage" style={{ color: STAGE_COLOURS[app.currentStage] }}>
                    {STAGE_OPTIONS.find(s => s.key === app.currentStage)?.label || app.currentStage}
                  </div>
                  <span style={{ color: '#c9a84c', fontSize: 14 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── APPLICATIONS TAB ── */}
      {tab === 'applications' && (
        <div className="admin-cert-apps">
          {/* Filters */}
          <div className="admin-cert-filters">
            <select className="admin-cert-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="on_hold">On Hold</option>
            </select>
            <select className="admin-cert-select" value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
              <option value="">All Stages</option>
              {STAGE_OPTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>

          <div className="admin-cert-table-wrap">
            <table className="admin-cert-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Company</th>
                  <th>Certification</th>
                  <th>Current Stage</th>
                  <th>Progress</th>
                  <th>Fee</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allCerts.map(cert => (
                  <tr key={cert._id}>
                    <td>
                      <div className="admin-cert-applicant">
                        <div className="admin-cert-applicant__avatar">
                          {(cert.applicantName || cert.applicant?.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{cert.applicantName || cert.applicant?.name}</div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>{cert.applicantEmail || cert.applicant?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: '#9ca3af' }}>{cert.companyName}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{cert.certName}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{cert.certCategory}</div>
                    </td>
                    <td>
                      <span className="admin-cert-stage-chip"
                        style={{ color: STAGE_COLOURS[cert.currentStage], background: STAGE_COLOURS[cert.currentStage] + '18', borderColor: STAGE_COLOURS[cert.currentStage] + '40' }}>
                        {STAGE_OPTIONS.find(s => s.key === cert.currentStage)?.label || cert.currentStage}
                      </span>
                    </td>
                    <td>
                      <div className="admin-cert-mini-prog">
                        <div className="admin-cert-mini-prog__fill" style={{ width: `${cert.progressPercent}%`, background: cert.status === 'completed' ? '#86efac' : '#c9a84c' }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#6b7280' }}>{cert.progressPercent}%</span>
                    </td>
                    <td>
                      {cert.feePaid
                        ? <span style={{ color: '#86efac', fontSize: 12, fontWeight: 700 }}>✓ Paid</span>
                        : <span style={{ color: '#fca5a5', fontSize: 12 }}>Pending</span>}
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>
                      {new Date(cert.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="admin-cert-action-btn admin-cert-action-btn--primary" onClick={() => setSelectedCert(cert)}>
                          Manage
                        </button>
                        <button className="admin-cert-action-btn" onClick={() => handleFlagSales(cert._id, 'Follow up required')}>
                          🎯
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allCerts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: '#4b5563' }}>No applications found</div>
            )}
          </div>
        </div>
      )}

      {/* ── SALES INTELLIGENCE TAB ── */}
      {tab === 'sales' && (
        <div className="admin-cert-sales">
          <div className="admin-cert-sales-header">
            <div>
              <h2 className="admin-cert-card-title" style={{ fontSize: 22 }}>🎯 Sales Intelligence Report</h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                Users ranked by certification gaps. Highest priority = most missing key certifications.
              </p>
            </div>
            <button className="cert-primary-btn" onClick={() => toast.info('Export feature coming soon')}>
              📥 Export CSV
            </button>
          </div>

          <div className="admin-cert-sales-table-wrap">
            <table className="admin-cert-table">
              <thead>
                <tr>
                  <th>User / Company</th>
                  <th>Role</th>
                  <th>Certifications</th>
                  <th>Missing Key Certs</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.slice(0, 40).map((row, i) => (
                  <tr key={row.user.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{row.user.name}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{row.user.email}</div>
                      {row.user.company && <div style={{ fontSize: 11, color: '#9ca3af' }}>🏢 {row.user.company}</div>}
                    </td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: row.user.role === 'supplier' ? '#86efac' : '#7dd3fc' }}>
                        {row.user.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#86efac' }}>✅ {row.completedCerts} certified</span>
                        {row.activeCerts > 0 && <span style={{ fontSize: 12, color: '#c9a84c' }}>🔄 {row.activeCerts} active</span>}
                        {row.completedCerts === 0 && row.activeCerts === 0 && (
                          <span style={{ fontSize: 12, color: '#fca5a5' }}>⚠️ None</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {row.missingKeyCerts.map(c => (
                          <span key={c} className="admin-cert-missing-chip">{CERT_TYPE_LABELS[c] || c}</span>
                        ))}
                        {row.missingKeyCerts.length === 0 && (
                          <span style={{ fontSize: 12, color: '#86efac' }}>All key certs covered</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={`admin-cert-priority admin-cert-priority--${row.priorityScore >= 40 ? 'high' : row.priorityScore >= 20 ? 'medium' : 'low'}`}>
                        {row.priorityScore >= 40 ? '🔴 High' : row.priorityScore >= 20 ? '🟡 Medium' : '🟢 Low'}
                      </div>
                    </td>
                    <td>
                      <button
                        className="admin-cert-action-btn admin-cert-action-btn--primary"
                        onClick={() => toast.info(`Contact ${row.user.name} — ${row.user.email}`)}
                      >
                        📧 Contact
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MANAGE CERT MODAL ── */}
      {selectedCert && (
        <div className="cert-modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="cert-modal cert-modal--wide" onClick={e => e.stopPropagation()}>
            <button className="cert-modal__close" onClick={() => setSelectedCert(null)}>✕</button>
            <div className="cert-modal__cat">Manage Application</div>
            <h2 className="cert-modal__name" style={{ marginBottom: 4 }}>{selectedCert.certName}</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
              {selectedCert.companyName || selectedCert.applicantName} · Applied {new Date(selectedCert.createdAt).toLocaleDateString('en-GB')}
            </p>

            {/* Current stage info */}
            <div className="cert-modal-current-stage">
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Stage</span>
              <span className="admin-cert-stage-chip" style={{ marginLeft: 12, color: STAGE_COLOURS[selectedCert.currentStage], background: STAGE_COLOURS[selectedCert.currentStage] + '18', borderColor: STAGE_COLOURS[selectedCert.currentStage] + '40' }}>
                {STAGE_OPTIONS.find(s => s.key === selectedCert.currentStage)?.label}
              </span>
              <span style={{ marginLeft: 12, fontSize: 12, color: '#c9a84c' }}>{selectedCert.progressPercent}% complete</span>
            </div>

            {/* Advance stage */}
            <div className="cert-modal-section">
              <div className="cert-modal-section-title">Advance to Stage</div>
              <select className="admin-cert-select" style={{ width: '100%' }} value={newStage} onChange={e => setNewStage(e.target.value)}>
                <option value="">-- Select new stage --</option>
                {STAGE_OPTIONS.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <textarea className="cert-modal-textarea" placeholder="Add a note for the applicant (optional)…"
                value={stageNote} onChange={e => setStageNote(e.target.value)} rows={3} />
              <button className="cert-primary-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                onClick={handleAdvanceStage} disabled={advancing || !newStage}>
                {advancing ? 'Updating…' : '→ Advance Stage'}
              </button>
            </div>

            {/* Add admin note */}
            <div className="cert-modal-section">
              <div className="cert-modal-section-title">Add Note (visible to applicant)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="cert-modal-input" placeholder="Enter note…"
                  value={newAdminNote} onChange={e => setNewAdminNote(e.target.value)} />
                <button className="cert-primary-btn" onClick={() => handleAddNote(selectedCert._id)}>Add</button>
              </div>
            </div>

            {/* Existing notes */}
            {selectedCert.adminNotes?.length > 0 && (
              <div className="cert-modal-section">
                <div className="cert-modal-section-title">Existing Notes</div>
                {selectedCert.adminNotes.map((n, i) => (
                  <div key={i} className="cert-admin-note">
                    <div className="cert-admin-note__text">{n.note}</div>
                    <div className="cert-admin-note__meta">{n.createdBy} · {new Date(n.createdAt).toLocaleDateString('en-GB')}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="admin-cert-action-btn" style={{ flex: 1, padding: '10px' }}
                onClick={() => handleFlagSales(selectedCert._id, 'Follow up required from admin')}>
                🎯 Flag for Sales Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
