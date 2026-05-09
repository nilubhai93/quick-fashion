import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const DELIVERY_RATE_PER_KM = 10; // ₹10 per km
const CASH_LIMIT = 2500; // ₹2500 COD cash limit for delivery partners

// Haversine formula to calculate distance in km between two coordinates
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // round to 2 decimal places
}

export const getSellerOrders = async (req, res) => {
  try {
    // Find all products owned by this seller
    const sellerProducts = await Product.find({ sellerId: req.user._id }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    // Find orders that contain at least one of these products
    const orders = await Order.find({
      'items.productId': { $in: sellerProductIds }
    })
    .sort('-createdAt')
    .populate('userId', 'name email address')
    .populate('items.productId', 'name images price')
    .populate('delivery.deliveryBoyId', 'name phone');

    res.json({ orders, sellerProductIds });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ error: 'Failed to fetch seller orders.' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    // Verify ownership
    const sellerProducts = await Product.find({ sellerId: req.user._id }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    const order = await Order.findOne({
      _id: orderId,
      'items.productId': { $in: sellerProductIds }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or not authorized' });
    }

    order.status = status;
    if (status === 'cancelled') {
      order.cancelledBy = 'seller';
      order.cancelReason = reason || 'Seller cancelled';
    }

    // Calculate delivery distance & earnings when confirming
    if (status === 'confirmed') {
      // Get seller's hub location from profile, fallback to default
      const seller = req.user;
      const hubLat = seller.sellerProfile?.hubLocation?.lat || 22.7632;
      const hubLng = seller.sellerProfile?.hubLocation?.lng || 88.3700;

      order.sellerHubLocation = { lat: hubLat, lng: hubLng };

      // Calculate distance if delivery location exists
      if (order.deliveryLocation?.lat && order.deliveryLocation?.lng) {
        const distKm = getDistanceKm(hubLat, hubLng, order.deliveryLocation.lat, order.deliveryLocation.lng);
        order.deliveryDistanceKm = distKm;
        order.deliveryEarnings = Math.max(25, Math.round(distKm * DELIVERY_RATE_PER_KM));
      }
    }

    // Delivery Assignment logic
    if (status === 'confirmed' && order.delivery.status === 'unassigned') {
      const assigned = await tryAssignDriver(order);

      // If no driver found, retry up to 4 times every 15 seconds
      if (!assigned) {
        let retries = 0;
        const retryAssignment = async () => {
          retries++;
          if (retries > 4) return;
          try {
            const freshOrder = await Order.findById(order._id);
            if (!freshOrder || freshOrder.delivery.status !== 'unassigned') return; // already assigned
            const success = await tryAssignDriver(freshOrder);
            if (!success) {
              setTimeout(retryAssignment, 15000);
            } else {
              await freshOrder.save();
              console.log(`Retry #${retries}: Assigned order ${freshOrder._id} to driver ${freshOrder.delivery.deliveryBoyId}`);
            }
          } catch (err) {
            console.error('Retry assignment error:', err);
          }
        };
        setTimeout(retryAssignment, 15000);
      }
    }

    await order.save();
    
    // Fully populate for consistent UI update
    await order.populate([
      { path: 'userId', select: 'name email address' },
      { path: 'items.productId', select: 'name images price' },
      { path: 'delivery.deliveryBoyId', select: 'name phone' }
    ]);

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
};

// Helper: try to find and assign an available driver
async function tryAssignDriver(order) {
  // First try drivers with no current order AND under cash limit
  let availableDriver = await User.findOne({
    role: 'delivery',
    'deliveryProfile.isOnline': true,
    'deliveryProfile.currentOrderId': null,
    'deliveryProfile.cashCollected': { $lt: CASH_LIMIT },
    _id: { $nin: order.delivery.rejectedBy || [] }
  });

  // If not found, look for drivers with stale currentOrderId (order no longer active)
  if (!availableDriver) {
    const busyDrivers = await User.find({
      role: 'delivery',
      'deliveryProfile.isOnline': true,
      'deliveryProfile.currentOrderId': { $ne: null },
      'deliveryProfile.cashCollected': { $lt: CASH_LIMIT },
      _id: { $nin: order.delivery.rejectedBy || [] }
    });

    for (const driver of busyDrivers) {
      const existingOrder = await Order.findById(driver.deliveryProfile.currentOrderId);
      if (!existingOrder || ['delivered', 'cancelled'].includes(existingOrder.status)) {
        driver.deliveryProfile.currentOrderId = null;
        await driver.save();
        availableDriver = driver;
        break;
      }
    }
  }

  if (availableDriver) {
    order.delivery.deliveryBoyId = availableDriver._id;
    order.delivery.status = 'assigned';
    availableDriver.deliveryProfile.currentOrderId = order._id;
    await availableDriver.save();
    return true;
  }
  return false;
}
