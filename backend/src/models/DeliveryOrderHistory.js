import mongoose from 'mongoose';

const deliveryOrderHistorySchema = new mongoose.Schema({
  deliveryBoyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  totalOrdersDelivered: { type: Number, default: 0 },
  todayOrders: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  todayEarnings: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

export default mongoose.model('DeliveryOrderHistory', deliveryOrderHistorySchema);
