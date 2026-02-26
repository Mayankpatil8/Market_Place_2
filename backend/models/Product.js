const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['motors', 'semiconductors', 'defence', 'electronics', 'mechanical', 'other'],
      required: true,
    },
    subcategory: { type: String },
    price: { type: Number, required: true, min: 0 },
    minOrderQty: { type: Number, default: 1 },
    unit: { type: String, default: 'piece' },
    stock: { type: Number, default: 0 },
    images: [String],
    specifications: { type: Map, of: String },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [String],
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    // Defence / restricted flag
    isRestricted: { type: Boolean, default: false },
    certifications: [String],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
