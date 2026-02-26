const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    dealNumber: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // company/startup
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        agreedPrice: Number,
      },
    ],
    totalValue: { type: Number, required: true },
    platformFee: { type: Number },
    supplierEarning: { type: Number },
    category: { type: String },
    dealType: { type: String, enum: ['b2b', 'bulk', 'contract', 'one-time'], default: 'b2b' },
    status: {
      type: String,
      enum: ['proposed', 'negotiating', 'agreed', 'in-progress', 'completed', 'cancelled'],
      default: 'proposed',
    },
    startDate: Date,
    endDate: Date,
    contractTerms: String,
    notes: String,
    timeline: [
      {
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

dealSchema.pre('save', async function (next) {
  if (!this.dealNumber) {
    const count = await mongoose.model('Deal').countDocuments();
    this.dealNumber = `DEAL-${Date.now()}-${count + 1}`;
  }
  this.platformFee = +(this.totalValue * 0.015).toFixed(2);
  this.supplierEarning = +(this.totalValue - this.platformFee).toFixed(2);
  next();
});

module.exports = mongoose.model('Deal', dealSchema);
