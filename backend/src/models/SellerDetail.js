import mongoose from 'mongoose';

const sellerDetailSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  storeName: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  categories: { 
    type: String, 
    required: true 
  },
  documentType: {
    type: String,
    required: true
  },
  documentPath: { 
    type: String, 
    required: true
  },
  businessPhone: {
    type: String,
    default: ''
  },
  gstNumber: {
    type: String,
    default: ''
  },
  returnPolicy: {
    type: String,
    enum: ['7-day', '15-day', '30-day', 'no-returns'],
    default: '7-day'
  },
  processingTime: {
    type: Number,
    default: 1 // days
  },
  autoConfirmOrders: {
    type: Boolean,
    default: false
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  notifyOrders: {
    type: Boolean,
    default: true
  },
  notifyLowStock: {
    type: Boolean,
    default: true
  },
  notifyReviews: {
    type: Boolean,
    default: false
  },
  vacationMode: {
    type: Boolean,
    default: false
  },
  hubLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SellerApplication',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'sellerDetails' // Explicitly set collection name as requested
});

export default mongoose.model('SellerDetail', sellerDetailSchema);
