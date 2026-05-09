import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';

const products = [
  {
    name: "Blue Formal Cotton Shirt",
    brand: "Classic Styles",
    category: "shirt",
    price: 1299,
    discountPrice: 999,
    colors: ["Blue", "Sky Blue"],
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 15 },
      { size: "L", stock: 5 }
    ],
    description: "Premium 100% cotton blue formal shirt for office wear. Breathable material and slim fit design.",
    tags: ["formal", "office", "minimalist", "classic"],
    occasion: ["office", "interview"],
    weather: ["all-season"],
    gender: "men",
    images: ["/images/product_tshirt.png"]
  },
  {
    name: "White Linen Summer Shirt",
    brand: "Breeze Fashion",
    category: "shirt",
    price: 1899,
    discountPrice: 1599,
    colors: ["White"],
    sizes: [
      { size: "M", stock: 12 },
      { size: "L", stock: 8 },
      { size: "XL", stock: 4 }
    ],
    description: "Lightweight white linen shirt perfect for summer days and casual outings. 100% natural linen.",
    tags: ["casual", "trendy", "beach"],
    occasion: ["casual", "beach"],
    weather: ["hot"],
    gender: "men",
    images: ["/images/product_tshirt.png"]
  },
  {
    name: "Silk Blend Evening Dress",
    brand: "Gala Glamour",
    category: "dress",
    price: 4999,
    discountPrice: 3999,
    colors: ["Red", "Maroon"],
    sizes: [
      { size: "S", stock: 5 },
      { size: "M", stock: 8 }
    ],
    description: "Stunning silk blend red dress for evening parties and weddings. Features a subtle shimmer and elegant drape.",
    tags: ["party", "wedding", "classic"],
    occasion: ["party", "wedding", "date-night"],
    weather: ["mild"],
    gender: "women",
    images: ["/images/product_dress.png"]
  },
  {
    name: "Slim Fit Indigo Jeans",
    brand: "Denim Co",
    category: "jeans",
    price: 2499,
    discountPrice: 1999,
    colors: ["Indigo", "Blue"],
    sizes: [
      { size: "30", stock: 15 },
      { size: "32", stock: 20 },
      { size: "34", stock: 10 }
    ],
    description: "Durable indigo denim jeans with a slim fit. 98% cotton, 2% spandex for a comfortable stretch.",
    tags: ["casual", "streetwear", "trendy"],
    occasion: ["casual", "hangout"],
    weather: ["all-season"],
    gender: "men",
    images: ["/images/product_sneakers.png"]
  },
  {
    name: "Tech-Knit Sports Jacket",
    brand: "ActiveGear",
    category: "jacket",
    price: 3499,
    discountPrice: 2799,
    colors: ["Black", "Grey"],
    sizes: [
      { size: "M", stock: 10 },
      { size: "L", stock: 10 }
    ],
    description: "Moisture-wicking tech-knit jacket for gym and outdoor sports. Features reflective strips for safety.",
    tags: ["sporty", "trendy", "layering"],
    occasion: ["gym", "casual"],
    weather: ["cold", "mild"],
    gender: "unisex",
    images: ["/images/product_jacket.png"]
  },
  {
    name: "Floral Print Summer Dress",
    brand: "Bloom",
    category: "dress",
    price: 2299,
    discountPrice: 1699,
    colors: ["Yellow", "Floral"],
    sizes: [
      { size: "XS", stock: 4 },
      { size: "S", stock: 10 },
      { size: "M", stock: 12 }
    ],
    description: "Beautiful yellow floral print dress in soft viscose material. Perfect for brunches and casual dates.",
    tags: ["casual", "bohemian", "trendy"],
    occasion: ["casual", "date-night"],
    weather: ["hot", "mild"],
    gender: "women",
    images: ["/images/product_dress.png"]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fashionapp' });
    
    // Optional: Clear existing "dummy" data
    // await Product.deleteMany({});
    
    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}
seed();
