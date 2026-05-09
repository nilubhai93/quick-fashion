import mongoose from 'mongoose';

const associationRuleSchema = new mongoose.Schema({
  triggerCategory: { type: String, required: true, index: true },
  triggerTags: [{ type: String }],
  suggestedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  suggestedCategories: [{ type: String }],
  confidence: { type: Number, required: true, min: 0, max: 1 },
  bundleDiscount: { type: Number, default: 15 },
  bundleName: { type: String, default: '' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('AssociationRule', associationRuleSchema);
