import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import './Certifications.css';

const STAGE_LABELS = {
  applied: 'Application Submitted',
  fee_paid: 'Fee Paid',
  docs_review: 'Docs Under Review',
  docs_additional: 'Additional Docs Needed',
  internal_audit: 'Internal Audit',
  scrutiny: 'Scrutiny Stage',
  external_audit: 'External Auditor Report',
  final_audit: 'Final Audit',
  approved: 'Certificate Issued',
  rejected: 'Rejected',
};

const STAGE_ICONS = {
  applied: '📋', fee_paid: '💳', docs_review: '🔍', docs_additional: '📎',
  internal_audit: '🔎', scrutiny: '⚖', external_audit: '👤', final_audit: '🏁',
  approved: '🏅', rejected: '❌',
};

export default function MyCertifications() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/certifications/my')
      .then(res => setCerts(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="cert-loading"><div className="cert-spinner" /></div>;

  return (
    <div className="cert-page">
      <div className="cert-page-header">
        <div>
          <div className="cert-page-tag">MODULE B · DEFENCE CERTIFICATION</div>
          <h1 className="cert-page-title" style={{ fontSize: 'clamp(32px,4vw,52px)' }}>
            My Certifications
          </h1>
          <p className="cert-page-desc">Track the progress of all your certification applications.</p>
        </div>
        <Link to="/certifications" className="cert-primary-btn">+ Apply for Certification</Link>
      </div>

      {certs.length === 0 ? (
        <div className="cert-empty">
          <div className="cert-empty__icon">🏅</div>
          <h3>No certifications yet</h3>
          <p>Apply for a certification to make your company eligible for defence and aerospace procurement programmes.</p>
          <Link to="/certifications" className="cert-primary-btn" style={{ margin: '24px auto 0', display: 'inline-flex' }}>
            Browse Certifications →
          </Link>
        </div>
      ) : (
        <div className="my-certs-list">
          {certs.map(cert => (
            <Link key={cert._id} to={`/certifications/${cert._id}`} className="my-cert-card">
              <div className="my-cert-card__left">
                <div className="my-cert-card__stage-icon">
                  {STAGE_ICONS[cert.currentStage] || '📋'}
                </div>
                <div>
                  <div className="my-cert-card__name">{cert.certName}</div>
                  <div className="my-cert-card__category">{cert.certCategory}</div>
                  <div className="my-cert-card__stage">
                    Current: <span>{STAGE_LABELS[cert.currentStage] || cert.currentStage}</span>
                  </div>
                </div>
              </div>

              <div className="my-cert-card__center">
                <div className="my-cert-prog-bar">
                  <div className="my-cert-prog-fill"
                    style={{
                      width: `${cert.progressPercent}%`,
                      background: cert.status === 'completed' ? '#86efac'
                        : cert.status === 'rejected' ? '#fca5a5' : '#c9a84c',
                    }}
                  />
                </div>
                <div className="my-cert-prog-label">{cert.progressPercent}% complete</div>
              </div>

              <div className="my-cert-card__right">
                <div className={`my-cert-status-badge my-cert-status-badge--${cert.status}`}>
                  {cert.status === 'completed' ? '✅ Certified'
                    : cert.status === 'rejected' ? '❌ Rejected'
                    : cert.status === 'on_hold' ? '⏸ On Hold'
                    : '🔄 In Progress'}
                </div>
                <div className="my-cert-date">
                  Applied {new Date(cert.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                </div>
                <span className="my-cert-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
