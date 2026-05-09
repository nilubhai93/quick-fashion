import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, category, gender, minPrice, maxPrice,
      tags, occasion, weather, brand, search, sort = '-createdAt',
      inStock, forRent
    } = req.query;

    const filter = { isActive: { $ne: false } };
    console.log('--- Search Debug ---');
    console.log('Query Params:', req.query);
    
    if (category) filter.category = category;
    if (gender) filter.gender = { $in: [gender, 'unisex'] };
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (tags) filter.tags = { $in: tags.split(',') };
    if (occasion) filter.occasion = { $in: occasion.split(',') };
    if (weather) filter.weather = { $in: weather.split(',') };
    if (forRent === 'true') {
      filter.isAvailableForRent = true;
    } else if (forRent === 'false') {
      filter.isAvailableForRent = { $ne: true };
    }
    // When forRent is not specified, show ALL active products (buy + rent)

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      filter['sizes.stock'] = { $gt: 0 };
    }

    if (search) {
      const keywords = search.trim().split(/\s+/).filter(k => k.length > 0);
      if (keywords.length > 0) {
        filter.$and = keywords.map(word => ({
          $or: [
            { name: { $regex: word, $options: 'i' } },
            { description: { $regex: word, $options: 'i' } },
            { brand: { $regex: word, $options: 'i' } },
            { category: { $regex: word, $options: 'i' } }
          ]
        }));
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-styleEmbedding'),
      Product.countDocuments(filter)
    ]);

    // Diagnostic logging to file
    try {
      const fs = await import('fs');
      fs.appendFileSync('search_log.txt', `[${new Date().toISOString()}] Query: "${search}", Found: ${products.length}, Filter: ${JSON.stringify(filter)}\n`);
    } catch (e) {}

    return res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-styleEmbedding')
      .populate('bundleCompatible', 'name price images category');

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json({ product });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    return res.json({ categories: categories.map(c => ({ name: c._id, count: c.count })) });
  } catch (error) {
    res.json({ categories: [] });
  }
};

export const getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isActive: { $ne: false }, rating: { $gte: 4.5 } })
      .sort('-rating -reviewCount')
      .limit(12)
      .select('-styleEmbedding');
    return res.json({ products });
  } catch (error) {
    res.json({ products: [] });
  }
};

export const getDeals = async (req, res) => {
  try {
    const products = await Product.find({ isActive: { $ne: false }, discountPrice: { $ne: null } })
      .sort('-createdAt')
      .limit(12)
      .select('-styleEmbedding');
    return res.json({ products });
  } catch (error) {
    res.json({ products: [] });
  }
};

export const getQuickDelivery = async (req, res) => {
  try {
    const { zip } = req.query;
    const zipPrefix = zip ? zip.substring(0, 3) : '';

    const filter = { isActive: { $ne: false } };
    if (zipPrefix) {
      filter['deliveryZones.zipPrefix'] = zipPrefix;
      filter['deliveryZones.estimatedMinutes'] = { $lte: 30 };
    }

    const products = await Product.find(filter)
      .limit(20)
      .select('-styleEmbedding');
    return res.json({ products });
  } catch (error) {
    res.json({ products: [] });
  }
};
