const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Deal = require('../models/Deal');
const { protect } = require('../middleware/auth');

// @GET /api/notifications — real-time activity feed
router.get('/', protect, async (req, res) => {
  try {
    const notifications = [];

    if (req.user.role === 'customer') {
      const orders = await Order.find({ customer: req.user._id }).sort({ updatedAt: -1 }).limit(5);
      orders.forEach(o => notifications.push({
        type: 'order',
        title: `Order ${o.status}`,
        message: `Order ${o.orderNumber} is now ${o.status}`,
        time: o.updatedAt,
        read: false,
      }));
    }

    if (req.user.role === 'supplier') {
      const orders = await Order.find({ 'items.supplier': req.user._id, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).sort({ createdAt: -1 }).limit(5);
      orders.forEach(o => notifications.push({
        type: 'new_order',
        title: 'New Order Received',
        message: `Order ${o.orderNumber} — ₹${o.totalAmount.toLocaleString()}`,
        time: o.createdAt,
        read: false,
      }));

      const deals = await Deal.find({ supplier: req.user._id, buyer: { $ne: null }, updatedAt: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } }).sort({ updatedAt: -1 }).limit(3);
      deals.forEach(d => notifications.push({
        type: 'deal_update',
        title: 'Deal Update',
        message: `Deal "${d.title}" — ${d.status}`,
        time: d.updatedAt,
        read: false,
      }));
    }

    if (req.user.role === 'admin') {
      const recentOrders = await Order.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
      notifications.push({
        type: 'platform',
        title: 'Daily Summary',
        message: `${recentOrders} new orders in the last 24 hours`,
        time: new Date(),
        read: false,
      });
    }

    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json({ success: true, notifications, unread: notifications.filter(n => !n.read).length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
