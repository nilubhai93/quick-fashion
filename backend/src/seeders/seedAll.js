import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import SizeMapping from '../models/SizeMapping.js';
import AssociationRule from '../models/AssociationRule.js';
import User from '../models/User.js';

const rawProducts = [
  // === WEDDING GUEST ===
  { name: 'Elegant Evening Gown', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 4999, discountPrice: 2999, discountPercent: 40, sizes: [{ size: 'S', stock: 15 },{ size: 'M', stock: 20 },{ size: 'L', stock: 10 }], images: ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800'], tags: ['formal','wedding'], occasion: ['Wedding Guest'], description: 'Stunning evening gown with premium silk fabric, perfect for wedding receptions.', rating: 4.8, reviewCount: 124 },
  { name: 'Royal Embroidered Sherwani', brand: 'LUXÉ Homme', category: 'dress', gender: 'men', price: 8999, discountPrice: 5999, discountPercent: 33, sizes: [{ size: 'M', stock: 10 },{ size: 'L', stock: 15 },{ size: 'XL', stock: 8 }], images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800'], tags: ['formal','wedding'], occasion: ['Wedding Guest'], description: 'Handcrafted embroidered sherwani for the modern groom and wedding guest.', rating: 4.9, reviewCount: 89 },
  { name: 'Pastel Chiffon Saree Gown', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 6499, discountPrice: 3999, discountPercent: 38, sizes: [{ size: 'S', stock: 12 },{ size: 'M', stock: 18 }], images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=800'], tags: ['formal','wedding'], occasion: ['Wedding Guest'], description: 'Graceful chiffon saree gown with delicate embellishments for sangeet nights.', rating: 4.7, reviewCount: 67 },
  { name: 'Kids Flower Girl Dress', brand: 'LUXÉ Petit', category: 'dress', gender: 'kids', price: 2499, discountPrice: 1499, discountPercent: 40, sizes: [{ size: 'XS', stock: 20 },{ size: 'S', stock: 15 }], images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800'], tags: ['formal','wedding'], occasion: ['Wedding Guest'], description: 'Adorable tulle flower girl dress with satin ribbon sash.', rating: 4.6, reviewCount: 45 },

  // === PARTY NIGHT ===
  { name: 'Sequin Bodycon Mini Dress', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 3499, discountPrice: 1999, discountPercent: 43, sizes: [{ size: 'S', stock: 20 },{ size: 'M', stock: 25 },{ size: 'L', stock: 15 }], images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800'], tags: ['party','trendy'], occasion: ['Party Night'], description: 'Show-stopping sequin dress that catches every light on the dance floor.', rating: 4.5, reviewCount: 203 },
  { name: 'Velvet Blazer Set', brand: 'LUXÉ Homme', category: 'dress', gender: 'men', price: 5999, discountPrice: 3499, discountPercent: 42, sizes: [{ size: 'M', stock: 12 },{ size: 'L', stock: 18 },{ size: 'XL', stock: 8 }], images: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800'], tags: ['party','formal'], occasion: ['Party Night'], description: 'Luxurious velvet blazer for unforgettable party nights and club events.', rating: 4.6, reviewCount: 156 },
  { name: 'Metallic Off-Shoulder Top', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 1999, sizes: [{ size: 'S', stock: 30 },{ size: 'M', stock: 25 }], images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'], tags: ['party','trendy'], occasion: ['Party Night'], description: 'Shimmering metallic off-shoulder top for electric party vibes.', rating: 4.3, reviewCount: 98 },
  { name: 'Kids Party Sparkle Outfit', brand: 'LUXÉ Petit', category: 'dress', gender: 'kids', price: 1799, discountPrice: 999, discountPercent: 44, sizes: [{ size: 'S', stock: 15 },{ size: 'M', stock: 12 }], images: ['https://images.unsplash.com/photo-1621458682855-d36c117180ee?auto=format&fit=crop&q=80&w=800'], tags: ['party'], occasion: ['Party Night'], description: 'Fun sparkle outfit for kids birthday parties and celebrations.', rating: 4.4, reviewCount: 72 },

  // === OFFICE WEAR ===
  { name: 'Tailored Pencil Dress', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 3299, discountPrice: 2199, discountPercent: 33, sizes: [{ size: 'S', stock: 18 },{ size: 'M', stock: 22 },{ size: 'L', stock: 14 }], images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800'], tags: ['formal','office'], occasion: ['Office Wear'], description: 'Power dressing at its finest — structured pencil dress for boardroom confidence.', rating: 4.7, reviewCount: 189 },
  { name: 'Premium Wool Suit', brand: 'LUXÉ Homme', category: 'dress', gender: 'men', price: 7999, discountPrice: 4999, discountPercent: 37, sizes: [{ size: 'M', stock: 10 },{ size: 'L', stock: 14 },{ size: 'XL', stock: 8 }], images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800'], tags: ['formal','office'], occasion: ['Office Wear'], description: 'Italian wool suit tailored for the modern professional gentleman.', rating: 4.8, reviewCount: 210 },
  { name: 'A-Line Corporate Dress', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 2799, sizes: [{ size: 'S', stock: 15 },{ size: 'M', stock: 20 },{ size: 'L', stock: 12 }], images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800'], tags: ['formal','office','minimalist'], occasion: ['Office Wear'], description: 'Clean-cut A-line dress that transitions seamlessly from desk to dinner.', rating: 4.5, reviewCount: 134 },

  // === DATE NIGHT ===
  { name: 'Satin Slip Dress', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 2999, discountPrice: 1799, discountPercent: 40, sizes: [{ size: 'S', stock: 20 },{ size: 'M', stock: 25 },{ size: 'L', stock: 15 }], images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'], tags: ['date-night','trendy'], occasion: ['Date Night'], description: 'Silky satin slip dress — effortlessly romantic for candlelit evenings.', rating: 4.6, reviewCount: 178 },
  { name: 'Smart Casual Linen Shirt', brand: 'LUXÉ Homme', category: 'dress', gender: 'men', price: 2499, discountPrice: 1499, discountPercent: 40, sizes: [{ size: 'M', stock: 18 },{ size: 'L', stock: 22 },{ size: 'XL', stock: 10 }], images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800'], tags: ['date-night','casual'], occasion: ['Date Night'], description: 'Premium linen shirt with the perfect casual-yet-polished date night look.', rating: 4.4, reviewCount: 145 },
  { name: 'Wrap Midi Dress', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 2599, sizes: [{ size: 'S', stock: 14 },{ size: 'M', stock: 20 }], images: ['https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&q=80&w=800'], tags: ['date-night','classic'], occasion: ['Date Night'], description: 'Flattering wrap midi dress in a rich jewel tone for memorable date nights.', rating: 4.5, reviewCount: 112 },

  // === BEACH DAY ===
  { name: 'Tropical Print Maxi Dress', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 1999, discountPrice: 1199, discountPercent: 40, sizes: [{ size: 'S', stock: 25 },{ size: 'M', stock: 30 },{ size: 'L', stock: 20 }], images: ['https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?auto=format&fit=crop&q=80&w=800'], tags: ['casual','beach'], occasion: ['Beach Day'], weather: ['hot'], description: 'Breezy tropical print maxi dress — perfect for seaside strolls and resort vibes.', rating: 4.3, reviewCount: 167 },
  { name: 'Linen Beach Kurta', brand: 'LUXÉ Homme', category: 'dress', gender: 'men', price: 1799, discountPrice: 999, discountPercent: 44, sizes: [{ size: 'M', stock: 20 },{ size: 'L', stock: 25 },{ size: 'XL', stock: 15 }], images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'], tags: ['casual','beach'], occasion: ['Beach Day'], weather: ['hot'], description: 'Ultra-light linen kurta for sunny beach days and coastal getaways.', rating: 4.2, reviewCount: 93 },
  { name: 'Kids Beach Romper', brand: 'LUXÉ Petit', category: 'dress', gender: 'kids', price: 999, discountPrice: 599, discountPercent: 40, sizes: [{ size: 'XS', stock: 20 },{ size: 'S', stock: 18 }], images: ['https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?auto=format&fit=crop&q=80&w=800'], tags: ['casual','beach'], occasion: ['Beach Day'], weather: ['hot'], description: 'Colorful cotton romper for little ones to enjoy sunny beach adventures.', rating: 4.4, reviewCount: 56 },

  // === GYM / SPORTS ===
  { name: 'Performance Training Set', brand: 'LUXÉ Active', category: 'dress', gender: 'women', price: 2499, discountPrice: 1499, discountPercent: 40, sizes: [{ size: 'S', stock: 30 },{ size: 'M', stock: 35 },{ size: 'L', stock: 25 }], images: ['https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=800'], tags: ['sporty'], occasion: ['Gym / Sports'], description: 'High-performance moisture-wicking training set for intense workouts.', rating: 4.5, reviewCount: 234 },
  { name: 'Athletic Compression Set', brand: 'LUXÉ Active', category: 'dress', gender: 'men', price: 2299, discountPrice: 1299, discountPercent: 43, sizes: [{ size: 'M', stock: 25 },{ size: 'L', stock: 30 },{ size: 'XL', stock: 20 }], images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=800'], tags: ['sporty'], occasion: ['Gym / Sports'], description: 'Pro-grade compression set for peak athletic performance and recovery.', rating: 4.6, reviewCount: 198 },
  { name: 'Kids Sports Tracksuit', brand: 'LUXÉ Petit', category: 'dress', gender: 'kids', price: 1499, discountPrice: 899, discountPercent: 40, sizes: [{ size: 'S', stock: 20 },{ size: 'M', stock: 15 }], images: ['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=80&w=800'], tags: ['sporty'], occasion: ['Gym / Sports'], description: 'Durable and comfy tracksuit for active kids who love sports and play.', rating: 4.3, reviewCount: 87 },

  // === GRADUATION ===
  { name: 'Classic White Fit & Flare Dress', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 3499, discountPrice: 2299, discountPercent: 34, sizes: [{ size: 'S', stock: 15 },{ size: 'M', stock: 20 },{ size: 'L', stock: 12 }], images: ['https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&q=80&w=800'], tags: ['formal','classic'], occasion: ['Graduation'], description: 'Timeless white fit & flare dress — picture-perfect for graduation day.', rating: 4.7, reviewCount: 145 },
  { name: 'Navy Blue Formal Suit', brand: 'LUXÉ Homme', category: 'dress', gender: 'men', price: 6499, discountPrice: 3999, discountPercent: 38, sizes: [{ size: 'M', stock: 12 },{ size: 'L', stock: 16 },{ size: 'XL', stock: 8 }], images: ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=800'], tags: ['formal','classic'], occasion: ['Graduation'], description: 'Sharp navy blue suit to mark your achievement with distinction and style.', rating: 4.8, reviewCount: 167 },
  { name: 'Kids Graduation Smart Set', brand: 'LUXÉ Petit', category: 'dress', gender: 'kids', price: 1999, sizes: [{ size: 'S', stock: 15 },{ size: 'M', stock: 12 }], images: ['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=80&w=800'], tags: ['formal'], occasion: ['Graduation'], description: 'Dapper smart set for little graduates stepping into their bright future.', rating: 4.5, reviewCount: 43 },

  // === FESTIVAL ===
  { name: 'Bohemian Embroidered Maxi', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 2999, discountPrice: 1799, discountPercent: 40, sizes: [{ size: 'S', stock: 20 },{ size: 'M', stock: 25 },{ size: 'L', stock: 18 }], images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'], tags: ['bohemian','festival'], occasion: ['Festival'], description: 'Free-spirited bohemian maxi with intricate hand-embroidery for music festivals.', rating: 4.4, reviewCount: 189 },
  { name: 'Festival Kurta Pajama Set', brand: 'LUXÉ Homme', category: 'dress', gender: 'men', price: 3499, discountPrice: 1999, discountPercent: 43, sizes: [{ size: 'M', stock: 18 },{ size: 'L', stock: 22 },{ size: 'XL', stock: 12 }], images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800'], tags: ['festival','classic'], occasion: ['Festival'], description: 'Festive kurta pajama set with mirror work detailing for Diwali and Eid celebrations.', rating: 4.6, reviewCount: 134 },
  { name: 'Kids Festival Ethnic Outfit', brand: 'LUXÉ Petit', category: 'dress', gender: 'kids', price: 1599, discountPrice: 999, discountPercent: 37, sizes: [{ size: 'XS', stock: 15 },{ size: 'S', stock: 18 }], images: ['https://images.unsplash.com/photo-1621458682855-d36c117180ee?auto=format&fit=crop&q=80&w=800'], tags: ['festival'], occasion: ['Festival'], description: 'Colorful ethnic outfit for kids to celebrate every festival with joy and style.', rating: 4.3, reviewCount: 65 },
  { name: 'Tie-Dye Festival Dress', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 1799, sizes: [{ size: 'S', stock: 22 },{ size: 'M', stock: 28 }], images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'], tags: ['bohemian','festival','trendy'], occasion: ['Festival'], description: 'Vibrant tie-dye festival dress that radiates positive energy and free spirit.', rating: 4.2, reviewCount: 98 },
];

const sizeMappings = [
  { referenceBrand: "Levi's", referenceSize: '28', category: 'jeans', ourBrandSize: '28', fitNotes: 'True to size. Our jeans have a similar straight cut.' },
  { referenceBrand: "Levi's", referenceSize: '30', category: 'jeans', ourBrandSize: '30', fitNotes: 'True to size. Slight stretch in our fabric.' },
  { referenceBrand: "Levi's", referenceSize: '32', category: 'jeans', ourBrandSize: '31', fitNotes: 'Size down one. Our cut runs slightly bigger in the waist.' },
  { referenceBrand: "Levi's", referenceSize: '34', category: 'jeans', ourBrandSize: '33', fitNotes: 'Size down one. More relaxed hip room in our style.' },
  { referenceBrand: "Levi's", referenceSize: '36', category: 'jeans', ourBrandSize: '35', fitNotes: 'Size down one.' },
  { referenceBrand: 'Zara', referenceSize: 'S', category: 'shirt', ourBrandSize: 'M', fitNotes: 'Size up. Zara runs slim; our fit is standard.' },
  { referenceBrand: 'Zara', referenceSize: 'M', category: 'shirt', ourBrandSize: 'M', fitNotes: 'True to size for our relaxed fit.' },
  { referenceBrand: 'Zara', referenceSize: 'L', category: 'shirt', ourBrandSize: 'L', fitNotes: 'True to size.' },
  { referenceBrand: 'Zara', referenceSize: 'S', category: 'dress', ourBrandSize: 'S', fitNotes: 'True to size. Similar body-con fits.' },
  { referenceBrand: 'Zara', referenceSize: 'M', category: 'dress', ourBrandSize: 'M', fitNotes: 'True to size.' },
  { referenceBrand: 'H&M', referenceSize: 'S', category: 'tshirt', ourBrandSize: 'S', fitNotes: 'True to size. Both are relaxed fit.' },
  { referenceBrand: 'H&M', referenceSize: 'M', category: 'tshirt', ourBrandSize: 'M', fitNotes: 'True to size.' },
  { referenceBrand: 'H&M', referenceSize: 'L', category: 'tshirt', ourBrandSize: 'L', fitNotes: 'True to size. Slightly longer in our cut.' },
  { referenceBrand: 'Nike', referenceSize: '9', category: 'shoes', ourBrandSize: '9', fitNotes: 'True to size for athletic shoes.' },
  { referenceBrand: 'Nike', referenceSize: '10', category: 'shoes', ourBrandSize: '10', fitNotes: 'True to size.' },
  { referenceBrand: 'Uniqlo', referenceSize: 'M', category: 'jacket', ourBrandSize: 'M', fitNotes: 'True to size. Similar tailored fit.' },
  { referenceBrand: 'Uniqlo', referenceSize: 'L', category: 'jacket', ourBrandSize: 'L', fitNotes: 'True to size.' }
];

const associationRules = [
  {
    triggerCategory: 'dress',
    triggerTags: ['party', 'formal', 'date-night'],
    suggestedCategories: ['jewelry', 'bag', 'shoes'],
    confidence: 0.92,
    bundleDiscount: 15,
    bundleName: 'Complete Evening Look',
    description: 'Dress + Earrings + Clutch for a perfect party look'
  },
  {
    triggerCategory: 'shirt',
    triggerTags: ['formal', 'office'],
    suggestedCategories: ['jeans', 'shoes'],
    confidence: 0.85,
    bundleDiscount: 12,
    bundleName: 'Smart Casual Bundle',
    description: 'Shirt + Jeans + Shoes for office-to-dinner style'
  },
  {
    triggerCategory: 'jeans',
    triggerTags: ['casual', 'streetwear'],
    suggestedCategories: ['tshirt', 'shoes', 'jacket'],
    confidence: 0.88,
    bundleDiscount: 15,
    bundleName: 'Street Style Pack',
    description: 'Jeans + Tee + Sneakers for effortless street style'
  },
  {
    triggerCategory: 'jacket',
    triggerTags: ['layering', 'trendy'],
    suggestedCategories: ['shirt', 'jeans', 'accessory'],
    confidence: 0.80,
    bundleDiscount: 10,
    bundleName: 'Layered Look Bundle',
    description: 'Jacket + Shirt + Bottoms for a complete layered outfit'
  },
  {
    triggerCategory: 'skirt',
    triggerTags: ['formal', 'trendy'],
    suggestedCategories: ['shirt', 'shoes', 'bag'],
    confidence: 0.82,
    bundleDiscount: 12,
    bundleName: 'Chic Office Set',
    description: 'Skirt + Blouse + Heels for a polished professional look'
  }
];

async function seedAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fashionapp' });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Product.deleteMany({}),
      SizeMapping.deleteMany({}),
      AssociationRule.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Seed products
    const seededProducts = await Product.insertMany(rawProducts);
    console.log(`📦 Seeded ${seededProducts.length} products`);

    // Link bundle-compatible products
    const dressProducts = seededProducts.filter(p => p.category === 'dress');
    const jewelryProducts = seededProducts.filter(p => p.category === 'jewelry');
    const bagProducts = seededProducts.filter(p => p.category === 'bag');

    for (const dress of dressProducts) {
      await Product.findByIdAndUpdate(dress._id, {
        bundleCompatible: [
          ...jewelryProducts.map(j => j._id),
          ...bagProducts.map(b => b._id)
        ]
      });
    }

    // Update association rules with actual product IDs
    for (const rule of associationRules) {
      const suggested = seededProducts
        .filter(p => rule.suggestedCategories.includes(p.category))
        .slice(0, 3)
        .map(p => p._id);
      rule.suggestedProducts = suggested;
    }

    // Seed size mappings
    await SizeMapping.insertMany(sizeMappings);
    console.log(`📏 Seeded ${sizeMappings.length} size mappings`);

    // Seed association rules
    await AssociationRule.insertMany(associationRules);
    console.log(`🔗 Seeded ${associationRules.length} association rules`);

    // Create demo user
    const demoUser = await User.findOne({ email: 'demo@fashion.app' });
    if (!demoUser) {
      await User.create({
        name: 'Demo User',
        email: 'demo@fashion.app',
        password: 'demo123456',
        phone: '+91-9876543210',
        addresses: [{
          label: 'Home',
          street: '123 Fashion Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400001',
          isDefault: true
        }],
        sizeProfile: {
          topSize: 'M',
          bottomSize: '32',
          shoeSize: '9',
          preferredBrands: { "Levi's": '32', 'Zara': 'M', 'Nike': '9' }
        },
        stylePreferences: ['trendy', 'casual', 'minimalist']
      });
      console.log('👤 Created demo user (demo@fashion.app / demo123456)');
    }

    console.log('\n✨ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedAll();
