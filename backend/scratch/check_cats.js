import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String
});
const Product = mongoose.model('Product', ProductSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const categories = await Product.distinct('category');
  const count = await Product.countDocuments();
  console.log('Total Products:', count);
  console.log('Categories:', categories);
  process.exit();
}
check();
