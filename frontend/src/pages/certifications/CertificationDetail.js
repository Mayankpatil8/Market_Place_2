import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Certifications.css';

const ALL_STAGES = [
  { key: 'applied', label: 'Application Submitted', icon: '📋', desc: 'Initial application and self-assessment questionnaire received.' },
  { key: 'fee_paid', label: 'Certification Fee Paid', icon: '💳', desc: 'Assessment fee confirmed. Process formally initiated.' },
  { key: 'docs_review', label: 'Documentation Under Review', icon: '🔍', desc: 'Quality manual, procedures and supporting documents being reviewed by our team.' },
  { key: 'docs_additional', label: 'Additional Documents Required', icon: '📎', desc: 'Reviewer has requested supplementary evidence or clarifications.' },
  { key: 'internal_audit', label: 'Internal Audit Report', icon: '🔎', desc: 'Internal audit conducted and report submitted for review.' },
  { key: 'scrutiny', label: 'Scrutiny Stage', icon: '⚖', desc: 'Detailed technical scrutiny of all submitted evidence by certification body.' },
  { key: 'external_audit', label: 'External Auditor Report', icon: '👤', desc: 'Third-party auditor visit completed. Report filed.' },
  { key: 'final_audit', label: 'Final Audit', icon: '🏁', desc: 'Final assessment and closing meeting with certification body.' },
  { key: 'approved', label: 'Certificate Issued', icon: '🏅', desc: 'Certification granted. Certificate valid for 3 years.' },
];

const STATUS_COLOURS = {
  completed: '#86efac',
  active: '#c9a84c',
  pending: '#374151',
  failed: '#fca5a5',
};

function StageTimeline({ cert }) {
  const completedStages = new Set((cert.stageHistory || []).filter(h => h.status === 'completed').map(h => h.stage));
  const activeStage = cert.currentStage;

  return (
    <div className="cert-timeline">
      {ALL_STAGES.map((stage, i) => {
        const isCompleted = completedStages.has(stage.key);
        const isActive = stage.key === activeStage && !isCompleted;
        const isPending = !isCompleted && !isActive;
        const isFailed = stage.key === 'docs_additional' && cert.currentStage === 'docs_additional';
        const historyEntry = (cert.stageHistory || []).find(h => h.stage === stage.key);
        const stateClass = isCompleted ? 'completed' : isActive ? 'active' : isFailed ? 'failed' : 'pending';
        const dot_colour = isCompleted ? '#86efac' : isActive ? '#c9a84c' : '#1f2937';

        return (
          <div key={stage.key} className={`cert-tl-item cert-tl-item--${stateClass}`}>
            <div className="cert-tl-left">
              <div className="cert-tl-dot" style={{ background: dot_colour, borderColor: isActive ? '#c9a84c' : isCompleted ? '#86efac' : '#374151' }}>
                {isCompleted ? '✓' : isActive ? <span className="cert-tl-pulse" /> : <span style={{ fontSize: 10, color: '#4b5563' }}>{i + 1}</span>}
              </div>
              {i < ALL_STAGES.length - 1 && (
                <div className="cert-tl-line" style={{ background: isCompleted ? '#1f4a2a' : '#1f2937' }} />
              )}
            </div>
            <div className="cert-tl-body">
              <div className="cert-tl-stage-header">
                <span className="cert-tl-icon">{stage.icon}</span>
                <span className="cert-tl-label" style={{ color: isCompleted ? '#86efac' : isActive ? '#e8e8e2' : '#4b5563' }}>
                  {stage.label}
                </span>
                {isActive && <span className="cert-tl-badge cert-tl-badge--active">Current Stage</span>}
                {isCompleted && historyEntry?.completedAt && (
                  <span className="cert-tl-date">{new Date(historyEntry.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                )}
              </div>
              {(isActive || isCompleted) && (
                <p className="cert-tl-desc">{historyEntry?.note || stage.desc}</p>
              )}
              {isCompleted && historyEntry?.documents?.length > 0 && (
                <div className="cert-tl-docs">
                  {historyEntry.documents.map(d => (
                    <a key={d.name} href={d.url} className="cert-tl-doc" target="_blank" rel="noreferrer">📎 {d.name}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DocumentChecklist({ cert, onDocSubmit }) {
  const [submitting, setSubmitting] = useState(null);

  const handleSubmit = async (i, docName) => {
    setSubmitting(i);
    try {
      await onDocSubmit(i, docName);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="cert-docs-section">
      <h3 className="cert-section-title">📎 Document Checklist</h3>
      <div className="cert-docs-list">
        {(cert.documents || []).map((doc, i) => (
          <div key={i} className={`cert-doc-row cert-doc-row--${doc.reviewStatus || (doc.submitted ? 'pending' : 'not_submitted')}`}>
            <div className="cert-doc-row__left">
              <div className="cert-doc-status-icon">
                {doc.submitted
                  ? doc.reviewStatus === 'accepted' ? '✅'
                    : doc.reviewStatus === 'rejected' ? '❌'
                    : doc.reviewStatus === 'needs_revision' ? '⚠️'
                    : '🕐'
                  : doc.required ? '📋' : '📄'
                }
              </div>
              <div>
                <div className="cert-doc-name">{doc.name}</div>
                {doc.submitted && doc.fileName && (
                  <div className="cert-doc-filename">📎 {doc.fileName}</div>
                )}
                {doc.reviewNote && (
                  <div className="cert-doc-review-note">
                    {doc.reviewStatus === 'needs_revision' ? '⚠️' : 'ℹ️'} {doc.reviewNote}
                  </div>
                )}
                {!doc.submitted && doc.required && (
                  <div className="cert-doc-required">Required document</div>
                )}
              </div>
            </div>
            <div className="cert-doc-row__right">
              {doc.submitted ? (
                <span className={`cert-doc-badge cert-doc-badge--${doc.reviewStatus || 'pending'}`}>
                  {doc.reviewStatus === 'accepted' ? 'Accepted'
                    : doc.reviewStatus === 'rejected' ? 'Rejected'
                    : doc.reviewStatus === 'needs_revision' ? 'Revision Needed'
                    : 'Under Review'}
                </span>
              ) : (
                cert.feePaid && (
                  <button
                    className="cert-doc-upload-btn"
                    disabled={submitting === i}
                    onClick={() => handleSubmit(i, doc.name)}
                  >
                    {submitting === i ? 'Uploading…' : '↑ Submit'}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      {!cert.feePaid && (
        <div className="cert-docs-locked">
          🔒 Pay the assessment fee to unlock document submission
        </div>
      )}
    </div>
  );
}

export default function CertificationDetail() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingFee, setPayingFee] = useState(false);

  const load = async () => {
    try {
      const res = await API.get(`/certifications/${id}`);
      setCert(res.data.data);
    } catch (err) {
      toast.error('Could not load certification');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handlePayFee = async () => {
    setPayingFee(true);
    try {
      await API.patch(`/certifications/${id}/pay-fee`);
      toast.success('Fee payment confirmed! You can now submit your documents.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPayingFee(false);
    }
  };

  const handleDocSubmit = async (docIndex, docName) => {
    await API.patch(`/certifications/${id}/submit-docs`, {
      docIndex,
      fileName: `${docName.replace(/\s+/g, '_')}.pdf`,
      fileUrl: '#',
    });
    toast.success(`"${docName}" submitted for review`);
    load();
  };

  if (loading) return <div className="cert-loading"><div className="cert-spinner" /></div>;
  if (!cert) return <div className="cert-loading" style={{ color: '#fca5a5' }}>Certification not found</div>;

  const certTypeColour = cert.certType === 'en9100' ? '#7dd3fc'
    : cert.certType === 'iso9001_aqap' ? '#c9a84c'
    : cert.certType === 'ipc_aqap' ? '#86efac'
    : cert.certType === 'iso17025' ? '#c4b5fd'
    : '#c9a84c';

  return (
    <div className="cert-detail-page">
      {/* Back */}
      <div className="cert-detail-nav">
        <Link to="/certifications" className="cert-back-link">← All Certifications</Link>
        <div className="cert-detail-breadcrumb">Module B · Defence Certification</div>
      </div>

         {/* ── CERTIFICATION DETAIL ── */}
            <section className="svc-cert-section">
              <div className="eu-section">
                <div className="svc-cert-header">
                  <div>
                    <div className="eu-eyebrow">Certification Services</div>
                    <h2 className="svc-section-title" style={{ fontSize: 'clamp(36px,5vw,64px)' }}>
                      Every certificate.<br /><em>One trusted partner.</em>
                    </h2>
                    <p className="eu-lead" style={{ marginTop: 20 }}>
                      Navigating European certification is complex. We simplify it — preparing all documentation, liaising with notified bodies, and managing the full audit process on your behalf.
                    </p>
                    <Link to="/register" className="eu-gold-btn" style={{ marginTop: 36 }}>
                      Request Free Assessment →
                    </Link>
                  </div>
      
                  <div className="svc-cert-cards">
                    {CERT_LOGOS.map(c => (
                      <div key={c.name} className="svc-cert-card" style={{ '--cert-color': c.color }}>
                        <span className="svc-cert-card__icon">{c.icon}</span>
                        <span className="svc-cert-card__name">{c.name}</span>
                        <span className="svc-cert-card__arrow">→</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
      
            {/* ── HOW IT WORKS ── */}
            <section className="svc-process-section">
              <div className="eu-section">
                <div className="svc-section-head" style={{ textAlign: 'center', alignItems: 'center' }}>
                  <div>
                    <div className="eu-eyebrow" style={{ justifyContent: 'center' }}>Our Process</div>
                    <h2 className="svc-section-title">Four steps to<br /><em>full certification.</em></h2>
                  </div>
                </div>
                <div className="svc-process-track">
                  {PROCESS.map((p, i) => (
                    <div key={p.step} className={`svc-process-step eu-anim-up eu-d${i + 1}`}>
                      <div className="svc-process-num">{p.step}</div>
                      <div className="svc-process-line" />
                      <h3 className="svc-process-title">{p.title}</h3>
                      <p className="svc-process-desc">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
      

      {/* Hero */}
      <div className="cert-detail-hero" style={{ '--cert-color': certTypeColour }}>
        <div className="cert-detail-hero__glow" />
        <div className="cert-detail-hero__content">
          <div className="cert-detail-category">{cert.certCategory}</div>
          <h1 className="cert-detail-title">{cert.certName}</h1>
          <div className="cert-detail-meta">
            <span>🏢 {cert.companyName}</span>
            <span>📅 Applied {new Date(cert.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            {cert.caseManager && <span>👤 Case Manager: {cert.caseManagerName || cert.caseManager?.name}</span>}
          </div>
        </div>

        <div className="cert-detail-status-card">
          {/* Progress ring */}
          <div className="cert-progress-ring-wrap">
            <svg viewBox="0 0 120 120" className="cert-progress-ring">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1f2937" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={certTypeColour} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - cert.progressPercent / 100)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease' }} />
              <text x="60" y="55" textAnchor="middle" fill={certTypeColour} fontSize="22" fontWeight="600">{cert.progressPercent}%</text>
              <text x="60" y="72" textAnchor="middle" fill="#6b7280" fontSize="9">Complete</text>
            </svg>
          </div>

          <div className="cert-status-info">
            <div className="cert-status-label">Current Stage</div>
            <div className="cert-status-current" style={{ color: certTypeColour }}>
              {ALL_STAGES.find(s => s.key === cert.currentStage)?.icon || '📋'}{' '}
              {ALL_STAGES.find(s => s.key === cert.currentStage)?.label || cert.currentStage}
            </div>
            <div className="cert-status-overall">
              Status: <span style={{ color: cert.status === 'completed' ? '#86efac' : cert.status === 'rejected' ? '#fca5a5' : '#c9a84c' }}>
                {cert.status === 'completed' ? '✅ Certificate Issued' : cert.status === 'rejected' ? '❌ Rejected' : cert.status === 'on_hold' ? '⏸ On Hold' : '🔄 Active'}
              </span>
            </div>

            {cert.certificateNumber && (
              <div className="cert-cert-number">
                🏅 Certificate No: <strong>{cert.certificateNumber}</strong><br />
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  Valid until {new Date(cert.certificateExpiresAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            )}

            {!cert.feePaid && cert.status === 'active' && (
              <button className="cert-pay-btn" onClick={handlePayFee} disabled={payingFee}
                style={{ background: certTypeColour, color: '#080b14' }}>
                {payingFee ? 'Processing…' : `💳 Pay Assessment Fee — €${cert.feeAmount?.toLocaleString()}`}
              </button>
            )}

            {cert.feePaid && (
              <div className="cert-fee-paid-badge">
                ✅ Fee Paid · Invoice {cert.invoiceNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cert-detail-body">
        {/* Timeline */}
        <div className="cert-detail-main">
          <h2 className="cert-section-title">📍 Certification Progress</h2>
          <StageTimeline cert={cert} />
        </div>

        {/* Sidebar */}
        <div className="cert-detail-sidebar">
          {/* Document checklist */}
          <DocumentChecklist cert={cert} onDocSubmit={handleDocSubmit} />

          {/* Admin notes visible to user */}
          {cert.adminNotes?.length > 0 && (
            <div className="cert-admin-notes">
              <h3 className="cert-section-title">📝 Notes from Your Case Manager</h3>
              {cert.adminNotes.map((n, i) => (
                <div key={i} className="cert-admin-note">
                  <div className="cert-admin-note__text">{n.note}</div>
                  <div className="cert-admin-note__meta">{n.createdBy} · {new Date(n.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
              ))}
            </div>
          )}

          {/* Blockers */}
          {cert.blockers?.some(b => !b.resolved) && (
            <div className="cert-blockers">
              <h3 className="cert-section-title" style={{ color: '#fca5a5' }}>⚠️ Active Issues</h3>
              {cert.blockers.filter(b => !b.resolved).map((b, i) => (
                <div key={i} className="cert-blocker-item">{b.issue}</div>
              ))}
            </div>
          )}

          {/* Cert info */}
          <div className="cert-info-card">
            <h3 className="cert-section-title">ℹ️ Certification Details</h3>
            <div className="cert-info-row"><span>Fee</span><strong style={{ color: certTypeColour }}>€ {cert.feeAmount?.toLocaleString()}</strong></div>
            <div className="cert-info-row"><span>Applied</span><strong>{new Date(cert.createdAt).toLocaleDateString('en-GB')}</strong></div>
            {cert.feePaidAt && <div className="cert-info-row"><span>Fee Paid</span><strong>{new Date(cert.feePaidAt).toLocaleDateString('en-GB')}</strong></div>}
            {cert.auditDate && <div className="cert-info-row"><span>Audit Date</span><strong>{new Date(cert.auditDate).toLocaleDateString('en-GB')}</strong></div>}
            {cert.auditorName && <div className="cert-info-row"><span>Auditor</span><strong>{cert.auditorName}</strong></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
