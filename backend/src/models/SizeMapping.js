import mongoose from 'mongoose';

const sizeMappingSchema = new mongoose.Schema({
  referenceBrand: { type: String, required: true },
  referenceSize: { type: String, required: true },
  category: { type: String, required: true },
  ourBrandSize: { type: String, required: true },
  fitNotes: { type: String },
  measurementsCm: {
    chest: { type: Number },
    waist: { type: Number },
    length: { type: Number },
    hips: { type: Number },
    shoulders: { type: Number }
  }
}, {
  timestamps: true
});

// Compound index for quick lookups
sizeMappingSchema.index({ referenceBrand: 1, referenceSize: 1, category: 1 }, { unique: true });

export default mongoose.model('SizeMapping', sizeMappingSchema);
