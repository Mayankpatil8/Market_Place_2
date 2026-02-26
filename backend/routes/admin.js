const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Deal = require('../models/Deal');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// @GET /api/admin/dashboard — summary stats
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalDeals] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Deal.countDocuments(),
    ]);

    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalFees: { $sum: '$platformFee' }, totalOrders: { $sum: 1 } } },
    ]);

    const dealRevenue = await Deal.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalValue: { $sum: '$totalValue' }, totalFees: { $sum: '$platformFee' } } },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          fees: { $sum: '$platformFee' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const topProducts = await Product.find().sort({ totalSold: -1 }).limit(5).select('name totalSold price category');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalDeals,
        revenue: revenueData[0] || { totalRevenue: 0, totalFees: 0 },
        dealRevenue: dealRevenue[0] || { totalValue: 0, totalFees: 0 },
        ordersByStatus,
        monthlyRevenue,
        usersByRole,
        topProducts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/profit-loss — detailed P&L
router.get('/profit-loss', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthly = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${Number(year) + 1}-01-01`) },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          grossRevenue: { $sum: '$totalAmount' },
          platformFees: { $sum: '$platformFee' },
          supplierPayouts: { $sum: '$supplierEarning' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dealMonthly = await Deal.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${Number(year) + 1}-01-01`) },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          dealRevenue: { $sum: '$totalValue' },
          dealFees: { $sum: '$platformFee' },
          dealCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, year: Number(year), monthly, dealMonthly });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/users — all users
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { company: new RegExp(search, 'i') }];

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, total, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive, role, 'supplierInfo.verified': verified } = req.body;
    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;
    if (verified !== undefined) updateData['supplierInfo.verified'] = verified;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/orders — all orders
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/deals
router.get('/deals', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Deal.countDocuments(query);
    const deals = await Deal.find(query)
      .populate('supplier', 'name company')
      .populate('buyer', 'name company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, deals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
