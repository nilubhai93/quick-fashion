import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  size: { type: String, required: true },
  color: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  isRental: { type: Boolean, default: false },
  rentalDays: { type: Number, default: 0 }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  bundleSuggestion: {
    isActive: { type: Boolean, default: false },
    bundleName: { type: String, default: '' },
    suggestedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    discount: { type: Number, default: 0 },
    expiresAt: { type: Date }
  }
}, {
  timestamps: true
});

export default mongoose.model('Cart', cartSchema);
