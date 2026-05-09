import mongoose from 'mongoose';

const addressEntrySchema = new mongoose.Schema({
  label: { type: String, default: '' },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  location: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

const userDeliveryAddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  addresses: [addressEntrySchema]
}, { timestamps: true });

export default mongoose.model('UserDeliveryAddress', userDeliveryAddressSchema);
