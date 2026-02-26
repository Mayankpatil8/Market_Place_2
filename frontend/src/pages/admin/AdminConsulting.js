import React, { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import "../consulting/Consulting.css";

const STAGE_OPTIONS = [
  { key: 'inquiry',   label: 'Enquiry Received' },
  { key: 'scoping',   label: 'Scoping Call Scheduled' },
  { key: 'proposal',  label: 'Proposal Sent' },
  { key: 'signed',    label: 'Engagement Signed' },
  { key: 'discovery', label: 'Discovery & Assessment' },
  { key: 'delivery',  label: 'Delivery In Progress' },
  { key: 'review',    label: 'Client Review' },
  { key: 'completed', label: 'Engagement Complete' },
  { key: 'follow_up', label: 'Follow-Up / Expansion' },
];

const STAGE_COLOURS = {
  inquiry: '#94a3b8', scoping: '#7dd3fc', proposal: '#c4b5fd', signed: '#c9a84c',
  discovery: '#fbbf24', delivery: '#f97316', review: '#a78bfa', completed: '#86efac', follow_up: '#34d399',
};

const NEED_CATEGORIES = [
  { id: 'supply_chain_weak',  label: 'Weak Supply Chain',          serviceId: 'supply_chain',           urgency: 'high' },
  { id: 'no_sales_process',   label: 'No Formal Sales Process',    serviceId: 'sales_strategy',         urgency: 'high' },
  { id: 'no_eu_presence',     label: 'No EU Market Presence',      serviceId: 'market_entry',           urgency: 'medium' },
  { id: 'low_oee',            label: 'Low OEE / High Scrap',       serviceId: 'operations_excellence',  urgency: 'high' },
  { id: 'no_erp',             label: 'No ERP / Manual Processes',  serviceId: 'digital_transformation', urgency: 'medium' },
  { id: 'funding_gap',        label: 'Funding / Growth Gap',       serviceId: 'financial_advisory',     urgency: 'high' },
  { id: 'talent_gap',         label: 'Team / Talent Gap',          serviceId: 'hr_talent',              urgency: 'medium' },
  { id: 'no_esg',             label: 'No ESG Programme',           serviceId: 'esg_sustainability',     urgency: 'low' },
];

const SERVICE_OPTIONS = [
  { id: 'supply_chain',          name: 'Supply Chain Optimisation' },
  { id: 'sales_strategy',        name: 'Sales & Revenue Strategy' },
  { id: 'market_entry',          name: 'European Market Entry' },
  { id: 'operations_excellence', name: 'Operational Excellence' },
  { id: 'digital_transformation',name: 'Digital Transformation' },
  { id: 'financial_advisory',    name: 'Financial & Growth Advisory' },
  { id: 'hr_talent',             name: 'HR & Talent Development' },
  { id: 'esg_sustainability',    name: 'ESG & Sustainability' },
];

const URGENCY_COLOURS = { high: '#fca5a5', medium: '#fbbf24', low: '#86efac' };

export default function AdminConsulting() {
  const [tab, setTab]               = useState('intelligence');
  const [dashData, setDashData]     = useState(null);
  const [allEngs, setAllEngs]       = useState([]);
  const [intelligence, setIntel]    = useState(null);
  const [allUsers, setAllUsers]     = useState([]);
  const [loading, setLoading]       = useState(true);

  // Manage engagement modal
  const [selectedEng, setSelectedEng]   = useState(null);
  const [newStage, setNewStage]         = useState('');
  const [stageNote, setStageNote]       = useState('');
  const [adminNote, setAdminNote]       = useState('');
  const [advancing, setAdvancing]       = useState(false);

  // Gap profile modal
  const [gapUser, setGapUser]           = useState(null);
  const [gapSelections, setGapSelections] = useState([]);
  const [salesOwner, setSalesOwner]     = useState('');
  const [nextAction, setNextAction]     = useState('');
  const [savingGap, setSavingGap]       = useState(false);

  // Custom solution modal
  const [customModal, setCustomModal]   = useState(false);
  const [customClient, setCustomClient] = useState('');
  const [customService, setCustomService] = useState('');
  const [customFee, setCustomFee]       = useState('');
  const [customScope, setCustomScope]   = useState('');
  const [customPriority, setCustomPriority] = useState('high');
  const [creatingCustom, setCreatingCustom] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, engsRes, intelRes, usersRes] = await Promise.all([
        API.get('/consulting/admin/dashboard'),
        API.get('/consulting/admin/all'),
        API.get('/consulting/admin/intelligence'),
        API.get('/consulting/admin/users-for-gap'),
      ]);
      setDashData(dashRes.data.data);
      setAllEngs(engsRes.data.data || []);
      setIntel(intelRes.data.data);
      setAllUsers(usersRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleAdvance = async () => {
    if (!newStage) return toast.error('Select a stage');
    setAdvancing(true);
    try {
      await API.patch(`/consulting/admin/${selectedEng._id}/advance-stage`, { stage: newStage, note: stageNote });
      toast.success('Stage updated');
      setSelectedEng(null); setNewStage(''); setStageNote('');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setAdvancing(false); }
  };

  const handleAddNote = async (engId) => {
    if (!adminNote.trim()) return;
    try {
      await API.patch(`/consulting/admin/${engId}/add-note`, { note: adminNote });
      toast.success('Note added');
      setAdminNote('');
      loadAll();
    } catch { toast.error('Failed'); }
  };

  const openGapModal = (user, existingProfile) => {
    setGapUser({ user, existingProfile });
    const existing = existingProfile?.gaps?.map(g => ({
      categoryId: g.categoryId, serviceId: g.serviceId, urgency: g.urgency,
      label: g.label, notes: g.notes || '',
    })) || [];
    setGapSelections(existing);
    setSalesOwner(existingProfile?.salesOwner || '');
    setNextAction(existingProfile?.nextAction || '');
  };

  const toggleGap = (cat) => {
    const exists = gapSelections.find(g => g.categoryId === cat.id);
    if (exists) {
      setGapSelections(prev => prev.filter(g => g.categoryId !== cat.id));
    } else {
      setGapSelections(prev => [...prev, {
        categoryId: cat.id, serviceId: cat.serviceId,
        urgency: cat.urgency, label: cat.label, notes: '',
      }]);
    }
  };

  const saveGapProfile = async () => {
    if (!gapUser) return;
    setSavingGap(true);
    try {
      await API.post('/consulting/admin/gap-profiles', {
        userId: gapUser.user._id,
        gaps: gapSelections,
        salesOwner,
        nextAction,
      });
      toast.success(`Gap profile saved for ${gapUser.user.name}`);
      setGapUser(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSavingGap(false); }
  };

  const createCustomSolution = async () => {
    if (!customClient || !customService) return toast.error('Select client and service');
    setCreatingCustom(true);
    try {
      await API.post('/consulting/admin/custom-solution', {
        clientId: customClient,
        serviceId: customService,
        quotedFee: Number(customFee) || undefined,
        scopeNotes: customScope,
        priority: customPriority,
      });
      toast.success('Custom solution created and visible to client');
      setCustomModal(false);
      setCustomClient(''); setCustomService(''); setCustomFee(''); setCustomScope('');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setCreatingCustom(false); }
  };

  if (loading) return <div className="con-loading"><div className="con-spinner" /></div>;

  const stats = dashData?.stats || {};

  return (
    <div className="admin-con-page">

      {/* Header */}
      <div className="admin-con-header">
        <div>
          <div className="con-module-tag">ADMIN · MODULE C</div>
          <h1 className="admin-con-title">Consulting Management</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 6 }}>
            Intelligence dashboard, gap profiling, and custom solution builder for the sales team.
          </p>
        </div>
        <div className="admin-con-header-actions">
          <div className="admin-con-kpi-strip">
            {[
              { val: stats.total || 0,        label: 'Total',          c: '#e8e8e2' },
              { val: stats.active || 0,        label: 'Active',         c: '#c9a84c' },
              { val: stats.completed || 0,     label: 'Completed',      c: '#86efac' },
              { val: stats.salesFlagged || 0,  label: 'Sales Flagged',  c: '#fca5a5' },
              { val: intelligence?.highPriority || 0, label: 'High Priority Gaps', c: '#f97316' },
            ].map(s => (
              <div key={s.label} className="admin-con-kpi">
                <span style={{ color: s.c, fontSize: 28, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif' }}>{s.val}</span>
                <span style={{ fontSize: 9, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <button className="con-btn-primary" onClick={() => setCustomModal(true)}>
            🎯 Create Custom Solution
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-con-tabs">
        {[
          { key: 'intelligence', label: '🧠 Sales Intelligence' },
          { key: 'engagements',  label: '📋 All Engagements' },
          { key: 'gaps',         label: '🔍 Gap Profiles' },
        ].map(t => (
          <button
            key={t.key}
            className={`admin-con-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────
          TAB: SALES INTELLIGENCE
      ───────────────────────────────────── */}
      {tab === 'intelligence' && intelligence && (
        <div className="admin-con-body">

          {/* Service demand heatmap */}
          <div className="intel-section">
            <div className="intel-section-header">
              <h2 className="intel-title">Service Demand by Gap Analysis</h2>
              <p className="intel-desc">Based on gap profiles created by the sales team. Shows which services are most needed across your client base.</p>
            </div>
            <div className="intel-service-grid">
              {intelligence.serviceNeeds?.map(sn => (
                <div
                  key={sn.service.id}
                  className="intel-service-card"
                  style={{ '--svc-color': sn.service.colour || '#c9a84c' }}
                >
                  <div className="intel-service-card__top">
                    <span className="intel-service-card__icon">{sn.service.icon}</span>
                    <div>
                      <div className="intel-service-card__name">{sn.service.name}</div>
                      <div className="intel-service-card__cat">{sn.service.category}</div>
                    </div>
                    <div className="intel-service-card__count"
                      style={{ color: sn.count > 0 ? sn.service.colour || '#c9a84c' : '#374151' }}>
                      {sn.count}
                    </div>
                  </div>

                  {sn.count > 0 && (
                    <>
                      <div className="intel-service-card__bar-track">
                        <div
                          className="intel-service-card__bar-fill"
                          style={{
                            width: `${Math.min((sn.count / Math.max(...intelligence.serviceNeeds.map(x => x.count), 1)) * 100, 100)}%`,
                            background: sn.service.colour || '#c9a84c',
                          }}
                        />
                      </div>
                      <div className="intel-service-card__clients">
                        {sn.clients.slice(0, 3).map((c, i) => (
                          <div key={i} className="intel-service-card__client">
                            <span className="intel-service-card__client-name">{c.company || c.name}</span>
                            <span className={`intel-urgency intel-urgency--${c.urgency}`}>{c.urgency}</span>
                          </div>
                        ))}
                        {sn.clients.length > 3 && (
                          <div style={{ fontSize: 11, color: '#4b5563' }}>+{sn.clients.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}

                  {sn.count === 0 && (
                    <div style={{ fontSize: 12, color: '#374151', marginTop: 8 }}>No gaps identified yet</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Priority client list */}
          <div className="intel-section">
            <div className="intel-section-header">
              <h2 className="intel-title">Priority Opportunity List</h2>
              <p className="intel-desc">Clients ranked by gap score. Highest score = most business development opportunity. Create gap profiles or custom solutions directly.</p>
            </div>
            <div className="admin-con-table-wrap">
              <table className="admin-con-table">
                <thead>
                  <tr>
                    <th>Client / Company</th>
                    <th>Role</th>
                    <th>Identified Gaps</th>
                    <th>Active Engagement</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {intelligence.opportunityList?.map(row => (
                    <tr key={row._id || row.user?._id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#e8e8e2' }}>{row.userName || row.user?.name}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{row.userEmail || row.user?.email}</div>
                        {row.companyName && <div style={{ fontSize: 11, color: '#9ca3af' }}>🏢 {row.companyName}</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                          color: (row.companyRole || row.user?.role) === 'supplier' ? '#86efac' : '#7dd3fc' }}>
                          {row.companyRole || row.user?.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {(row.gaps || []).filter(g => !g.addressed).map(g => (
                            <span key={g.categoryId} className="intel-gap-chip"
                              style={{ borderColor: URGENCY_COLOURS[g.urgency] + '40', color: URGENCY_COLOURS[g.urgency] }}>
                              {g.label}
                            </span>
                          ))}
                          {(!row.gaps || row.gaps.length === 0) && (
                            <span style={{ fontSize: 11, color: '#374151' }}>No profile yet</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {row.hasActiveEngagement
                          ? <span style={{ fontSize: 12, color: '#86efac', fontWeight: 700 }}>✅ Yes</span>
                          : <span style={{ fontSize: 12, color: '#fca5a5' }}>No</span>}
                      </td>
                      <td>
                        <span className={`intel-priority intel-priority--${row.priorityScore >= 45 ? 'high' : row.priorityScore >= 20 ? 'medium' : 'low'}`}>
                          {row.priorityScore >= 45 ? '🔴 High' : row.priorityScore >= 20 ? '🟡 Medium' : '🟢 Low'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="admin-con-btn" onClick={() => openGapModal(row.user || { _id: row.user?._id, name: row.userName, email: row.userEmail, company: row.companyName, role: row.companyRole }, row)}>
                            Edit Gaps
                          </button>
                          <button className="admin-con-btn admin-con-btn--gold" onClick={() => {
                            setCustomModal(true);
                            setCustomClient(row.user?._id || '');
                          }}>
                            🎯 Custom
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {intelligence.opportunityList?.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#4b5563' }}>
                      No gap profiles created yet. Start by profiling clients on the Gap Profiles tab.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────
          TAB: ALL ENGAGEMENTS
      ───────────────────────────────────── */}
      {tab === 'engagements' && (
        <div className="admin-con-body">
          <div className="admin-con-table-wrap">
            <table className="admin-con-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Stage</th>
                  <th>Progress</th>
                  <th>Fee</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allEngs.map(eng => (
                  <tr key={eng._id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#e8e8e2' }}>{eng.clientName}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{eng.companyName}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{eng.serviceName}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{eng.serviceCategory}</div>
                    </td>
                    <td>
                      <span className="admin-con-stage-chip"
                        style={{ color: STAGE_COLOURS[eng.currentStage], background: STAGE_COLOURS[eng.currentStage] + '18', borderColor: STAGE_COLOURS[eng.currentStage] + '40' }}>
                        {STAGE_OPTIONS.find(s => s.key === eng.currentStage)?.label || eng.currentStage}
                      </span>
                    </td>
                    <td>
                      <div className="admin-con-mini-prog">
                        <div className="admin-con-mini-prog__fill"
                          style={{ width: `${eng.progressPercent}%`, background: eng.status === 'completed' ? '#86efac' : '#c9a84c' }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#6b7280' }}>{eng.progressPercent}%</span>
                    </td>
                    <td style={{ fontSize: 13, color: '#9ca3af' }}>
                      {eng.quotedFee ? `€ ${eng.quotedFee.toLocaleString()}` : '—'}
                    </td>
                    <td>
                      {eng.isCustomSolution
                        ? <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 700, background: 'rgba(201,168,76,0.1)', padding: '3px 8px', borderRadius: 2 }}>🎯 Custom</span>
                        : <span style={{ fontSize: 10, color: '#6b7280' }}>Standard</span>}
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>
                      {new Date(eng.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      <button className="admin-con-btn admin-con-btn--gold" onClick={() => setSelectedEng(eng)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {allEngs.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#4b5563' }}>
                    No engagements yet
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────
          TAB: GAP PROFILES
      ───────────────────────────────────── */}
      {tab === 'gaps' && (
        <div className="admin-con-body">
          <div className="intel-section-header" style={{ marginBottom: 24 }}>
            <h2 className="intel-title">Client Gap Profiles</h2>
            <p className="intel-desc">
              Profile each client's business weaknesses to enable targeted consulting recommendations. Select a client below to create or update their gap profile.
            </p>
          </div>

          <div className="gap-profile-grid">
            {allUsers.map(user => {
              const profile = intelligence?.opportunityList?.find(p => p.user?._id?.toString() === user._id?.toString() || p._id === user._id?.toString());
              const gapCount = profile?.gaps?.filter(g => !g.addressed).length || 0;
              const score = profile?.priorityScore || 0;

              return (
                <div key={user._id} className="gap-user-card">
                  <div className="gap-user-card__top">
                    <div className="gap-user-card__avatar">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div className="gap-user-card__info">
                      <div className="gap-user-card__name">{user.name}</div>
                      <div className="gap-user-card__company">{user.company || user.email}</div>
                      <span className={`gap-user-card__role gap-user-card__role--${user.role}`}>{user.role}</span>
                    </div>
                    <div className="gap-user-card__score"
                      style={{ color: score >= 45 ? '#fca5a5' : score >= 20 ? '#fbbf24' : '#86efac' }}>
                      {score}
                    </div>
                  </div>

                  {gapCount > 0 ? (
                    <div className="gap-user-card__gaps">
                      {profile.gaps.filter(g => !g.addressed).slice(0, 3).map(g => (
                        <span key={g.categoryId} className="intel-gap-chip"
                          style={{ borderColor: URGENCY_COLOURS[g.urgency] + '50', color: URGENCY_COLOURS[g.urgency], fontSize: 10 }}>
                          {g.label}
                        </span>
                      ))}
                      {gapCount > 3 && <span style={{ fontSize: 10, color: '#4b5563' }}>+{gapCount - 3}</span>}
                    </div>
                  ) : (
                    <div className="gap-user-card__no-gaps">No gaps profiled</div>
                  )}

                  <div className="gap-user-card__actions">
                    <button className="admin-con-btn admin-con-btn--gold" style={{ flex: 1 }}
                      onClick={() => openGapModal(user, profile)}>
                      {gapCount > 0 ? 'Edit Profile' : '+ Create Profile'}
                    </button>
                    <button className="admin-con-btn" onClick={() => { setCustomModal(true); setCustomClient(user._id); }}>
                      🎯
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MODAL: MANAGE ENGAGEMENT
      ═══════════════════════════════════════ */}
      {selectedEng && (
        <div className="con-modal-overlay" onClick={() => setSelectedEng(null)}>
          <div className="con-modal con-modal--wide" onClick={e => e.stopPropagation()}>
            <button className="con-modal__close" onClick={() => setSelectedEng(null)}>✕</button>
            <div className="con-modal__cat">Manage Engagement</div>
            <h2 className="con-modal__name" style={{ marginBottom: 4 }}>{selectedEng.serviceName}</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              {selectedEng.companyName} · {selectedEng.clientName}
            </p>

            <div className="con-modal-current">
              <span style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Current Stage</span>
              <span className="admin-con-stage-chip" style={{
                marginLeft: 12, color: STAGE_COLOURS[selectedEng.currentStage],
                background: STAGE_COLOURS[selectedEng.currentStage] + '18',
                borderColor: STAGE_COLOURS[selectedEng.currentStage] + '40',
              }}>
                {STAGE_OPTIONS.find(s => s.key === selectedEng.currentStage)?.label}
              </span>
            </div>

            {/* Advance stage */}
            <div className="con-modal-section">
              <div className="con-modal-section-title">Advance to Stage</div>
              <select className="con-select" style={{ width: '100%' }} value={newStage} onChange={e => setNewStage(e.target.value)}>
                <option value="">-- Select --</option>
                {STAGE_OPTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <textarea className="con-textarea" rows={3} placeholder="Note for the client (optional)…"
                value={stageNote} onChange={e => setStageNote(e.target.value)} style={{ marginTop: 8 }} />
              <button className="con-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                onClick={handleAdvance} disabled={advancing || !newStage}>
                {advancing ? 'Updating…' : '→ Advance Stage'}
              </button>
            </div>

            {/* Add note */}
            <div className="con-modal-section">
              <div className="con-modal-section-title">Add Note (visible to client)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="con-input" placeholder="Note…" value={adminNote} onChange={e => setAdminNote(e.target.value)} />
                <button className="con-btn-primary" onClick={() => handleAddNote(selectedEng._id)}>Add</button>
              </div>
            </div>

            {/* Existing notes */}
            {selectedEng.adminNotes?.length > 0 && (
              <div className="con-modal-section">
                <div className="con-modal-section-title">Existing Notes</div>
                {selectedEng.adminNotes.map((n, i) => (
                  <div key={i} className="con-note-item">
                    <p className="con-note-text">{n.note}</p>
                    <p className="con-note-meta">{n.createdBy} · {new Date(n.createdAt).toLocaleDateString('en-GB')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MODAL: GAP PROFILE EDITOR
      ═══════════════════════════════════════ */}
      {gapUser && (
        <div className="con-modal-overlay" onClick={() => setGapUser(null)}>
          <div className="con-modal con-modal--wide" onClick={e => e.stopPropagation()}>
            <button className="con-modal__close" onClick={() => setGapUser(null)}>✕</button>
            <div className="con-modal__cat">Gap Profile</div>
            <h2 className="con-modal__name" style={{ marginBottom: 4 }}>{gapUser.user?.name}</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
              {gapUser.user?.company || gapUser.user?.email} · {gapUser.user?.role}
            </p>

            <div className="con-modal-section">
              <div className="con-modal-section-title">Identify Business Gaps</div>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
                Select all areas where this client's business is underperforming or missing capability. This will prioritise them for consulting outreach.
              </p>
              <div className="gap-selector-grid">
                {NEED_CATEGORIES.map(cat => {
                  const selected = gapSelections.find(g => g.categoryId === cat.id);
                  return (
                    <div
                      key={cat.id}
                      className={`gap-selector-chip ${selected ? 'gap-selector-chip--selected' : ''}`}
                      style={selected ? { borderColor: URGENCY_COLOURS[cat.urgency] + '80', background: URGENCY_COLOURS[cat.urgency] + '12' } : {}}
                      onClick={() => toggleGap(cat)}
                    >
                      <div className="gap-selector-chip__label">{cat.label}</div>
                      <div className="gap-selector-chip__urgency" style={{ color: URGENCY_COLOURS[cat.urgency] }}>
                        {cat.urgency} urgency
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {gapSelections.length > 0 && (
              <div className="con-modal-section">
                <div className="con-modal-section-title">Selected: {gapSelections.length} gaps identified</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {gapSelections.map(g => (
                    <span key={g.categoryId} className="intel-gap-chip"
                      style={{ color: URGENCY_COLOURS[g.urgency], borderColor: URGENCY_COLOURS[g.urgency] + '50' }}>
                      {g.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="con-modal-section">
              <div className="con-form-row">
                <div className="con-form-group">
                  <label className="con-label">Sales Owner</label>
                  <input className="con-input" placeholder="Your name" value={salesOwner} onChange={e => setSalesOwner(e.target.value)} />
                </div>
                <div className="con-form-group">
                  <label className="con-label">Next Action</label>
                  <input className="con-input" placeholder="e.g. Schedule discovery call" value={nextAction} onChange={e => setNextAction(e.target.value)} />
                </div>
              </div>
            </div>

            <button className="con-btn-primary" style={{ width: '100%', justifyContent: 'center' }}
              onClick={saveGapProfile} disabled={savingGap}>
              {savingGap ? 'Saving…' : '✓ Save Gap Profile'}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MODAL: CREATE CUSTOM SOLUTION
      ═══════════════════════════════════════ */}
      {customModal && (
        <div className="con-modal-overlay" onClick={() => setCustomModal(false)}>
          <div className="con-modal con-modal--wide" onClick={e => e.stopPropagation()}>
            <button className="con-modal__close" onClick={() => setCustomModal(false)}>✕</button>
            <div className="con-modal__cat">Sales Team</div>
            <h2 className="con-modal__name">Create Custom Solution</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.7 }}>
              Build a tailored consulting proposal for a specific client. It will appear in their portal as a custom solution prepared by the team.
            </p>

            <div className="con-modal-section">
              <div className="con-form-row">
                <div className="con-form-group">
                  <label className="con-label">Client *</label>
                  <select className="con-select" value={customClient} onChange={e => setCustomClient(e.target.value)}>
                    <option value="">Select client…</option>
                    {allUsers.map(u => (
                      <option key={u._id} value={u._id}>{u.name} — {u.company || u.email}</option>
                    ))}
                  </select>
                </div>
                <div className="con-form-group">
                  <label className="con-label">Service *</label>
                  <select className="con-select" value={customService} onChange={e => setCustomService(e.target.value)}>
                    <option value="">Select service…</option>
                    {SERVICE_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="con-form-row">
                <div className="con-form-group">
                  <label className="con-label">Custom Fee (€)</label>
                  <input className="con-input" type="number" placeholder="Leave blank for standard fee"
                    value={customFee} onChange={e => setCustomFee(e.target.value)} />
                </div>
                <div className="con-form-group">
                  <label className="con-label">Priority</label>
                  <select className="con-select" value={customPriority} onChange={e => setCustomPriority(e.target.value)}>
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="normal">🟡 Normal</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="con-form-group">
                <label className="con-label">Custom Scope / Proposal Notes</label>
                <textarea className="con-textarea" rows={5}
                  placeholder="Describe the specific challenge this client faces and how this engagement will address it. This will be visible to the client as the proposal."
                  value={customScope} onChange={e => setCustomScope(e.target.value)} />
              </div>
            </div>

            <button className="con-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={createCustomSolution} disabled={creatingCustom || !customClient || !customService}>
              {creatingCustom ? 'Creating…' : '🎯 Create & Send to Client'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
