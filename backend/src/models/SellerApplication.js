import mongoose from 'mongoose';

const sellerApplicationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
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
  businessPhone: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['Aadhar Card', 'Voter ID', 'PAN Card', 'Driving License', 'Passport', 'Other']
  },
  documentPath: { 
    type: String, 
    required: true // Path to the uploaded document
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' 
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('SellerApplication', sellerApplicationSchema);
