import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  street: String,
  city: String,
  state: String,
  zip: String,
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const chatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  addresses: [addressSchema],
  sizeProfile: {
    topSize: { type: String, default: '' },
    bottomSize: { type: String, default: '' },
    shoeSize: { type: String, default: '' },
    preferredBrands: { type: Map, of: String, default: {} }
  },
  stylePreferences: [{ type: String }],
  chatHistory: [chatMessageSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  role: { type: String, enum: ['user', 'seller', 'admin', 'delivery'], default: 'user' },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  deliveryProfile: {
    isOnline: { type: Boolean, default: false },
    vehicleNumber: { type: String, default: '' },
    vehicleType: { type: String, default: 'Bike' },
    aadharOrLicense: { type: String, default: '' },
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    cashCollected: { type: Number, default: 0 },   // COD cash held, needs to be remitted
    totalEarnings: { type: Number, default: 0 },     // Lifetime delivery earnings
    remittanceHistory: [{
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    }]
  },
  sellerProfile: {
    storeName: { type: String, default: '' },
    storeDescription: { type: String, default: '' },
    businessAddress: { type: String, default: '' },
    businessPhone: { type: String, default: '' },
    categories: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    returnPolicy: { type: String, default: '7-day' },
    processingTime: { type: Number, default: 1 },
    autoConfirmOrders: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 5 },
    notifyOrders: { type: Boolean, default: true },
    notifyLowStock: { type: Boolean, default: true },
    notifyReviews: { type: Boolean, default: false },
    vacationMode: { type: Boolean, default: false },
    hubLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    }
  }
}, {
  timestamps: true
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);
