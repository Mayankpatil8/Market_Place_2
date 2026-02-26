const express = require('express');
const router  = express.Router();
const { Consulting, GapProfile, CONSULTING_SERVICES, ENGAGEMENT_STAGES, NEED_CATEGORIES } = require('../models/Consulting');
const User    = require('../models/User');
const jwt     = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'industrialhub_secret_2025';

// ── Auth middleware ───────────────────────────────────────────────────────────
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

const isAdmin = (req, res, next) =>
  req.user?.role !== 'admin'
    ? res.status(403).json({ success: false, message: 'Admin only' })
    : next();

// ════════════════════════════════════════════
// PUBLIC / USER ROUTES
// ════════════════════════════════════════════

// GET /api/consulting/services  —  All service catalogue (public)
router.get('/services', (req, res) =>
  res.json({ success: true, data: CONSULTING_SERVICES })
);

// GET /api/consulting/need-categories  —  Gap categories for admin
router.get('/need-categories', (req, res) =>
  res.json({ success: true, data: NEED_CATEGORIES })
);

// POST /api/consulting/inquire  —  Submit service inquiry
router.post('/inquire', protect, async (req, res) => {
  try {
    const { serviceId, companySize, industry, scopeNotes } = req.body;
    if (!serviceId)
      return res.status(400).json({ success: false, message: 'Service ID required' });

    const svc = CONSULTING_SERVICES.find(s => s.id === serviceId);
    if (!svc)
      return res.status(400).json({ success: false, message: 'Invalid service' });

    // Allow multiple engagements for same service (different cycles)
    const inquiry = await Consulting.create({
      client:       req.user._id,
      clientName:   req.user.name,
      clientEmail:  req.user.email,
      companyName:  req.user.company || req.user.name,
      companySize:  companySize || '',
      industry:     industry || '',
      serviceId,
      serviceName:  svc.name,
      serviceCategory: svc.category,
      currentStage: 'inquiry',
      quotedFee:    svc.startingFee,
      scopeNotes:   scopeNotes || '',
      stageHistory: [{
        stage: 'inquiry',
        label: 'Enquiry Received',
        completedAt: new Date(),
        note: `Inquiry for ${svc.name} received. Scoping call will be scheduled within 2 business days.`,
      }],
      deliverables: svc.deliverables.map(name => ({ name, status: 'pending' })),
    });

    res.status(201).json({
      success: true,
      data: inquiry,
      message: `Inquiry for "${svc.name}" submitted. Our team will contact you within 2 business days.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/consulting/my  —  My engagements
router.get('/my', protect, async (req, res) => {
  try {
    const data = await Consulting.find({ client: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('consultant', 'name email');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/consulting/:id  —  Single engagement detail
router.get('/:id', protect, async (req, res) => {
  try {
    const eng = await Consulting.findById(req.params.id)
      .populate('client', 'name email company')
      .populate('consultant', 'name email');
    if (!eng) return res.status(404).json({ success: false, message: 'Engagement not found' });
    if (
      eng.client._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, data: eng });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════════

// GET /api/consulting/admin/all  —  All engagements (filterable)
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const { status, stage, serviceId, salesFlag, page = 1, limit = 25 } = req.query;
    const filter = {};
    if (status)   filter.status = status;
    if (stage)    filter.currentStage = stage;
    if (serviceId) filter.serviceId = serviceId;
    if (salesFlag === 'true') filter.salesFlag = true;

    const [total, data] = await Promise.all([
      Consulting.countDocuments(filter),
      Consulting.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('client', 'name email company role'),
    ]);
    res.json({ success: true, data, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/consulting/admin/dashboard  —  Admin KPI overview
router.get('/admin/dashboard', protect, isAdmin, async (req, res) => {
  try {
    const [total, active, completed, salesFlagged, byService, byStage, recentInquiries, totalRevenue] =
      await Promise.all([
        Consulting.countDocuments(),
        Consulting.countDocuments({ status: 'active' }),
        Consulting.countDocuments({ status: 'completed' }),
        Consulting.countDocuments({ salesFlag: true }),
        Consulting.aggregate([
          { $group: { _id: '$serviceId', count: { $sum: 1 }, revenue: { $sum: '$agreedFee' } } },
        ]),
        Consulting.aggregate([{ $group: { _id: '$currentStage', count: { $sum: 1 } } }]),
        Consulting.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5)
          .populate('client', 'name company'),
        Consulting.aggregate([
          { $match: { feePaid: true } },
          { $group: { _id: null, total: { $sum: '$agreedFee' } } },
        ]).then(r => r[0]?.total || 0),
      ]);

    res.json({
      success: true,
      data: { stats: { total, active, completed, salesFlagged }, byService, byStage, recentInquiries, totalRevenue },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/consulting/admin/:id/advance-stage  —  Move to next stage
router.patch('/admin/:id/advance-stage', protect, isAdmin, async (req, res) => {
  try {
    const { stage, note, agreedFee } = req.body;
    const eng = await Consulting.findById(req.params.id);
    if (!eng) return res.status(404).json({ success: false, message: 'Not found' });

    const stageInfo = ENGAGEMENT_STAGES.find(s => s.key === stage);
    if (!stageInfo) return res.status(400).json({ success: false, message: 'Invalid stage' });

    eng.currentStage = stage;
    if (agreedFee)   eng.agreedFee   = Number(agreedFee);
    if (stage === 'completed') eng.status = 'completed';
    if (stage === 'signed')   { eng.startDate = new Date(); }

    eng.stageHistory.push({
      stage,
      label:       stageInfo.label,
      completedAt: new Date(),
      note:        note || stageInfo.label,
      updatedBy:   req.user._id,
    });

    await eng.save();
    res.json({ success: true, data: eng, message: `Stage advanced to "${stageInfo.label}"` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/consulting/admin/custom-solution  —  Admin creates a custom offer for a client
router.post('/admin/custom-solution', protect, isAdmin, async (req, res) => {
  try {
    const { clientId, serviceId, scopeNotes, quotedFee, priority, salesNote } = req.body;

    const client = await User.findById(clientId);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const svc = CONSULTING_SERVICES.find(s => s.id === serviceId);
    if (!svc) return res.status(400).json({ success: false, message: 'Invalid service' });

    const eng = await Consulting.create({
      client:          clientId,
      clientName:      client.name,
      clientEmail:     client.email,
      companyName:     client.company || client.name,
      serviceId,
      serviceName:     svc.name,
      serviceCategory: svc.category,
      currentStage:    'proposal',
      quotedFee:       quotedFee || svc.startingFee,
      scopeNotes:      scopeNotes || '',
      priority:        priority || 'high',
      salesNote:       salesNote || '',
      isCustomSolution: true,
      customSolutionFor: clientId,
      salesFlag:       true,
      stageHistory: [
        {
          stage: 'inquiry', label: 'Enquiry Received', completedAt: new Date(),
          note: 'Initiated by admin / sales team.',
        },
        {
          stage: 'proposal', label: 'Proposal Sent', completedAt: new Date(),
          note: scopeNotes || `Custom solution for ${client.name} — ${svc.name}`,
        },
      ],
      deliverables: svc.deliverables.map(name => ({ name, status: 'pending' })),
    });

    res.status(201).json({ success: true, data: eng, message: `Custom solution created for ${client.name}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/consulting/admin/:id/add-note  —  Add admin note
router.patch('/admin/:id/add-note', protect, isAdmin, async (req, res) => {
  try {
    const { note } = req.body;
    const eng = await Consulting.findById(req.params.id);
    eng.adminNotes.push({ note, createdBy: req.user.name });
    await eng.save();
    res.json({ success: true, data: eng });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/consulting/admin/:id/flag-sales  —  Flag for sales
router.patch('/admin/:id/flag-sales', protect, isAdmin, async (req, res) => {
  try {
    const { salesNote } = req.body;
    const eng = await Consulting.findByIdAndUpdate(
      req.params.id,
      { salesFlag: true, salesNote: salesNote || 'Follow up required' },
      { new: true }
    );
    res.json({ success: true, data: eng });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Gap Profile (admin intelligence) ─────────────────────────────────────────

// GET /api/consulting/admin/gap-profiles  —  All user gap profiles
router.get('/admin/gap-profiles', protect, isAdmin, async (req, res) => {
  try {
    const profiles = await GapProfile.find()
      .sort({ priorityScore: -1 })
      .populate('user', 'name email company role createdAt');
    res.json({ success: true, data: profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/consulting/admin/gap-profiles  —  Create or update gap profile for a user
router.post('/admin/gap-profiles', protect, isAdmin, async (req, res) => {
  try {
    const { userId, gaps, salesOwner, nextAction, nextActionDate } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const score = (gaps || []).reduce((acc, g) => {
      const u = g.urgency === 'high' ? 30 : g.urgency === 'medium' ? 15 : 5;
      return acc + u;
    }, 0);

    const profile = await GapProfile.findOneAndUpdate(
      { user: userId },
      {
        user:          userId,
        userName:      user.name,
        userEmail:     user.email,
        companyName:   user.company || user.name,
        companyRole:   user.role,
        gaps:          gaps || [],
        priorityScore: score,
        lastReviewed:  new Date(),
        salesOwner:    salesOwner || req.user.name,
        nextAction:    nextAction || '',
        nextActionDate: nextActionDate || null,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: profile, message: 'Gap profile saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/consulting/admin/intelligence  —  Sales intelligence: users with gaps, no engagements
router.get('/admin/intelligence', protect, isAdmin, async (req, res) => {
  try {
    const allProfiles = await GapProfile.find()
      .sort({ priorityScore: -1 })
      .populate('user', 'name email company role createdAt');

    // Users who have gap profiles but no active consulting engagements
    const activeClientIds = await Consulting.distinct('client', { status: 'active' });
    const opportunityList = allProfiles.map(p => ({
      ...p.toObject(),
      hasActiveEngagement: activeClientIds.some(id => id.toString() === p.user?._id?.toString()),
    }));

    // Summary per service: how many clients need it
    const serviceNeeds = {};
    CONSULTING_SERVICES.forEach(s => { serviceNeeds[s.id] = { service: s, count: 0, clients: [] }; });
    allProfiles.forEach(p => {
      (p.gaps || []).filter(g => !g.addressed).forEach(g => {
        if (g.serviceId && serviceNeeds[g.serviceId]) {
          serviceNeeds[g.serviceId].count++;
          serviceNeeds[g.serviceId].clients.push({ name: p.userName, company: p.companyName, urgency: g.urgency });
        }
      });
    });

    res.json({
      success: true,
      data: {
        opportunityList,
        serviceNeeds: Object.values(serviceNeeds).sort((a, b) => b.count - a.count),
        totalProfiles: allProfiles.length,
        highPriority: allProfiles.filter(p => p.priorityScore >= 30).length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/consulting/admin/users-for-gap  —  Eligible users for gap profiling
router.get('/admin/users-for-gap', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['supplier', 'customer'] }, isActive: true })
      .select('name email company role createdAt')
      .limit(100);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
