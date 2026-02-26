const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name company')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/reviews/:productId
router.post('/:productId', protect, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    if (!rating) return res.status(400).json({ success: false, message: 'Rating required' });

    // Check if verified purchase
    const order = await Order.findOne({
      customer: req.user._id,
      'items.product': req.params.productId,
      status: 'delivered',
    });

    const existing = await Review.findOne({ product: req.params.productId, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this product' });

    const review = await Review.create({
      product: req.params.productId,
      user: req.user._id,
      order: order?._id,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!order,
    });

    await review.populate('user', 'name company');
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
