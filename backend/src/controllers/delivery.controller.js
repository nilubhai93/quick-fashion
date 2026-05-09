import Order from '../models/Order.js';
import User from '../models/User.js';

const CASH_LIMIT = 2500; // ₹2500 COD cash limit

export const getDeliveryProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const assignDriverToOrder = async (order) => {
  try {
    const availableDriver = await User.findOne({
      role: 'delivery',
      'deliveryProfile.isOnline': true,
      'deliveryProfile.currentOrderId': null,
      _id: { $nin: order.delivery.rejectedBy || [] }
    });

    if (availableDriver) {
      order.delivery.deliveryBoyId = availableDriver._id;
      order.delivery.status = 'assigned';
      availableDriver.deliveryProfile.currentOrderId = order._id;
      await availableDriver.save();
      await order.save();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Assign driver helper error:', err);
    return false;
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    req.user.deliveryProfile.isOnline = isOnline;

    // If coming online, check if there are any orphaned/unassigned confirmed or return-requested orders
    if (isOnline && !req.user.deliveryProfile.currentOrderId) {
      const orphanOrder = await Order.findOne({
        status: { $in: ['confirmed', 'return-requested'] },
        'delivery.status': 'unassigned',
        'delivery.rejectedBy': { $ne: req.user._id }
      });

      if (orphanOrder) {
        await assignDriverToOrder(orphanOrder);
      }
    }

    await req.user.save();
    res.json({ isOnline: req.user.deliveryProfile.isOnline });
  } catch (error) {
    console.error('Update status error', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const getCurrentOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      'delivery.deliveryBoyId': req.user._id,
      status: { $nin: ['delivered', 'returned', 'cancelled'] },
      'delivery.status': { $in: ['assigned', 'accepted'] }
    })
    .populate({
      path: 'items.productId',
      populate: {
        path: 'sellerId',
        select: 'name phone sellerProfile'
      }
    })
    .populate('userId', 'name phone email addresses');
    
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      _id: orderId,
      'delivery.deliveryBoyId': req.user._id,
      'delivery.status': 'assigned'
    });

    if (!order) return res.status(404).json({ error: 'Order not found or no longer assigned to you.' });

    order.delivery.status = 'accepted';
    if (order.status === 'return-requested') {
      order.returnDetails.returnDeliveryBoyId = req.user._id;
    }
    await order.save();

    res.json({ message: 'Order accepted', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept order' });
  }
};

export const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      _id: orderId,
      'delivery.deliveryBoyId': req.user._id,
      'delivery.status': 'assigned'
    });

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    // Mark as rejected by this driver
    order.delivery.rejectedBy.push(req.user._id);
    
    // Clear current driver from order
    order.delivery.deliveryBoyId = null;
    order.delivery.status = 'unassigned';
    
    // Clear current order from driver profile
    req.user.deliveryProfile.currentOrderId = null;
    await req.user.save();

    // Reassign algorithm
    const nextDriver = await User.findOne({
      role: 'delivery',
      'deliveryProfile.isOnline': true,
      'deliveryProfile.currentOrderId': null,
      _id: { $nin: order.delivery.rejectedBy }
    });

    if (nextDriver) {
      order.delivery.deliveryBoyId = nextDriver._id;
      order.delivery.status = 'assigned';
      nextDriver.deliveryProfile.currentOrderId = order._id;
      await nextDriver.save();
    }

    await order.save();
    res.json({ message: 'Order rejected and reassigned.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // 'picking', 'out-for-delivery', 'delivered'

    const order = await Order.findOne({
      _id: orderId,
      'delivery.deliveryBoyId': req.user._id,
      'delivery.status': 'accepted'
    });

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const oldStatus = order.status;
    order.status = status;
    
    if (status === 'delivered' && oldStatus !== 'delivered') {
      order.deliveredAt = new Date();
      // Track COD cash collected by delivery partner
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
        req.user.deliveryProfile.cashCollected = (req.user.deliveryProfile.cashCollected || 0) + order.totalAmount;
      }
      // Track delivery earnings
      req.user.deliveryProfile.totalEarnings = (req.user.deliveryProfile.totalEarnings || 0) + (order.deliveryEarnings || 0);
      req.user.deliveryProfile.currentOrderId = null;
      await req.user.save();

      // After 10 seconds, auto-assign next order (only if under cash limit)
      const driverId = req.user._id;
      setTimeout(async () => {
        try {
          const driver = await User.findById(driverId);
          if (!driver || !driver.deliveryProfile?.isOnline || driver.deliveryProfile?.currentOrderId) return;
          if ((driver.deliveryProfile.cashCollected || 0) >= CASH_LIMIT) return;

          const nextOrder = await Order.findOne({
            status: 'confirmed',
            'delivery.status': 'unassigned',
            'delivery.rejectedBy': { $ne: driverId }
          });

          if (nextOrder) {
            nextOrder.delivery.deliveryBoyId = driverId;
            nextOrder.delivery.status = 'assigned';
            driver.deliveryProfile.currentOrderId = nextOrder._id;
            await nextOrder.save();
            await driver.save();
          }
        } catch (err) {
          console.error('Auto-reassignment error:', err);
        }
      }, 10000);
    }

    if (status === 'returned' && oldStatus !== 'returned') {
      req.user.deliveryProfile.currentOrderId = null;
      req.user.deliveryProfile.totalEarnings = (req.user.deliveryProfile.totalEarnings || 0) + (order.deliveryEarnings || 0);
      
      // Auto-refund to user
      order.paymentStatus = 'refunded';
      await req.user.save();
    }

    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const getDeliveryHistory = async (req, res) => {
  try {
    const { date } = req.query;
    let query = {
      'delivery.deliveryBoyId': req.user._id,
      status: { $in: ['delivered', 'returned', 'cancelled'] }
    };

    if (date) {
      // Create a range that covers the entire day regardless of timezone shifts
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.updatedAt = { $gte: startOfDay, $lte: endOfDay };
      console.log(`Filtering history for ${req.user.name} on date: ${date} [Range: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}]`);
    }

    const orders = await Order.find(query)
    .sort('-updatedAt')
    .limit(date ? 200 : 50)
    .populate('items.productId', 'name images price')
    .populate('userId', 'name email');

    res.json({ orders });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// Mark as reached — generates OTP for user verification
export const markReached = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      'delivery.deliveryBoyId': req.user._id,
      'delivery.status': 'accepted',
      status: { $in: ['out-for-delivery', 'returning'] }
    });

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    // Generate a 4-digit OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    order.deliveryOTP = otp;
    order.status = 'reached';
    await order.save();

    res.json({ message: 'Marked as reached. OTP sent to customer.', order });
  } catch (error) {
    console.error('Mark reached error:', error);
    res.status(500).json({ error: 'Failed to mark as reached' });
  }
};

// Verify OTP and complete delivery
export const verifyDeliveryOTP = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      'delivery.deliveryBoyId': req.user._id,
      status: 'reached'
    });

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    if (order.deliveryOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // OTP verified — mark as delivered
    const oldStatus = order.status;
    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.deliveryOTP = null;

    if (oldStatus !== 'delivered') {
      // Track COD cash collected by delivery partner
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
        req.user.deliveryProfile.cashCollected = (req.user.deliveryProfile.cashCollected || 0) + order.totalAmount;
      }
      // Track delivery earnings
      req.user.deliveryProfile.totalEarnings = (req.user.deliveryProfile.totalEarnings || 0) + (order.deliveryEarnings || 0);
      req.user.deliveryProfile.currentOrderId = null;
      await req.user.save();

      // Auto-assign next order after 10 seconds (only if under cash limit)
      const driverId = req.user._id;
      setTimeout(async () => {
        try {
          const driver = await User.findById(driverId);
          if (!driver || !driver.deliveryProfile?.isOnline || driver.deliveryProfile?.currentOrderId) return;
          if ((driver.deliveryProfile.cashCollected || 0) >= CASH_LIMIT) {
            console.log(`Driver ${driverId} blocked from auto-assign: cash limit exceeded`);
            return;
          }

          const nextOrder = await Order.findOne({
            status: 'confirmed',
            'delivery.status': 'unassigned',
            'delivery.rejectedBy': { $ne: driverId }
          });

          if (nextOrder) {
            nextOrder.delivery.deliveryBoyId = driverId;
            nextOrder.delivery.status = 'assigned';
            driver.deliveryProfile.currentOrderId = nextOrder._id;
            await nextOrder.save();
            await driver.save();
          }
        } catch (err) {
          console.error('Auto-reassignment error:', err);
        }
      }, 10000);
    }

    await order.save();
    res.json({ message: 'OTP verified. Order delivered successfully!', order });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

// ===== Earnings Dashboard =====
export const getEarnings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const cashCollected = user.deliveryProfile.cashCollected || 0;
    const totalEarnings = user.deliveryProfile.totalEarnings || 0;
    const isBlocked = cashCollected >= CASH_LIMIT;

    // Get recent COD deliveries for history
    const codOrders = await Order.find({
      'delivery.deliveryBoyId': req.user._id,
      status: 'delivered',
      paymentMethod: 'cod'
    })
    .sort('-updatedAt')
    .limit(20)
    .select('_id totalAmount deliveryEarnings deliveryFee createdAt updatedAt paymentMethod items');

    // Get all delivered orders for earnings breakdown
    const allDelivered = await Order.find({
      'delivery.deliveryBoyId': req.user._id,
      status: 'delivered'
    })
    .sort('-updatedAt')
    .limit(30)
    .select('_id totalAmount deliveryEarnings deliveryFee deliveryDistanceKm createdAt updatedAt paymentMethod');

    // Calculate today's, weekly and monthly stats
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Past 7 days
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayDeliveries = allDelivered.filter(o => new Date(o.updatedAt) >= startOfToday);
    const weeklyDeliveries = allDelivered.filter(o => new Date(o.updatedAt) >= startOfWeek);
    const monthlyDeliveries = allDelivered.filter(o => new Date(o.updatedAt) >= startOfMonth);

    const todayEarnings = todayDeliveries.reduce((sum, o) => sum + (o.deliveryEarnings || 0), 0);
    const todayOrdersCount = todayDeliveries.length;
    
    const weeklyEarnings = weeklyDeliveries.reduce((sum, o) => sum + (o.deliveryEarnings || 0), 0);
    const weeklyOrdersCount = weeklyDeliveries.length;

    const monthlyEarnings = monthlyDeliveries.reduce((sum, o) => sum + (o.deliveryEarnings || 0), 0);
    const monthlyOrdersCount = monthlyDeliveries.length;

    res.json({
      cashCollected,
      totalEarnings,
      todayEarnings,
      todayOrders: todayOrdersCount,
      weeklyEarnings,
      weeklyOrders: weeklyOrdersCount,
      monthlyEarnings,
      monthlyOrders: monthlyOrdersCount,
      cashLimit: CASH_LIMIT,
      isBlocked,
      codOrders,
      recentDeliveries: allDelivered,
      remittanceHistory: user.deliveryProfile.remittanceHistory || []
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};

// ===== Pay Cash to Company =====
export const payToCompany = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);
    const currentCash = user.deliveryProfile.cashCollected || 0;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount.' });
    }
    if (amount > currentCash) {
      return res.status(400).json({ error: 'Amount exceeds your cash balance.' });
    }

    user.deliveryProfile.cashCollected = Math.max(0, currentCash - amount);
    user.deliveryProfile.remittanceHistory.push({ amount, date: new Date() });
    await user.save();

    res.json({
      message: `₹${amount} paid to company successfully.`,
      cashCollected: user.deliveryProfile.cashCollected,
      isBlocked: user.deliveryProfile.cashCollected >= CASH_LIMIT
    });
  } catch (error) {
    console.error('Pay to company error:', error);
    res.status(500).json({ error: 'Failed to process payment.' });
  }
};
