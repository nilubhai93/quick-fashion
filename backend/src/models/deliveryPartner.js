import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema({
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  vehicleModel: { type: String },
  vehicleNumber: { type: String },
  drivingLicense: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('DeliveryPartner', deliveryPartnerSchema);
