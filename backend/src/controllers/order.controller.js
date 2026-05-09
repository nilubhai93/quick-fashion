import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import UserDeliveryAddress from '../models/UserDeliveryAddress.js';

export const getDeliveryAddresses = async (req, res) => {
  try {
    const doc = await UserDeliveryAddress.findOne({ userId: req.user._id });
    res.json({ addresses: doc?.addresses || [] });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
};

export const saveDeliveryAddress = async (req, res) => {
  try {
    const { address, location, label } = req.body;

    let doc = await UserDeliveryAddress.findOne({ userId: req.user._id });
    if (!doc) {
      doc = new UserDeliveryAddress({ userId: req.user._id, addresses: [] });
    }

    // Avoid duplicate: check if same street+zip already saved
    const exists = doc.addresses.find(
      a => a.address?.street === address?.street && a.address?.zip === address?.zip
    );

    if (!exists) {
      doc.addresses.unshift({ address, location, label: label || '' });
      // Keep max 10 saved addresses
      if (doc.addresses.length > 10) doc.addresses = doc.addresses.slice(0, 10);
      await doc.save();
    }

    res.status(200).json({ message: 'Address saved successfully', addresses: doc.addresses });
  } catch (err) {
    console.error('Save address error:', err);
    res.status(500).json({ error: 'Failed to save delivery address' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod = 'cod', deliveryLocation, deliveryFee = 0 } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    const validItems = cart.items.filter(item => item.productId);

    if (validItems.length === 0) {
      return res.status(400).json({ error: 'Cart items are no longer available.' });
    }

    const items = validItems.map(item => {
      const isRental = item.isRental || false;
      const rentalDays = item.rentalDays || 0;
      const rentPerDay = item.productId.rentPricePerDay || 0;
      const buyPrice = item.productId.discountPrice || item.productId.price || 0;

      // For rentals: price = rentPerDay * rentalDays (per item)
      // For buy: price = buyPrice
      const effectivePrice = (isRental && rentalDays > 0) ? (rentPerDay * rentalDays) : buyPrice;

      return {
        productId: item.productId._id,
        name: item.productId.name,
        image: item.productId.images?.[0] || '',
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: effectivePrice,
        isRental,
        rentalDays,
        rentPricePerDay: rentPerDay
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    let bundleDiscount = 0;
    if (cart.bundleSuggestion?.isActive) {
      bundleDiscount = (totalAmount * (cart.bundleSuggestion.discount || 15)) / 100;
    }

    // Calculate estimated delivery
    const userZip = deliveryAddress?.zip || req.user.addresses?.[0]?.zip || '';
    let estimatedMinutes = 30;

    if (userZip) {
      const zipStr = String(userZip);
      const zipPrefix = zipStr.substring(0, 3);
      for (const item of validItems) {
        const zone = item.productId.deliveryZones?.find(z => z.zipPrefix === zipPrefix);
        if (zone) {
          estimatedMinutes = Math.max(estimatedMinutes, zone.estimatedMinutes);
        }
      }
    }

    // For non-COD methods, set payment as paid (simulate instant payment)
    const paymentStatus = paymentMethod !== 'cod' ? 'paid' : 'pending';

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount: totalAmount - bundleDiscount + deliveryFee,
      deliveryFee,
      discount: bundleDiscount,
      deliveryAddress: deliveryAddress || req.user.addresses?.find(a => a.isDefault) || {},
      deliveryLocation: deliveryLocation || {},
      estimatedDeliveryMinutes: estimatedMinutes,
      estimatedDeliveryTime: new Date(Date.now() + estimatedMinutes * 60 * 1000),
      isBundle: bundleDiscount > 0,
      bundleDiscount,
      paymentMethod,
      paymentStatus
    });

    // Decrement stock
    for (const item of validItems) {
      await Product.updateOne(
        { _id: item.productId._id, 'sizes.size': item.size },
        { $inc: { 'sizes.$.stock': -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    cart.bundleSuggestion = { isActive: false };
    await cart.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order,
      estimatedDelivery: `${estimatedMinutes} minutes`
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to place order.' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(20);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('status estimatedDeliveryTime estimatedDeliveryMinutes items.name createdAt');

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const now = new Date();
    const created = new Date(order.createdAt);
    const elapsed = (now - created) / 60000;

    // Logic based on status rather than just time
    let progress = 0;
    const status = order.status;

    if (status === 'placed') progress = 5;
    else if (status === 'confirmed') progress = 20;
    else if (status === 'picking') progress = 40;
    else if (status === 'out-for-delivery') {
      // Out for delivery is when we actually use time-based logic (50% to 90%)
      const timeProgress = (elapsed / order.estimatedDeliveryMinutes) * 40;
      progress = 50 + Math.min(timeProgress, 40);
    }
    else if (status === 'reached') progress = 95;
    else if (status === 'delivered') progress = 100;
    else if (status === 'cancelled') progress = 0;

    res.json({
      order,
      tracking: {
        progress: Math.round(progress),
        minutesRemaining: status === 'delivered' ? 0 : Math.max(0, Math.round(order.estimatedDeliveryMinutes - elapsed)),
        currentStep: status
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track order.' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage.' });
    }

    order.status = 'cancelled';
    order.cancelReason = reason || 'User cancelled';
    order.cancelledBy = 'user';
    await order.save();

    // Restock items
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId, 'sizes.size': item.size },
        { $inc: { 'sizes.$.stock': item.quantity } }
      );
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order.' });
  }
};

export const rateOrderItem = async (req, res) => {
  try {
    const { orderId, productId, rating } = req.body;
    
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'delivered') return res.status(400).json({ error: 'Can only rate delivered products' });

    // Find the item by productId AND match the specific variant (size/color) if possible?
    // User might have bought same product multiple times. Let's just find the first unrated one.
    const item = order.items.find(i => i.productId.toString() === productId && !i.isRated);
    if (!item) return res.status(404).json({ error: 'Unrated product not found in order' });

    // Update order item
    item.isRated = true;
    item.userRating = rating;
    await order.save();

    // Update product aggregate rating
    const product = await Product.findById(productId);
    if (product) {
      const oldRating = product.rating || 0;
      const oldCount = product.reviewCount || 0;
      
      let newRating;
      if (oldCount === 0) {
        newRating = rating;
      } else {
        newRating = ((oldRating * oldCount) + rating) / (oldCount + 1);
      }
      
      product.rating = Number(newRating.toFixed(1));
      product.reviewCount = oldCount + 1;
      await product.save();
    }

    res.json({ message: 'Rating submitted successfully', order });
  } catch (error) {
    console.error('Rate product error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};
export const requestReturn = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or not eligible for return.' });
    }

    const now = new Date();
    const deliveredAt = new Date(order.deliveredAt || order.updatedAt);
    const diffMinutes = (now - deliveredAt) / (1000 * 60);

    if (diffMinutes > 30) {
      return res.status(400).json({ error: 'Return period (30 minutes) has expired.' });
    }

    order.status = 'return-requested';
    order.returnDetails = {
      ...req.body,
      returnDeliveryBoyId: null
    };
    // Ensure minimum 25rs for return task
    order.deliveryEarnings = Math.max(25, order.deliveryEarnings || 0);
    // Make it available for delivery boys to pick up for return
    order.delivery.status = 'unassigned';
    order.delivery.deliveryBoyId = null;
    
    await order.save();

    // Trigger auto-assignment for return pickup
    const { assignDriverToOrder } = await import('./delivery.controller.js');
    await assignDriverToOrder(order);

    res.json({ message: 'Return request submitted successfully. Our partner will pick it up shortly.', order });
  } catch (error) {
    console.error('Request return error:', error);
    res.status(500).json({ error: 'Failed to submit return request.' });
  }
};

export const cancelReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      _id: id,
      userId: req.user._id,
      status: 'return-requested'
    });

    if (!order) {
      return res.status(404).json({ error: 'Active return request not found.' });
    }

    // Revert to delivered
    order.status = 'delivered';
    
    // Clear delivery info if it was assigned but not yet picked up
    if (order.delivery.deliveryBoyId) {
      const User = (await import('../models/User.js')).default;
      await User.findByIdAndUpdate(order.delivery.deliveryBoyId, {
        'deliveryProfile.currentOrderId': null
      });
    }

    order.delivery.status = 'unassigned';
    order.delivery.deliveryBoyId = null;
    order.returnDetails = null;

    await order.save();

    res.json({ message: 'Return request cancelled.', order });
  } catch (error) {
    console.error('Cancel return error:', error);
    res.status(500).json({ error: 'Failed to cancel return request.' });
  }
};
