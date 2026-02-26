import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Consulting.css';

const ALL_STAGES = [
  { key: 'inquiry',   label: 'Enquiry Received',       icon: '📋', desc: 'Your enquiry has been received. We will schedule a scoping call within 2 business days.' },
  { key: 'scoping',   label: 'Scoping Call Scheduled', icon: '📞', desc: 'A 60-minute scoping session with your dedicated specialist has been arranged.' },
  { key: 'proposal',  label: 'Proposal Sent',           icon: '📄', desc: 'A tailored proposal with scope, deliverables, timeline and fee has been delivered.' },
  { key: 'signed',    label: 'Engagement Signed',       icon: '🤝', desc: 'Engagement agreement signed. Your consultant has been assigned and work begins.' },
  { key: 'discovery', label: 'Discovery & Assessment',  icon: '🔬', desc: 'Deep-dive diagnostic in progress. Current state documented, gaps identified.' },
  { key: 'delivery',  label: 'Delivery In Progress',    icon: '⚡', desc: 'Consultants are actively working on your deliverables. Regular check-ins scheduled.' },
  { key: 'review',    label: 'Client Review',           icon: '🔎', desc: 'Deliverables submitted for your review. Feedback incorporated before final sign-off.' },
  { key: 'completed', label: 'Engagement Complete',     icon: '🏆', desc: 'All deliverables accepted. Engagement successfully closed.' },
];

const STATUS_COLOURS = {
  completed: '#86efac', active: '#c9a84c', on_hold: '#94a3b8', cancelled: '#fca5a5',
};

function EngagementTimeline({ eng }) {
  const completedSet = new Set(
    (eng.stageHistory || []).filter(h => h.completedAt).map(h => h.stage)
  );
  const active = eng.currentStage;

  return (
    <div className="con-timeline">
      {ALL_STAGES.map((stage, i) => {
        const isDone   = completedSet.has(stage.key);
        const isActive = stage.key === active && !isDone;
        const hist     = (eng.stageHistory || []).find(h => h.stage === stage.key);
        const state    = isDone ? 'done' : isActive ? 'active' : 'pending';

        return (
          <div key={stage.key} className={`con-tl-item con-tl-item--${state}`}>
            <div className="con-tl-left">
              <div className={`con-tl-dot con-tl-dot--${state}`}>
                {isDone ? '✓' : isActive ? <div className="con-tl-pulse" /> : i + 1}
              </div>
              {i < ALL_STAGES.length - 1 && <div className={`con-tl-line ${isDone ? 'con-tl-line--done' : ''}`} />}
            </div>
            <div className="con-tl-body">
              <div className="con-tl-header">
                <span className="con-tl-icon">{stage.icon}</span>
                <span className={`con-tl-label con-tl-label--${state}`}>{stage.label}</span>
                {isActive && <span className="con-tl-badge">Current Stage</span>}
                {isDone && hist?.completedAt && (
                  <span className="con-tl-date">
                    {new Date(hist.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
              {(isDone || isActive) && (
                <p className="con-tl-desc">{hist?.note || stage.desc}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ConsultingDetail() {
  const { id }    = useParams();
  const [eng, setEng]     = useState(null);
  const [loading, setLoad] = useState(true);

  const load = async () => {
    try {
      const r = await API.get(`/consulting/${id}`);
      setEng(r.data.data);
    } catch {
      toast.error('Could not load engagement');
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="con-loading"><div className="con-spinner" /></div>;
  if (!eng)    return <div className="con-loading" style={{ color: '#fca5a5' }}>Engagement not found</div>;

  const svcColour = eng.currentStage === 'completed' ? '#86efac' : '#c9a84c';
  const progressPct = eng.progressPercent || 10;

  return (
    <div className="con-detail-page">
      {/* Nav */}
      <div className="con-detail-nav">
        <Link to="/consulting/my" className="con-back-link">← My Engagements</Link>
        <div className="con-detail-breadcrumb">Module C · Business Consulting</div>
      </div>

      {/* Hero */}
      <div className="con-detail-hero">
        <div className="con-detail-hero__glow" />
        <div className="con-detail-hero__content">
          <div className="con-detail-cat">{eng.serviceCategory}</div>
          <h1 className="con-detail-title">{eng.serviceName}</h1>
          {eng.isCustomSolution && (
            <div className="con-detail-custom-badge">🎯 Custom Solution prepared by our team</div>
          )}
          <div className="con-detail-meta">
            <span>🏢 {eng.companyName}</span>
            <span>📅 {new Date(eng.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            {eng.consultantName && <span>👤 Consultant: {eng.consultantName}</span>}
            {eng.scopeNotes && <span>📝 {eng.scopeNotes.substring(0, 80)}{eng.scopeNotes.length > 80 ? '…' : ''}</span>}
          </div>
        </div>

        {/* Status card */}
        <div className="con-status-card">
          {/* SVG ring */}
          <div className="con-ring-wrap">
            <svg viewBox="0 0 120 120" className="con-ring-svg">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1f2937" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke={svcColour} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - progressPct / 100)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease' }}
              />
              <text x="60" y="55" textAnchor="middle" fill={svcColour} fontSize="22" fontWeight="600">{progressPct}%</text>
              <text x="60" y="72" textAnchor="middle" fill="#6b7280" fontSize="9">Complete</text>
            </svg>
          </div>
          <div className="con-status-info">
            <div className="con-status-stage-label">Current Stage</div>
            <div className="con-status-stage" style={{ color: svcColour }}>
              {ALL_STAGES.find(s => s.key === eng.currentStage)?.icon} {ALL_STAGES.find(s => s.key === eng.currentStage)?.label}
            </div>
            <div className="con-status-badge" style={{
              color: STATUS_COLOURS[eng.status] || '#c9a84c',
              background: (STATUS_COLOURS[eng.status] || '#c9a84c') + '14',
              border: `1px solid ${(STATUS_COLOURS[eng.status] || '#c9a84c')}40`,
            }}>
              {eng.status === 'completed' ? '✅ Completed' : eng.status === 'on_hold' ? '⏸ On Hold' : '🔄 Active'}
            </div>
            {eng.quotedFee > 0 && (
              <div className="con-status-fee">
                <span>Quoted Fee</span>
                <strong>€ {eng.quotedFee.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="con-detail-body">
        {/* Timeline */}
        <div className="con-detail-main">
          <h2 className="con-detail-section-title">📍 Engagement Progress</h2>
          <EngagementTimeline eng={eng} />
        </div>

        {/* Sidebar */}
        <div className="con-detail-sidebar">
          {/* Deliverables */}
          {eng.deliverables?.length > 0 && (
            <div className="con-deliverables">
              <h3 className="con-detail-section-title">📦 Deliverables</h3>
              <div className="con-deliv-list">
                {eng.deliverables.map((d, i) => (
                  <div key={i} className={`con-deliv-row con-deliv-row--${d.status}`}>
                    <span className="con-deliv-icon">
                      {d.status === 'approved' ? '✅' : d.status === 'submitted' ? '🕐' : d.status === 'in_progress' ? '⚡' : '📋'}
                    </span>
                    <div className="con-deliv-info">
                      <span className="con-deliv-name">{d.name}</span>
                      <span className={`con-deliv-status con-deliv-status--${d.status}`}>
                        {d.status === 'approved' ? 'Delivered'
                          : d.status === 'submitted' ? 'Under Review'
                          : d.status === 'in_progress' ? 'In Progress'
                          : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin notes */}
          {eng.adminNotes?.length > 0 && (
            <div className="con-notes-section">
              <h3 className="con-detail-section-title">📝 Notes from Your Consultant</h3>
              {eng.adminNotes.map((n, i) => (
                <div key={i} className="con-note-item">
                  <p className="con-note-text">{n.note}</p>
                  <p className="con-note-meta">{n.createdBy} · {new Date(n.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
              ))}
            </div>
          )}

          {/* Engagement info */}
          <div className="con-info-card">
            <h3 className="con-detail-section-title">ℹ️ Engagement Details</h3>
            {[
              { label: 'Service', val: eng.serviceName },
              { label: 'Category', val: eng.serviceCategory },
              { label: 'Company', val: eng.companyName },
              { label: 'Industry', val: eng.industry || '—' },
              { label: 'Company Size', val: eng.companySize || '—' },
              { label: 'Quoted Fee', val: eng.quotedFee ? `€ ${eng.quotedFee.toLocaleString()}` : '—' },
              { label: 'Enquired', val: new Date(eng.createdAt).toLocaleDateString('en-GB') },
              { label: 'Started', val: eng.startDate ? new Date(eng.startDate).toLocaleDateString('en-GB') : 'Pending' },
            ].map(r => (
              <div key={r.label} className="con-info-row">
                <span>{r.label}</span>
                <strong>{r.val}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
