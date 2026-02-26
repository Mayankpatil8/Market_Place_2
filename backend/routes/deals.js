const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const { protect, authorize } = require('../middleware/auth');

// @POST /api/deals — supplier creates deal
router.post('/', protect, authorize('supplier', 'admin'), async (req, res) => {
  try {
    const deal = await Deal.create({ ...req.body, supplier: req.user._id, timeline: [{ status: 'proposed', updatedBy: req.user._id, note: 'Deal proposed' }] });
    res.status(201).json({ success: true, deal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @GET /api/deals — list
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    let query = {};
    if (req.user.role === 'supplier') query.supplier = req.user._id;
    else if (req.user.role === 'customer') query.buyer = req.user._id;
    if (status) query.status = status;

    const total = await Deal.countDocuments(query);
    const deals = await Deal.find(query)
      .populate('supplier', 'name company supplierInfo.verified')
      .populate('buyer', 'name company')
      .populate('products.product', 'name price category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, deals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/deals/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('supplier', 'name company phone email')
      .populate('buyer', 'name company email')
      .populate('products.product');
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, deal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/deals/:id/status — update deal status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    deal.status = status;
    deal.timeline.push({ status, updatedBy: req.user._id, note: note || `Status updated to ${status}` });
    await deal.save();
    res.json({ success: true, deal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/deals/:id/assign-buyer — buyer/customer requests to join deal
router.put('/:id/assign-buyer', protect, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, { buyer: req.user._id, status: 'negotiating' }, { new: true });
    res.json({ success: true, deal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
