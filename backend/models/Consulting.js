const mongoose = require('mongoose');

// ─── Consulting Service Categories ───────────────────────────────────────────
const CONSULTING_SERVICES = [
  {
    id: 'supply_chain',
    name: 'Supply Chain Optimisation',
    icon: '🔗',
    category: 'Operations',
    tagline: 'Cut costs. Reduce lead times. Build resilience.',
    description:
      'End-to-end supply chain assessment and redesign. We map your current flows, identify bottlenecks, and implement lean procurement, supplier diversification, and inventory optimisation strategies proven across European manufacturing.',
    deliverables: [
      'Supply chain mapping & bottleneck audit',
      'Supplier risk assessment matrix',
      'Inventory optimisation model',
      'Lead time reduction roadmap',
      'Dual-source supplier strategy',
      'KPI dashboard for ongoing monitoring',
    ],
    outcomes: ['30% average lead time reduction', 'Up to 22% inventory cost savings', 'Supplier risk score improvement'],
    duration: '6–10 weeks',
    startingFee: 8500,
    colour: '#c9a84c',
    tags: ['Manufacturing', 'Logistics', 'Procurement'],
  },
  {
    id: 'sales_strategy',
    name: 'Sales & Revenue Strategy',
    icon: '📈',
    category: 'Commercial',
    tagline: 'Build a pipeline that actually converts.',
    description:
      'From prospect identification to closing frameworks — our commercial consultants redesign your sales motion for European B2B markets. Includes CRM setup, pricing strategy, account tiering, and sales team capability building.',
    deliverables: [
      'Go-to-market strategy document',
      'Ideal customer profile (ICP) definition',
      'Sales process design & playbook',
      'Pricing architecture review',
      'CRM structure and pipeline setup',
      'Sales team training programme',
    ],
    outcomes: ['Average 40% pipeline growth in 90 days', '18% improvement in close rate', 'Revenue forecasting accuracy +60%'],
    duration: '4–8 weeks',
    startingFee: 7200,
    colour: '#7dd3fc',
    tags: ['B2B Sales', 'Revenue', 'CRM'],
  },
  {
    id: 'market_entry',
    name: 'European Market Entry',
    icon: '🌍',
    category: 'Strategy',
    tagline: 'Enter Europe the right way.',
    description:
      'Structured market entry programme for manufacturers and suppliers expanding into Germany, France, Poland, Italy and beyond. Covers regulatory readiness, channel partner identification, pricing localisation, and entity setup advisory.',
    deliverables: [
      'Market opportunity assessment by country',
      'Regulatory landscape & compliance matrix',
      'Channel partner long-list & evaluation',
      'Localised pricing model',
      'Trade show & industry event calendar',
      'Go-live 90-day action plan',
    ],
    outcomes: ['Average time-to-first-customer: 4.5 months', 'Channel partner close rate: 68%', '12 EU markets covered'],
    duration: '8–12 weeks',
    startingFee: 12000,
    colour: '#86efac',
    tags: ['Market Entry', 'Europe', 'Strategy'],
  },
  {
    id: 'operations_excellence',
    name: 'Operational Excellence',
    icon: '⚙',
    category: 'Operations',
    tagline: 'Lean. Efficient. Scalable.',
    description:
      'Lean manufacturing implementation, waste elimination (7 types of muda), OEE improvement, and process standardisation. Our industrial engineers work on the shop floor alongside your team — not from a boardroom.',
    deliverables: [
      'Current-state value stream map (VSM)',
      'Waste identification & elimination plan',
      'OEE baseline and improvement targets',
      'Standard operating procedures (SOPs)',
      'Kaizen workshop facilitation',
      'Future-state VSM & implementation plan',
    ],
    outcomes: ['Average OEE improvement: +18 points', 'Scrap rate reduction: 35%', 'Labour productivity gain: +25%'],
    duration: '6–12 weeks',
    startingFee: 9800,
    colour: '#c4b5fd',
    tags: ['Lean', 'Manufacturing', 'OEE'],
  },
  {
    id: 'digital_transformation',
    name: 'Digital Transformation',
    icon: '💻',
    category: 'Technology',
    tagline: 'Industry 4.0 without the buzzwords.',
    description:
      'Practical digitalisation roadmap for industrial companies. ERP selection and implementation support, IoT readiness assessment, MES integration, and data analytics capability building — grounded in ROI, not theory.',
    deliverables: [
      'Digital maturity assessment (Industry 4.0)',
      'ERP/MES selection support',
      'IoT & sensor integration roadmap',
      'Data analytics use-case prioritisation',
      'Change management programme',
      'Technology vendor evaluation matrix',
    ],
    outcomes: ['ERP implementation risk reduction: 60%', 'Data-driven decision adoption: 80%', 'Average ROI payback: 14 months'],
    duration: '8–16 weeks',
    startingFee: 14500,
    colour: '#f9a8d4',
    tags: ['Industry 4.0', 'ERP', 'IoT'],
  },
  {
    id: 'financial_advisory',
    name: 'Financial & Growth Advisory',
    icon: '💳',
    category: 'Finance',
    tagline: 'Capital strategy for industrial growth.',
    description:
      'Financial restructuring, growth financing strategy, EBITDA improvement programmes, and investor readiness. Our CFO-level advisors have guided 80+ European industrial companies through fundraising, PE due diligence, and M&A.',
    deliverables: [
      'Financial health diagnostic',
      'EBITDA improvement roadmap',
      'Working capital optimisation plan',
      'Funding options assessment (debt/equity)',
      'Investor pitch deck & data room',
      'M&A readiness checklist',
    ],
    outcomes: ['Average EBITDA improvement: +4 points', 'Working capital release: up to €2M', 'Fundraising success rate: 74%'],
    duration: '4–10 weeks',
    startingFee: 11000,
    colour: '#fca5a5',
    tags: ['Finance', 'Fundraising', 'M&A'],
  },
  {
    id: 'hr_talent',
    name: 'HR & Talent Development',
    icon: '👥',
    category: 'People',
    tagline: 'Build the team that builds your products.',
    description:
      'Organisational design, workforce planning, skills gap analysis, and leadership development for industrial companies scaling from 50 to 500+ employees. Specialising in engineering and technical talent in European markets.',
    deliverables: [
      'Organisational structure review',
      'Skills gap analysis by department',
      'Recruitment process design',
      'Compensation benchmarking (EU markets)',
      'Leadership development programme',
      'Retention & engagement strategy',
    ],
    outcomes: ['Recruitment time-to-hire: -40%', 'Retention rate improvement: +18%', 'Team productivity index: +22%'],
    duration: '4–8 weeks',
    startingFee: 6500,
    colour: '#6ee7b7',
    tags: ['HR', 'Talent', 'Leadership'],
  },
  {
    id: 'esg_sustainability',
    name: 'ESG & Sustainability',
    icon: '🌿',
    category: 'Compliance',
    tagline: 'Sustainable by design. Compliant by default.',
    description:
      'ESG strategy development, carbon footprint assessment, EU Taxonomy compliance, and sustainability reporting (CSRD/GRI). Increasingly required by defence primes, institutional buyers, and European lenders.',
    deliverables: [
      'ESG materiality assessment',
      'Carbon footprint baseline (Scope 1,2,3)',
      'EU Taxonomy alignment report',
      'CSRD readiness assessment',
      'Science-Based Targets (SBTs) roadmap',
      'Annual sustainability report template',
    ],
    outcomes: ['Regulatory fine risk: eliminated', 'ESG score improvement: avg +28 points', 'Green finance eligibility: unlocked'],
    duration: '6–10 weeks',
    startingFee: 7800,
    colour: '#34d399',
    tags: ['ESG', 'CSRD', 'Sustainability'],
  },
];

// ─── Engagement Stages ────────────────────────────────────────────────────────
const ENGAGEMENT_STAGES = [
  { key: 'inquiry',      label: 'Enquiry Received',        order: 1 },
  { key: 'scoping',      label: 'Scoping Call Scheduled',  order: 2 },
  { key: 'proposal',     label: 'Proposal Sent',            order: 3 },
  { key: 'signed',       label: 'Engagement Signed',        order: 4 },
  { key: 'discovery',    label: 'Discovery & Assessment',   order: 5 },
  { key: 'delivery',     label: 'Delivery In Progress',     order: 6 },
  { key: 'review',       label: 'Client Review',            order: 7 },
  { key: 'completed',    label: 'Engagement Complete',      order: 8 },
  { key: 'follow_up',    label: 'Follow-Up / Expansion',    order: 9 },
];

// ─── Need Assessment (what the admin sees as gaps) ───────────────────────────
const NEED_CATEGORIES = [
  { id: 'supply_chain_weak',    label: 'Weak Supply Chain',         serviceId: 'supply_chain',          urgency: 'high' },
  { id: 'no_sales_process',     label: 'No Formal Sales Process',   serviceId: 'sales_strategy',        urgency: 'high' },
  { id: 'no_eu_presence',       label: 'No EU Market Presence',     serviceId: 'market_entry',          urgency: 'medium' },
  { id: 'low_oee',              label: 'Low OEE / High Scrap',      serviceId: 'operations_excellence', urgency: 'high' },
  { id: 'no_erp',               label: 'No ERP / Manual Processes', serviceId: 'digital_transformation',urgency: 'medium' },
  { id: 'funding_gap',          label: 'Funding / Growth Gap',      serviceId: 'financial_advisory',    urgency: 'high' },
  { id: 'talent_gap',           label: 'Team / Talent Gap',         serviceId: 'hr_talent',             urgency: 'medium' },
  { id: 'no_esg',               label: 'No ESG Programme',          serviceId: 'esg_sustainability',    urgency: 'low'  },
];

// ─── Stage History Entry ──────────────────────────────────────────────────────
const stageHistorySchema = new mongoose.Schema({
  stage:       { type: String, required: true },
  label:       { type: String },
  completedAt: { type: Date },
  note:        { type: String },
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// ─── Deliverable Item ─────────────────────────────────────────────────────────
const deliverableSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  status:     { type: String, enum: ['pending', 'in_progress', 'submitted', 'approved'], default: 'pending' },
  dueDate:    Date,
  deliveredAt: Date,
  fileUrl:    String,
  note:       String,
});

// ─── Main Consulting Engagement Schema ───────────────────────────────────────
const consultingSchema = new mongoose.Schema(
  {
    // Applicant
    client:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientName:     String,
    clientEmail:    String,
    companyName:    String,
    companySize:    String,
    industry:       String,

    // Service
    serviceId:      { type: String, enum: CONSULTING_SERVICES.map(s => s.id), required: true },
    serviceName:    String,
    serviceCategory: String,

    // Engagement lifecycle
    currentStage: {
      type: String,
      enum: ENGAGEMENT_STAGES.map(s => s.key),
      default: 'inquiry',
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'on_hold', 'cancelled'],
      default: 'active',
    },

    progressPercent: { type: Number, default: 10 },

    stageHistory: [stageHistorySchema],

    // Scope & deliverables
    scopeNotes:  String,
    deliverables: [deliverableSchema],

    // Financials
    quotedFee:   { type: Number, default: 0 },
    agreedFee:   { type: Number, default: 0 },
    feePaid:     { type: Boolean, default: false },
    feePaidAt:   Date,
    invoiceNo:   String,

    // Assigned consultant
    consultant:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    consultantName:  String,

    // Timeline
    startDate:  Date,
    endDate:    Date,
    proposalSentAt: Date,

    // Admin / sales intelligence
    adminNotes:    [{ note: String, createdBy: String, createdAt: { type: Date, default: Date.now } }],
    salesFlag:     { type: Boolean, default: false },
    salesNote:     String,
    priority:      { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },

    // Identified business needs (used for admin intelligence)
    identifiedNeeds: [{ type: String }],

    // Client satisfaction
    satisfactionScore: { type: Number, min: 1, max: 10 },
    testimonial:       String,

    // Custom solution flag (admin-created for specific client)
    isCustomSolution: { type: Boolean, default: false },
    customSolutionFor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-compute progress
consultingSchema.pre('save', function (next) {
  const progressMap = {
    inquiry: 10, scoping: 20, proposal: 30, signed: 40,
    discovery: 55, delivery: 70, review: 85, completed: 100, follow_up: 100,
  };
  this.progressPercent = progressMap[this.currentStage] || 10;

  const svc = CONSULTING_SERVICES.find(s => s.id === this.serviceId);
  if (svc) {
    if (!this.serviceName)    this.serviceName    = svc.name;
    if (!this.serviceCategory) this.serviceCategory = svc.category;
    if (!this.quotedFee)      this.quotedFee      = svc.startingFee;
  }
  next();
});

// ─── Business Gap Profile Schema ─────────────────────────────────────────────
// Admin creates/updates this per user to drive sales intelligence
const gapProfileSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    userName:      String,
    userEmail:     String,
    companyName:   String,
    companyRole:   String,

    // Identified gaps
    gaps: [{
      categoryId:   String,
      label:        String,
      serviceId:    String,
      urgency:      { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      notes:        String,
      identifiedAt: { type: Date, default: Date.now },
      identifiedBy: String,
      addressed:    { type: Boolean, default: false },
    }],

    // Scoring
    priorityScore: { type: Number, default: 0 },
    lastReviewed:  Date,
    salesOwner:    String,
    nextAction:    String,
    nextActionDate: Date,
  },
  { timestamps: true }
);

const Consulting    = mongoose.model('Consulting',  consultingSchema);
const GapProfile    = mongoose.model('GapProfile',  gapProfileSchema);

module.exports = { Consulting, GapProfile, CONSULTING_SERVICES, ENGAGEMENT_STAGES, NEED_CATEGORIES };
