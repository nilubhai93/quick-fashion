import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  size: String,
  color: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  isRental: { type: Boolean, default: false },
  isRated: { type: Boolean, default: false },
  userRating: { type: Number, default: 0 },
  rentalDays: { type: Number, default: 0 },
  rentPricePerDay: { type: Number, default: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'picking', 'out-for-delivery', 'reached', 'delivered', 'return-requested', 'returning', 'returned', 'cancelled'],
    default: 'placed'
  },
  deliveredAt: { type: Date, default: null },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  deliveryLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  estimatedDeliveryMinutes: { type: Number, default: 30 },
  estimatedDeliveryTime: { type: Date },
  isBundle: { type: Boolean, default: false },
  bundleDiscount: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'upi', 'wallet'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  delivery: {
    deliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['unassigned', 'assigned', 'accepted', 'rejected'], default: 'unassigned' },
    rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  deliveryOTP: { type: String, default: null },
  sellerHubLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  deliveryDistanceKm: { type: Number, default: 0 },
  deliveryEarnings: { type: Number, default: 0 },
  cancelReason: { type: String, default: null },
  cancelledBy: { type: String, enum: ['user', 'seller', 'admin'], default: null },
  returnDetails: {
    reason: String,
    description: String,
    photo: String,
    pickupLocation: {
      lat: Number,
      lng: Number,
      address: String
    },
    returnDeliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    pickupPhoto: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
