const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['customer', 'supplier', 'admin'], default: 'customer' },
    company: { type: String, trim: true },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    isActive: { type: Boolean, default: true },
    profileImage: { type: String, default: '' },
    // For suppliers
    supplierInfo: {
      businessType: String,
      gstNumber: String,
      rating: { type: Number, default: 0 },
      totalDeals: { type: Number, default: 0 },
      verified: { type: Boolean, default: false },
    },
    // Search & suggestion tracking
    searchHistory: [{ query: String, timestamp: { type: Date, default: Date.now } }],
    viewedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    preferences: [String],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
