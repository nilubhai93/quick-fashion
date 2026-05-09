import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fashionapp' });
    const count = await Product.countDocuments();
    const samples = await Product.find().limit(5).select('name category price');
    console.log(`Total Products: ${count}`);
    console.log('Sample Products:', JSON.stringify(samples, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
