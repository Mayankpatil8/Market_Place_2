const mongoose = require('mongoose');

// ─── Certification Types available on the platform ───────────────────────────
const CERT_TYPES = [
  {
    id: 'iso9001_aqap',
    name: 'ISO 9001 + AQAP 2110',
    category: 'Machine Components',
    icon: '⚙',
    description: 'Quality Management System for machine component manufacturers supplying to NATO/defence programmes.',
    standards: ['ISO 9001:2015', 'AQAP 2110', 'NATO STANAG 4107'],
    eligibility: 'Manufacturers of machined parts, castings, forgings, precision components',
    duration: '4–6 months',
    fee: 4800,
    colour: '#c9a84c',
  },
  {
    id: 'en9100',
    name: 'EN 9100 / AS9100',
    category: 'Aerospace Structure',
    icon: '✈',
    description: 'Aviation, Space and Defence Quality Management System for aerospace structural component suppliers.',
    standards: ['EN 9100:2018', 'AS9100 Rev D', 'EASA Part-21'],
    eligibility: 'Manufacturers of aircraft structures, aeroengine parts, avionics enclosures',
    duration: '6–9 months',
    fee: 7200,
    colour: '#7dd3fc',
  },
  {
    id: 'ipc_aqap',
    name: 'IPC-A-610 + AQAP 2210',
    category: 'Electronics',
    icon: '💡',
    description: 'Acceptability of Electronic Assemblies combined with NATO AQAP for defence electronics.',
    standards: ['IPC-A-610G', 'AQAP 2210', 'MIL-STD-461'],
    eligibility: 'PCB assembly houses, EMS providers, defence electronics manufacturers',
    duration: '3–5 months',
    fee: 5600,
    colour: '#86efac',
  },
  {
    id: 'iso17025',
    name: 'ISO/IEC 17025',
    category: 'Testing Labs',
    icon: '🔬',
    description: 'Competence of testing and calibration laboratories. Mandatory for supplier test reports accepted by defence bodies.',
    standards: ['ISO/IEC 17025:2017', 'ILAC P15', 'EA-4/02'],
    eligibility: 'Testing laboratories, calibration labs, metrology services',
    duration: '5–8 months',
    fee: 6400,
    colour: '#c4b5fd',
  },
  {
    id: 'nadcap',
    name: 'NADCAP',
    category: 'Special Processes',
    icon: '🔥',
    description: 'National Aerospace and Defence Contractors Accreditation Program for special manufacturing processes.',
    standards: ['AC7004', 'AC7102', 'AC7110'],
    eligibility: 'Heat treatment, non-destructive testing, chemical processing, welding suppliers',
    duration: '6–10 months',
    fee: 8900,
    colour: '#fca5a5',
  },
  {
    id: 'atex_iecex',
    name: 'ATEX / IECEx',
    category: 'Hazardous Environments',
    icon: '💥',
    description: 'Equipment for explosive atmospheres. Mandatory for defence-grade components used in hazardous zones.',
    standards: ['ATEX Directive 2014/34/EU', 'IECEx 02', 'EN 60079'],
    eligibility: 'Electrical equipment, sensors, motors used in Zone 0/1/2 environments',
    duration: '3–6 months',
    fee: 5200,
    colour: '#f9a8d4',
  },
  {
    id: 'mil_spec',
    name: 'MIL-SPEC Qualification',
    category: 'Defence Hardware',
    icon: '🛡',
    description: 'US Military Specification compliance for components entering NATO/US defence supply chains.',
    standards: ['MIL-STD-810H', 'MIL-STD-1553', 'MIL-PRF-19500'],
    eligibility: 'Electronic components, connectors, mechanical hardware for military programmes',
    duration: '4–7 months',
    fee: 9600,
    colour: '#94a3b8',
  },
  {
    id: 'iso14001',
    name: 'ISO 14001 Environmental',
    category: 'Environmental Management',
    icon: '🌿',
    description: 'Environmental Management System increasingly required by Tier-1 defence primes as part of ESG compliance.',
    standards: ['ISO 14001:2015', 'EMAS III', 'EU Green Deal Compliance'],
    eligibility: 'Any manufacturer seeking defence contracts requiring environmental credentials',
    duration: '3–5 months',
    fee: 3600,
    colour: '#6ee7b7',
  },
];

// ─── Certification Stages ─────────────────────────────────────────────────────
const CERT_STAGES = [
  { key: 'applied', label: 'Application Submitted', description: 'Initial application and self-assessment questionnaire received.', order: 1 },
  { key: 'fee_paid', label: 'Certification Fee Paid', description: 'Assessment fee confirmed. Process formally initiated.', order: 2 },
  { key: 'docs_review', label: 'Documentation Under Review', description: 'Quality manual, procedures and supporting documents being reviewed.', order: 3 },
  { key: 'docs_additional', label: 'Additional Documents Required', description: 'Reviewer has requested supplementary evidence or clarifications.', order: 4 },
  { key: 'internal_audit', label: 'Internal Audit Report', description: 'Internal audit conducted and report submitted for review.', order: 5 },
  { key: 'scrutiny', label: 'Scrutiny Stage', description: 'Detailed technical scrutiny of all submitted evidence by certification body.', order: 6 },
  { key: 'external_audit', label: 'External Auditor Report', description: 'Third-party auditor visit completed. Report filed.', order: 7 },
  { key: 'final_audit', label: 'Final Audit', description: 'Final assessment and closing meeting with certification body.', order: 8 },
  { key: 'approved', label: 'Certificate Issued', description: 'Certification granted. Certificate valid for 3 years.', order: 9 },
  { key: 'rejected', label: 'Application Rejected', description: 'Certification not granted. Corrective action required before re-application.', order: 10 },
];

// ─── Stage History Entry ──────────────────────────────────────────────────────
const stageHistorySchema = new mongoose.Schema({
  stage: { type: String, required: true },
  label: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'completed', 'failed', 'skipped'], default: 'pending' },
  completedAt: { type: Date },
  note: { type: String, trim: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  documents: [{ name: String, url: String, uploadedAt: { type: Date, default: Date.now } }],
});

// ─── Document Checklist Item ──────────────────────────────────────────────────
const docChecklistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  required: { type: Boolean, default: true },
  submitted: { type: Boolean, default: false },
  submittedAt: Date,
  fileUrl: String,
  fileName: String,
  reviewStatus: { type: String, enum: ['pending', 'accepted', 'rejected', 'needs_revision'], default: 'pending' },
  reviewNote: String,
});

// ─── Main Certification Schema ────────────────────────────────────────────────
const certificationSchema = new mongoose.Schema(
  {
    // Who applied
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicantName: String,
    applicantEmail: String,
    companyName: String,

    // What certification
    certType: {
      type: String,
      enum: CERT_TYPES.map(c => c.id),
      required: true,
    },
    certName: String,
    certCategory: String,

    // Current lifecycle stage
    currentStage: {
      type: String,
      enum: CERT_STAGES.map(s => s.key),
      default: 'applied',
    },

    // Overall status
    status: {
      type: String,
      enum: ['active', 'completed', 'rejected', 'on_hold', 'cancelled'],
      default: 'active',
    },

    // Progress percentage (auto-calculated)
    progressPercent: { type: Number, default: 10 },

    // Detailed stage history
    stageHistory: [stageHistorySchema],

    // Document checklist
    documents: [docChecklistSchema],

    // Financial
    feeAmount: { type: Number, default: 0 },
    feePaid: { type: Boolean, default: false },
    feePaidAt: Date,
    invoiceNumber: String,

    // Assigned case manager (admin)
    caseManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    caseManagerName: String,

    // Audit details
    auditDate: Date,
    auditorName: String,
    auditFirm: String,

    // Certificate details (once issued)
    certificateNumber: String,
    certificateIssuedAt: Date,
    certificateExpiresAt: Date,
    certificateUrl: String,

    // Admin notes / sales team visibility
    adminNotes: [{ note: String, createdBy: String, createdAt: { type: Date, default: Date.now } }],
    salesFlag: { type: Boolean, default: false }, // flagged for sales team follow-up
    salesNote: String,
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },

    // Blockers / issues
    blockers: [{ issue: String, raisedAt: { type: Date, default: Date.now }, resolved: { type: Boolean, default: false } }],
  },
  { timestamps: true }
);

// Auto-compute progress on save
certificationSchema.pre('save', function (next) {
  const stageOrder = {
    applied: 10, fee_paid: 20, docs_review: 30, docs_additional: 35,
    internal_audit: 50, scrutiny: 65, external_audit: 78, final_audit: 90,
    approved: 100, rejected: 0,
  };
  this.progressPercent = stageOrder[this.currentStage] || 10;

  // Pull cert info from type
  const found = CERT_TYPES.find(c => c.id === this.certType);
  if (found && !this.certName) {
    this.certName = found.name;
    this.certCategory = found.category;
    this.feeAmount = found.fee;
  }
  next();
});

const Certification = mongoose.model('Certification', certificationSchema);

module.exports = { Certification, CERT_TYPES, CERT_STAGES };
