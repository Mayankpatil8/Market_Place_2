import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import './Consulting.css';

const STAGE_LABELS = {
  inquiry: 'Enquiry Received', scoping: 'Scoping Call Scheduled',
  proposal: 'Proposal Sent', signed: 'Engagement Signed',
  discovery: 'Discovery & Assessment', delivery: 'Delivery In Progress',
  review: 'Client Review', completed: 'Engagement Complete', follow_up: 'Follow-Up / Expansion',
};
const STAGE_ICONS = {
  inquiry: '📋', scoping: '📞', proposal: '📄', signed: '🤝',
  discovery: '🔬', delivery: '⚡', review: '🔎', completed: '🏆', follow_up: '🔄',
};

export default function MyConsulting() {
  const [engs, setEngs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/consulting/my')
      .then(r => setEngs(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="con-loading"><div className="con-spinner" /></div>;

  return (
    <div className="con-page">
      <div className="con-list-header">
        <div>
          <div className="con-module-tag">MODULE C · BUSINESS CONSULTING</div>
          <h1 className="con-list-title">My Engagements</h1>
          <p className="con-list-desc">Track every consulting engagement in real time.</p>
        </div>
        <Link to="/consulting" className="con-btn-primary">+ New Enquiry</Link>
      </div>

      {engs.length === 0 ? (
        <div className="con-empty">
          <div className="con-empty__icon">💼</div>
          <h3>No engagements yet</h3>
          <p>Browse our eight consulting disciplines and submit an enquiry to get started.</p>
          <Link to="/consulting" className="con-btn-primary" style={{ margin: '24px auto 0', display: 'inline-flex' }}>
            Explore Consulting Services →
          </Link>
        </div>
      ) : (
        <div className="con-eng-list">
          {engs.map(eng => (
            <Link key={eng._id} to={`/consulting/${eng._id}`} className="con-eng-row">
              <div className="con-eng-row__icon">{STAGE_ICONS[eng.currentStage] || '💼'}</div>
              <div className="con-eng-row__main">
                <div className="con-eng-row__name">{eng.serviceName}</div>
                <div className="con-eng-row__cat">{eng.serviceCategory}</div>
                {eng.isCustomSolution && (
                  <span className="con-eng-row__custom-badge">🎯 Custom Solution</span>
                )}
                <div className="con-eng-row__stage">
                  Current: <span>{STAGE_LABELS[eng.currentStage] || eng.currentStage}</span>
                </div>
              </div>
              <div className="con-eng-row__progress">
                <div className="con-eng-prog-bar">
                  <div
                    className="con-eng-prog-fill"
                    style={{
                      width: `${eng.progressPercent}%`,
                      background: eng.status === 'completed' ? '#86efac' : '#c9a84c',
                    }}
                  />
                </div>
                <span className="con-eng-prog-label">{eng.progressPercent}%</span>
              </div>
              <div className="con-eng-row__right">
                <div className={`con-eng-status con-eng-status--${eng.status}`}>
                  {eng.status === 'completed' ? '✅ Complete'
                    : eng.status === 'on_hold' ? '⏸ On Hold'
                    : eng.status === 'cancelled' ? '❌ Cancelled'
                    : '🔄 Active'}
                </div>
                {eng.quotedFee > 0 && (
                  <div className="con-eng-fee">€ {eng.quotedFee.toLocaleString()}</div>
                )}
                <div className="con-eng-date">
                  {new Date(eng.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                </div>
                <span className="con-eng-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
