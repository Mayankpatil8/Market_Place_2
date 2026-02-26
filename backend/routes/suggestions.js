const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Deal = require('../models/Deal');
const { protect } = require('../middleware/auth');

// @GET /api/suggestions/products — smart product recommendations
router.get('/products', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('viewedProducts', 'category tags');
    const suggestions = [];

    // 1. Based on viewed product categories
    if (user.viewedProducts && user.viewedProducts.length > 0) {
      const viewedCategories = [...new Set(user.viewedProducts.map((p) => p.category))];
      const categoryBased = await Product.find({
        category: { $in: viewedCategories },
        _id: { $nin: user.viewedProducts.map((p) => p._id) },
        isActive: true,
      })
        .sort({ rating: -1, totalSold: -1 })
        .limit(6)
        .populate('supplier', 'name company');
      suggestions.push(...categoryBased);
    }

    // 2. Based on search history keywords
    if (user.searchHistory && user.searchHistory.length > 0) {
      const recentSearches = user.searchHistory.slice(-5).map((s) => s.query);
      const searchKeyword = recentSearches.join(' ');
      const searchBased = await Product.find({ $text: { $search: searchKeyword }, isActive: true })
        .sort({ score: { $meta: 'textScore' } })
        .limit(4)
        .populate('supplier', 'name company');
      suggestions.push(...searchBased);
    }

    // 3. Trending / popular products
    const trending = await Product.find({ isActive: true })
      .sort({ totalSold: -1, views: -1 })
      .limit(4)
      .populate('supplier', 'name company');
    suggestions.push(...trending);

    // Remove duplicates
    const uniqueMap = new Map();
    suggestions.forEach((p) => uniqueMap.set(p._id.toString(), p));
    const uniqueSuggestions = Array.from(uniqueMap.values()).slice(0, 12);

    res.json({ success: true, suggestions: uniqueSuggestions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/suggestions/deals — suggest deals to startups/companies
router.get('/deals', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Suggest open deals based on user preferences or company type
    const deals = await Deal.find({ status: 'proposed', buyer: null })
      .populate('supplier', 'name company supplierInfo')
      .populate('products.product', 'name category price')
      .sort({ totalValue: -1 })
      .limit(10);

    res.json({ success: true, suggestedDeals: deals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/suggestions/companies — suggest companies/users to connect with
router.get('/companies', protect, async (req, res) => {
  try {
    const companies = await User.find({
      role: 'supplier',
      isActive: true,
      'supplierInfo.verified': true,
      _id: { $ne: req.user._id },
    })
      .select('name company supplierInfo.rating supplierInfo.totalDeals supplierInfo.businessType')
      .sort({ 'supplierInfo.rating': -1 })
      .limit(10);
    res.json({ success: true, companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/suggestions/track-search — save search for better suggestions
router.post('/track-search', protect, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Query required' });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { searchHistory: { $each: [{ query, timestamp: new Date() }], $slice: -20 } },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/suggestions/track-view — save viewed product
router.post('/track-view', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { viewedProducts: productId },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
