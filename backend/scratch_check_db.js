import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import 'dotenv/config';

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionApp');
    console.log('Connected to DB');
    
    const products = await Product.find({ name: /Leather/i });
    console.log(`Found ${products.length} products with "Leather" in name:`);
    products.forEach(p => {
      console.log(`- ID: ${p._id}, Name: "${p.name}", Brand: "${p.brand}", Category: "${p.category}", isActive: ${p.isActive}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
