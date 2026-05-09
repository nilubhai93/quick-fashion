import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import SellerApplication from '../models/SellerApplication.js';

// Get overview stats for the seller dashboard
export const getSellerDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const products = await Product.find({ sellerId });
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;

    const sellerProductIds = products.map(p => p._id);

    // Find all orders containing at least one of this seller's products
    const orders = await Order.find({
      'items.productId': { $in: sellerProductIds }
    });

    // 1. Total Revenue (ONLY FROM DELIVERED ORDERS > 30 MINS AGO)
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const realizedOrders = deliveredOrders.filter(o => new Date(o.deliveredAt || o.updatedAt) <= thirtyMinsAgo);
    
    const totalRevenue = realizedOrders.reduce((sum, order) => {
      const sellerItemsTotal = order.items
        .filter(item => sellerProductIds.some(id => id.equals(item.productId)))
        .reduce((acc, item) => acc + item.price * item.quantity, 0);
      return sum + sellerItemsTotal;
    }, 0);

    // 2. Pending Orders (Placed but not yet delivered or cancelled)
    const pendingOrders = orders.filter(o => 
      !['delivered', 'cancelled'].includes(o.status)
    ).length;

    // 3. Completed Orders (Monthly)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrders = deliveredOrders.filter(o => 
      new Date(o.updatedAt) >= startOfMonth
    ).length;

    // 4. Orders needing confirmation (placed status)
    const toApproveCount = orders.filter(o => o.status === 'placed').length;

    // 5. Return Stats
    const returnOrders = orders.filter(o => ['return-requested', 'returning', 'returned'].includes(o.status));
    const totalReturns = returnOrders.length;
    const returnRevenueLost = returnOrders.reduce((sum, order) => {
      const sellerItemsTotal = order.items
        .filter(item => sellerProductIds.some(id => id.equals(item.productId)))
        .reduce((acc, item) => acc + item.price * item.quantity, 0);
      return sum + sellerItemsTotal;
    }, 0);

    // 6. Chart Data (Status Distribution)
    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // 7. Chart Data (Daily Revenue - Last 7 Days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const salesData = last7Days.map(date => {
      const dayOrders = realizedOrders.filter(o => (o.deliveredAt || o.updatedAt).toISOString().split('T')[0] === date);
      const revenue = dayOrders.reduce((sum, order) => {
        const sellerItemsTotal = order.items
          .filter(item => sellerProductIds.some(id => id.equals(item.productId)))
          .reduce((acc, item) => acc + item.price * item.quantity, 0);
        return sum + sellerItemsTotal;
      }, 0);
      return { date, revenue };
    });

    res.status(200).json({
      totalProducts,
      activeProducts,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: orders.filter(o => o.status !== 'cancelled').length,
      pendingOrders,
      toApproveCount,
      monthlyOrders,
      totalReturns,
      returnRevenueLost: Math.round(returnRevenueLost * 100) / 100,
      statusData,
      salesData,
      recentProducts: products.slice(-5).reverse()
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to load dashboard statistics' });
  }
};

// Get wallet stats (product-wise sales and revenue)
export const getSellerWalletStats = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const products = await Product.find({ sellerId });
    const productIds = products.map(p => p._id);

    const orders = await Order.find({
      'items.productId': { $in: productIds },
      status: { $nin: ['cancelled', 'return-requested', 'returning', 'returned'] }
    });

    const walletData = products.map(product => {
      let unitsSold = 0;
      let revenue = 0;

      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.productId.equals(product._id)) {
            unitsSold += item.quantity;
            revenue += item.price * item.quantity;
          }
        });
      });

      return {
        _id: product._id,
        name: product.name,
        image: product.images[0],
        unitsSold,
        revenue: Math.round(revenue * 100) / 100,
        price: product.price
      };
    });

    // Sort by revenue descending
    walletData.sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = walletData.reduce((sum, p) => sum + p.revenue, 0);
    const totalUnitsSold = walletData.reduce((sum, p) => sum + p.unitsSold, 0);

    res.status(200).json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalUnitsSold,
      productSales: walletData
    });
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    res.status(500).json({ error: 'Failed to load wallet statistics' });
  }
};

// Get all products added by the specific seller
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ error: 'Failed to load your products' });
  }
};

// Get a single product for the seller
export const getSellerProductById = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, sellerId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error('Error fetching seller product:', error);
    res.status(500).json({ error: 'Failed to load product details' });
  }
};

// Add a new product to the catalog
export const addSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { 
      name, brand, category, price, discountPrice, discountPercent, description, gender, stock, 
      showRentOnHome, isAvailableForRent, rentPricePerDay 
    } = req.body;

    // Parse array fields from JSON strings (sent via FormData)
    let colors = [];
    let tags = [];
    let occasion = [];
    let weather = [];
    
    try {
      if (req.body.colors) colors = JSON.parse(req.body.colors);
      if (req.body.tags) tags = JSON.parse(req.body.tags);
      if (req.body.occasion) occasion = JSON.parse(req.body.occasion);
      if (req.body.weather) weather = JSON.parse(req.body.weather);
    } catch (e) {
      console.warn('Failed to parse AI attributes, using defaults');
    }

    if (!name || !brand || !category || !price) {
      return res.status(400).json({ error: 'Name, brand, category, and price are required.' });
    }

    // Use sizes from form if provided, otherwise default
    let parsedSizes;
    try {
      parsedSizes = req.body.sizes ? JSON.parse(req.body.sizes) : null;
    } catch (e) {
      parsedSizes = null;
    }
    const sizes = parsedSizes && parsedSizes.length > 0
      ? parsedSizes
      : (stock ? [{ size: 'Free Size', stock: Number(stock) }] : [{ size: 'Free Size', stock: 10 }]);

    // Process dynamic color variants and their images
    const colorImages = [];
    let allImages = [];

    colors.forEach(color => {
      const colorFiles = req.files.filter(f => f.fieldname === `colorMedia_${color}`);
      const urls = colorFiles.map(file => `http://localhost:5000/uploads/products/${file.filename}`);
      
      if (urls.length > 0) {
        colorImages.push({ color, images: urls });
        allImages = [...allImages, ...urls];
      } else {
        // If no images for this specific color, we still need the variant object
        colorImages.push({ color, images: [] });
      }
    });

    // Fallback if no images were uploaded at all
    if (allImages.length === 0) {
      allImages = [`https://placehold.co/400x500/1a1a25/9a9ab0?text=${encodeURIComponent(name || 'Product')}`];
    }

    const newProduct = new Product({
      sellerId,
      name,
      brand,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      discountPercent: discountPercent ? Number(discountPercent) : 0,
      description,
      gender: gender || 'unisex',
      images: allImages,
      colorImages,
      sizes,
      colors,
      tags,
      occasion,
      weather,
      showRentOnHome: req.user?.sellerProfile?.showRentOnHome || false,
      isAvailableForRent: isAvailableForRent === 'true' || isAvailableForRent === true,
      rentPricePerDay: rentPricePerDay ? Number(rentPricePerDay) : null
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add new product' });
  }
};

// Toggle product active status
export const toggleProductStatus = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, sellerId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({ message: 'Product status updated', product });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// Update a seller product
export const updateSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { productId } = req.params;
    const { 
      name, brand, category, price, discountPrice, discountPercent, description, gender, stock, 
      isAvailableForRent, rentPricePerDay 
    } = req.body;

    const product = await Product.findOne({ _id: productId, sellerId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    // Basic updates
    if (name) product.name = name;
    if (brand) product.brand = brand;
    if (category) product.category = category;
    if (price !== undefined && price !== '') product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = (discountPrice === '' || discountPrice === null) ? null : Number(discountPrice);
    if (discountPercent !== undefined) product.discountPercent = (discountPercent === '' || discountPercent === null) ? 0 : Number(discountPercent);
    if (description !== undefined) product.description = description;
    if (gender) product.gender = gender;
    
    // Update AI attributes
    let colorsChanged = false;
    try {
      if (req.body.colors) {
        const newColors = JSON.parse(req.body.colors);
        if (JSON.stringify(product.colors) !== JSON.stringify(newColors)) {
          product.colors = newColors;
          colorsChanged = true;
        }
      }
      if (req.body.tags) product.tags = JSON.parse(req.body.tags);
      if (req.body.occasion) product.occasion = JSON.parse(req.body.occasion);
      if (req.body.weather) product.weather = JSON.parse(req.body.weather);
    } catch (e) {
      console.warn('Failed to parse attributes in update:', e.message);
    }

    if (isAvailableForRent !== undefined) {
      product.isAvailableForRent = isAvailableForRent === 'true' || isAvailableForRent === true;
    }
    if (rentPricePerDay !== undefined) {
      product.rentPricePerDay = (rentPricePerDay === '' || rentPricePerDay === null) ? null : Number(rentPricePerDay);
    }

    // Handle images (Variant Media)
    // We update colorImages if there are new files OR if colors themselves changed
    if ((req.files && req.files.length > 0) || colorsChanged) {
      const newColorImages = [];
      let allImages = [];

      const currentColors = product.colors || [];
      currentColors.forEach(color => {
        // Check for new uploads for this color
        const colorFiles = req.files ? req.files.filter(f => f.fieldname === `colorMedia_${color}`) : [];
        const newUrls = colorFiles.map(file => `http://localhost:5000/uploads/products/${file.filename}`);
        
        // Check for existing images for this color
        const existingVariant = product.colorImages?.find(ci => ci.color === color);
        const existingUrls = existingVariant ? existingVariant.images : [];
        
        // Logic: if new images are uploaded for this specific color, APPEND them to existing ones.
        // Otherwise, keep existing images for this color.
        const finalUrls = [...existingUrls, ...newUrls];
        
        if (finalUrls && finalUrls.length > 0) {
          newColorImages.push({ color, images: finalUrls });
          allImages = [...allImages, ...finalUrls];
        } else {
          // Keep the variant even if no images yet
          newColorImages.push({ color, images: [] });
        }
      });

      // Only update if we actually have images to show
      if (allImages.length > 0) {
        product.images = allImages;
        product.colorImages = newColorImages;
      } else if (newColorImages.length > 0) {
        // Update color structure even if images are empty
        product.colorImages = newColorImages;
      }
    }

    // Handle sizes
    if (req.body.sizes) {
      try {
        const parsedSizes = JSON.parse(req.body.sizes);
        if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
          product.sizes = parsedSizes;
        }
      } catch (e) {
        console.warn('Failed to parse sizes in update');
      }
    } else if (stock) {
      product.sizes = [{ size: 'Free Size', stock: Number(stock) }];
    }

    await product.save();
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('CRITICAL Error updating product:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    res.status(500).json({ 
      error: 'Failed to update product', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// Delete a seller product
export const deleteSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findOneAndDelete({ _id: productId, sellerId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Get seller settings
export const getSellerSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email phone sellerProfile');
    const application = await SellerApplication.findOne({ userId: req.user._id, status: 'approved' });

    // Merge application data as defaults if sellerProfile fields are empty
    const settings = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      storeName: user.sellerProfile?.storeName || application?.storeName || '',
      storeDescription: user.sellerProfile?.storeDescription || application?.description || '',
      businessAddress: user.sellerProfile?.businessAddress || application?.address || '',
      businessPhone: user.sellerProfile?.businessPhone || user.phone || '',
      categories: user.sellerProfile?.categories || application?.categories || '',
      gstNumber: user.sellerProfile?.gstNumber || '',
      returnPolicy: user.sellerProfile?.returnPolicy || '7-day',
      processingTime: user.sellerProfile?.processingTime ?? 1,
      autoConfirmOrders: user.sellerProfile?.autoConfirmOrders || false,
      lowStockThreshold: user.sellerProfile?.lowStockThreshold ?? 5,
      notifyOrders: user.sellerProfile?.notifyOrders ?? true,
      notifyLowStock: user.sellerProfile?.notifyLowStock ?? true,
      notifyReviews: user.sellerProfile?.notifyReviews || false,
      vacationMode: user.sellerProfile?.vacationMode || false,
      hubLocation: user.sellerProfile?.hubLocation || { lat: null, lng: null }
    };

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching seller settings:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
};

// Update seller settings
export const updateSellerSettings = async (req, res) => {
  try {
    const allowedFields = [
      'storeName', 'storeDescription', 'businessAddress', 'businessPhone',
      'categories', 'gstNumber', 'returnPolicy', 'processingTime',
      'autoConfirmOrders', 'lowStockThreshold', 'notifyOrders',
      'notifyLowStock', 'notifyReviews', 'vacationMode', 'hubLocation'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[`sellerProfile.${field}`] = req.body[field];
      }
    }

    // Also allow updating name and phone on the user root
    const rootUpdates = {};
    if (req.body.name) rootUpdates.name = req.body.name;
    if (req.body.phone !== undefined) rootUpdates.phone = req.body.phone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...updates, ...rootUpdates },
      { new: true }
    ).select('name email phone sellerProfile');

    if (req.body.showRentOnHome !== undefined) {
      await Product.updateMany(
        { sellerId: req.user._id },
        { showRentOnHome: req.body.showRentOnHome }
      );
    }

    res.json({ message: 'Settings updated successfully', user });
  } catch (error) {
    console.error('Error updating seller settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
