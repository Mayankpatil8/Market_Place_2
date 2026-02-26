const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/users/search — search people/companies
router.get('/search', protect, async (req, res) => {
  try {
    const { q, role, page = 1, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });

    const query = {
      isActive: true,
      $or: [
        { name: new RegExp(q, 'i') },
        { company: new RegExp(q, 'i') },
        { 'supplierInfo.businessType': new RegExp(q, 'i') },
      ],
    };
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('name email company role phone supplierInfo.rating supplierInfo.verified supplierInfo.businessType createdAt')
      .sort({ 'supplierInfo.rating': -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/:id/profile — public profile
router.get('/:id/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -searchHistory -viewedProducts');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/guide/startup — guide for startups on how to use platform
router.get('/guide/startup', protect, async (req, res) => {
  const guide = {
    title: 'How to Get Started as a Startup',
    steps: [
      { step: 1, title: 'Complete Your Profile', description: 'Add your company name, business type, GST number and contact details to get better deal suggestions.' },
      { step: 2, title: 'Browse Products', description: 'Search products by category: Motors, Semiconductors, Defence components, Electronics, and more.' },
      { step: 3, title: 'Explore Open Deals', description: 'Suppliers post bulk deals for companies. Find deals that match your requirements and connect with suppliers.' },
      { step: 4, title: 'Connect with Suppliers', description: 'Use the supplier directory to find verified suppliers and request a deal or bulk order.' },
      { step: 5, title: 'Track Everything', description: 'Monitor your orders, deals, and spending from your dashboard in real-time.' },
    ],
    tips: [
      'Verified suppliers have a blue badge — they are more reliable.',
      'Use filters to find products within your budget.',
      'Send deal requests with your quantity needs for better pricing.',
      'Check the P&L summary in your dashboard to track spending.',
    ],
  };
  res.json({ success: true, guide });
});

module.exports = router;
