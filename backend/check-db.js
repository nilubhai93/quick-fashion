import 'dotenv/config';
import mongoose from 'mongoose';
import Order from './src/models/Order.js';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fashionapp' });
  await Order.updateMany({ status: 'confirmed' }, { status: 'placed', 'delivery.status': 'unassigned', 'delivery.deliveryBoyId': null });
  console.log('Reset completed');
  process.exit(0);
}
fix();
