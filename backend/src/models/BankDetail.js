import mongoose from 'mongoose';

const bankDetailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  accountHolderName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  ifscCode: { type: String, required: true },
  branchName: { type: String },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('BankDetail', bankDetailSchema);
