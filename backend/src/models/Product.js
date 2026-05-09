import mongoose from 'mongoose';

const deliveryZoneSchema = new mongoose.Schema({
  zipPrefix: { type: String, required: true },
  estimatedMinutes: { type: Number, required: true }
}, { _id: false });

const sizeStockSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  isActive: { type: Boolean, default: true },
  name: { type: String, required: true, index: true },
  brand: { type: String, required: true, index: true },
  category: {
    type: String,
    required: true,
    enum: ['dress', 'shirt', 'jeans', 'tshirt', 'jacket', 'accessory', 'shoes', 'outerwear', 'skirt', 'shorts', 'sweater', 'bag', 'jewelry'],
    index: true
  },
  subcategory: { type: String, default: '' },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: null },
  discountPercent: { type: Number, default: 0 },
  sizes: [sizeStockSchema],
  colors: [{ type: String }],
  images: [{ type: String }],
  colorImages: [{
    color: { type: String },
    images: [{ type: String }]
  }],
  description: { type: String, default: '' },
  tags: [{
    type: String,
    enum: ['casual', 'formal', 'party', 'wedding', 'sporty', 'bohemian', 'streetwear', 'vintage', 'minimalist', 'trendy', 'classic', 'layering', 'semi-formal', 'date-night', 'office', 'beach', 'festival']
  }],
  occasion: [{ type: String }],
  weather: [{
    type: String,
    enum: ['hot', 'cold', 'mild', 'rainy', 'all-season']
  }],
  styleEmbedding: {
    type: [Number],
    default: [],
    validate: {
      validator: function(v) {
        return v.length === 0 || v.length === 1536;
      },
      message: 'Style embedding must be 1536 dimensions or empty'
    }
  },
  deliveryZones: [deliveryZoneSchema],
  bundleCompatible: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  gender: {
    type: String,
    enum: ['men', 'women', 'kids', 'unisex'],
    default: 'unisex'
  },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isAvailableForRent: { type: Boolean, default: false },
  rentPricePerDay: { type: Number, default: null }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text search index
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

// Compound indexes for fast filtering
productSchema.index({ category: 1, gender: 1, price: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ occasion: 1 });
productSchema.index({ 'deliveryZones.zipPrefix': 1 });

// Virtual for effective price
productSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice || this.price;
});

export default mongoose.model('Product', productSchema);
