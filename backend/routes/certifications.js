const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Certification, CERT_TYPES, CERT_STAGES } = require('../models/Certification');
const User = require('../models/User');

// ─── Auth middleware (reuse from auth routes) ─────────────────────────────────
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'industrialhub_secret_2025';

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });
  next();
};

// ─── GET /api/certifications/types ── Public: list all available cert types
router.get('/types', (req, res) => {
  res.json({ success: true, data: CERT_TYPES });
});

// ─── GET /api/certifications/stages ── Public: list all stages
router.get('/stages', (req, res) => {
  res.json({ success: true, data: CERT_STAGES });
});

// ─── POST /api/certifications/apply ── Apply for a certification
router.post('/apply', protect, async (req, res) => {
  try {
    const { certType, companyName } = req.body;
    if (!certType) return res.status(400).json({ success: false, message: 'Certification type required' });

    const found = CERT_TYPES.find(c => c.id === certType);
    if (!found) return res.status(400).json({ success: false, message: 'Invalid certification type' });

    // Check if already applied for same cert
    const existing = await Certification.findOne({
      applicant: req.user._id,
      certType,
      status: { $in: ['active', 'completed'] },
    });
    if (existing) return res.status(400).json({ success: false, message: 'You already have an active application for this certification' });

    // Default doc checklist per cert type
    const docTemplates = {
      iso9001_aqap: ['Quality Manual', 'Process Flowcharts', 'Calibration Records', 'Non-Conformance Reports', 'Management Review Minutes', 'Company Registration Docs', 'Customer Complaint Log'],
      en9100: ['Quality Management Manual', 'Design Documentation', 'Airworthiness Records', 'Supplier Approval List', 'FOD Prevention Plan', 'Configuration Management Plan', 'First Article Inspection Reports'],
      ipc_aqap: ['IPC-A-610 Training Certificates', 'PCB Assembly Process Documentation', 'AOI/X-Ray Inspection Reports', 'Soldering Quality Records', 'ESD Control Program', 'Material Traceability Records'],
      iso17025: ['Technical Competency Evidence', 'Equipment Calibration Records', 'Measurement Uncertainty Analysis', 'Proficiency Testing Results', 'Laboratory Safety Procedures', 'Method Validation Records'],
      nadcap: ['Heat Treatment Process Specs', 'Pyrometry Survey Reports', 'System Accuracy Tests', 'Training & Qualification Records', 'Process Control Documentation'],
      atex_iecex: ['Technical Documentation File', 'ATEX Category Declaration', 'Protection Concept Description', 'Thermal Test Reports', 'Ignition Hazard Assessment'],
      mil_spec: ['Military Specification Compliance Matrix', 'Qualification Test Reports', 'Material Certificates', 'Drawing Package', 'Process Control Plans'],
      iso14001: ['Environmental Policy Statement', 'Aspects & Impacts Register', 'Legal Compliance Register', 'Environmental Targets', 'Waste Management Procedures'],
    };

    const docs = (docTemplates[certType] || ['Company Registration', 'Quality Manual', 'Process Documentation']).map(name => ({
      name,
      required: true,
      submitted: false,
    }));

    const initialHistory = [
      {
        stage: 'applied',
        label: 'Application Submitted',
        status: 'completed',
        completedAt: new Date(),
        note: `Application for ${found.name} received. Case opened.`,
      },
    ];

    const cert = await Certification.create({
      applicant: req.user._id,
      applicantName: req.user.name,
      applicantEmail: req.user.email,
      companyName: companyName || req.user.company || req.user.name,
      certType,
      certName: found.name,
      certCategory: found.category,
      currentStage: 'applied',
      status: 'active',
      feeAmount: found.fee,
      stageHistory: initialHistory,
      documents: docs,
    });

    res.status(201).json({ success: true, data: cert, message: `Application for ${found.name} submitted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/certifications/my ── Get current user's certifications
router.get('/my', protect, async (req, res) => {
  try {
    const certs = await Certification.find({ applicant: req.user._id })
      .sort({ createdAt: -1 })
      .populate('caseManager', 'name email');
    res.json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/certifications/:id ── Get single certification detail
router.get('/:id', protect, async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id)
      .populate('applicant', 'name email company')
      .populate('caseManager', 'name email');

    if (!cert) return res.status(404).json({ success: false, message: 'Certification not found' });

    // Only owner or admin can view
    if (cert.applicant._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/certifications/:id/pay-fee ── Mark fee as paid
router.patch('/:id/pay-fee', protect, async (req, res) => {
  try {
    const cert = await Certification.findOne({ _id: req.params.id, applicant: req.user._id });
    if (!cert) return res.status(404).json({ success: false, message: 'Certification not found' });

    cert.feePaid = true;
    cert.feePaidAt = new Date();
    cert.invoiceNumber = `INV-CERT-${Date.now().toString().slice(-8)}`;
    cert.currentStage = 'fee_paid';

    cert.stageHistory.push({
      stage: 'fee_paid',
      label: 'Certification Fee Paid',
      status: 'completed',
      completedAt: new Date(),
      note: `Fee of €${cert.feeAmount.toLocaleString()} confirmed. Invoice: ${cert.invoiceNumber}`,
    });

    await cert.save();
    res.json({ success: true, data: cert, message: 'Fee payment confirmed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/certifications/:id/submit-docs ── Submit a document
router.patch('/:id/submit-docs', protect, async (req, res) => {
  try {
    const { docIndex, fileName, fileUrl } = req.body;
    const cert = await Certification.findOne({ _id: req.params.id, applicant: req.user._id });
    if (!cert) return res.status(404).json({ success: false, message: 'Not found' });

    if (docIndex !== undefined && cert.documents[docIndex]) {
      cert.documents[docIndex].submitted = true;
      cert.documents[docIndex].submittedAt = new Date();
      cert.documents[docIndex].fileName = fileName || 'Document';
      cert.documents[docIndex].fileUrl = fileUrl || '#';
      cert.documents[docIndex].reviewStatus = 'pending';
    }

    // Move to docs_review if fee paid and first doc submitted
    if (cert.feePaid && cert.currentStage === 'fee_paid') {
      cert.currentStage = 'docs_review';
      cert.stageHistory.push({
        stage: 'docs_review',
        label: 'Documentation Under Review',
        status: 'active',
        note: 'Documents received. Review in progress.',
      });
    }

    await cert.save();
    res.json({ success: true, data: cert, message: 'Document submitted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═════════════════════════════════════════
// ADMIN ROUTES
// ═════════════════════════════════════════

// ─── GET /api/certifications/admin/all ── All certifications with filters
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const { status, stage, certType, salesFlag, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (stage) filter.currentStage = stage;
    if (certType) filter.certType = certType;
    if (salesFlag === 'true') filter.salesFlag = true;

    const total = await Certification.countDocuments(filter);
    const certs = await Certification.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('applicant', 'name email company role')
      .populate('caseManager', 'name');

    res.json({ success: true, data: certs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/certifications/admin/dashboard ── Admin analytics
router.get('/admin/dashboard', protect, isAdmin, async (req, res) => {
  try {
    const [total, active, completed, rejected, salesFlagged, byStage, byType, recentApps] = await Promise.all([
      Certification.countDocuments(),
      Certification.countDocuments({ status: 'active' }),
      Certification.countDocuments({ status: 'completed' }),
      Certification.countDocuments({ status: 'rejected' }),
      Certification.countDocuments({ salesFlag: true }),
      Certification.aggregate([{ $group: { _id: '$currentStage', count: { $sum: 1 } } }]),
      Certification.aggregate([{ $group: { _id: '$certType', count: { $sum: 1 }, revenue: { $sum: '$feeAmount' } } }]),
      Certification.find({ status: 'active' })
        .sort({ createdAt: -1 }).limit(5)
        .populate('applicant', 'name company'),
    ]);

    // Users missing key certs (for sales team)
    const certifiedUserIds = await Certification.distinct('applicant', { status: 'completed' });
    const uncertifiedUsers = await User.find({
      _id: { $nin: certifiedUserIds },
      role: { $in: ['supplier', 'customer'] },
      isActive: true,
    }).select('name email company role createdAt').limit(20);

    res.json({
      success: true,
      data: {
        stats: { total, active, completed, rejected, salesFlagged },
        byStage,
        byType,
        recentApps,
        uncertifiedUsers,
        totalRevenue: await Certification.aggregate([
          { $match: { feePaid: true } },
          { $group: { _id: null, total: { $sum: '$feeAmount' } } },
        ]).then(r => r[0]?.total || 0),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/certifications/admin/:id/advance-stage ── Move to next stage
router.patch('/admin/:id/advance-stage', protect, isAdmin, async (req, res) => {
  try {
    const { stage, note, status } = req.body;
    const cert = await Certification.findById(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Not found' });

    const stageInfo = CERT_STAGES.find(s => s.key === stage);
    if (!stageInfo) return res.status(400).json({ success: false, message: 'Invalid stage' });

    // Mark previous stage completed
    const prevHistory = cert.stageHistory.find(h => h.stage === cert.currentStage);
    if (prevHistory) { prevHistory.status = 'completed'; prevHistory.completedAt = new Date(); }

    cert.currentStage = stage;
    if (status) cert.status = status;

    // Add to history
    cert.stageHistory.push({
      stage,
      label: stageInfo.label,
      status: stage === 'approved' ? 'completed' : stage === 'rejected' ? 'failed' : 'active',
      completedAt: ['approved', 'rejected'].includes(stage) ? new Date() : undefined,
      note: note || stageInfo.description,
      updatedBy: req.user._id,
    });

    // If approved, set certificate details
    if (stage === 'approved') {
      cert.status = 'completed';
      cert.certificateNumber = `IH-CERT-${cert.certType.toUpperCase().slice(0, 6)}-${Date.now().toString().slice(-6)}`;
      cert.certificateIssuedAt = new Date();
      cert.certificateExpiresAt = new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000); // 3 years
    }

    if (stage === 'rejected') cert.status = 'rejected';

    await cert.save();
    res.json({ success: true, data: cert, message: `Stage advanced to "${stageInfo.label}"` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/certifications/admin/:id/flag-sales ── Flag for sales team
router.patch('/admin/:id/flag-sales', protect, isAdmin, async (req, res) => {
  try {
    const { salesNote } = req.body;
    const cert = await Certification.findByIdAndUpdate(
      req.params.id,
      { salesFlag: true, salesNote: salesNote || 'Follow up required' },
      { new: true }
    );
    res.json({ success: true, data: cert, message: 'Flagged for sales team' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/certifications/admin/:id/add-note ── Add admin note
router.patch('/admin/:id/add-note', protect, isAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    const cert = await Certification.findById(req.params.id);
    cert.adminNotes.push({ note, createdBy: req.user.name });
    await cert.save();
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/certifications/admin/:id/review-doc ── Admin reviews a document
router.patch('/admin/:id/review-doc', protect, isAdmin, async (req, res) => {
  try {
    const { docIndex, reviewStatus, reviewNote } = req.body;
    const cert = await Certification.findById(req.params.id);
    if (cert.documents[docIndex]) {
      cert.documents[docIndex].reviewStatus = reviewStatus;
      cert.documents[docIndex].reviewNote = reviewNote || '';
    }

    // If any doc needs revision, move to docs_additional stage
    const needsRevision = cert.documents.some(d => d.reviewStatus === 'needs_revision');
    if (needsRevision && !['docs_additional'].includes(cert.currentStage)) {
      cert.currentStage = 'docs_additional';
      cert.stageHistory.push({
        stage: 'docs_additional',
        label: 'Additional Documents Required',
        status: 'active',
        note: 'Reviewer has requested revisions or additional documentation.',
        updatedBy: req.user._id,
      });
    }

    await cert.save();
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/certifications/admin/sales-report ── Missing certs for sales team
router.get('/admin/sales-report', protect, isAdmin, async (req, res) => {
  try {
    // Users with no certifications or only partial ones
    const allUsers = await User.find({ role: { $in: ['supplier', 'customer'] }, isActive: true })
      .select('name email company role createdAt');

    const userCerts = await Certification.aggregate([
      { $group: { _id: '$applicant', certTypes: { $push: '$certType' }, statuses: { $push: '$status' } } },
    ]);

    const certMap = {};
    userCerts.forEach(uc => { certMap[uc._id.toString()] = { certTypes: uc.certTypes, statuses: uc.statuses }; });

    const report = allUsers.map(u => {
      const uc = certMap[u._id.toString()] || { certTypes: [], statuses: [] };
      const active = uc.certTypes.filter((_, i) => uc.statuses[i] === 'active');
      const completed = uc.certTypes.filter((_, i) => uc.statuses[i] === 'completed');
      const missing = ['iso9001_aqap', 'en9100', 'ipc_aqap', 'iso17025'].filter(c => !uc.certTypes.includes(c));
      return {
        user: { id: u._id, name: u.name, email: u.email, company: u.company, role: u.role, joinedAt: u.createdAt },
        activeCerts: active.length,
        completedCerts: completed.length,
        missingKeyCerts: missing,
        totalCerts: uc.certTypes.length,
        priorityScore: missing.length * 10 + (completed.length === 0 ? 20 : 0),
      };
    });

    // Sort by priority (most missing = highest priority for sales)
    report.sort((a, b) => b.priorityScore - a.priorityScore);

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
