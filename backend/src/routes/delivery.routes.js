import express from 'express';
import {
  getDeliveryProfile,
  updateDeliveryStatus,
  getCurrentOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  getDeliveryHistory,
  markReached,
  verifyDeliveryOTP,
  getEarnings,
  payToCompany
} from '../controllers/delivery.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Middleware to Ensure Delivery Role
router.use((req, res, next) => {
  if (req.user?.role !== 'delivery' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Delivery access required.' });
  }
  next();
});

router.get('/profile', getDeliveryProfile);
router.put('/status', updateDeliveryStatus);

router.get('/orders/current', getCurrentOrders);
router.put('/orders/:orderId/accept', acceptOrder);
router.put('/orders/:orderId/reject', rejectOrder);
router.put('/orders/:orderId/status', updateOrderStatus);
router.put('/orders/:orderId/reached', markReached);
router.put('/orders/:orderId/verify-otp', verifyDeliveryOTP);

router.get('/history', getDeliveryHistory);
router.get('/earnings', getEarnings);
router.post('/pay-company', payToCompany);

export default router;
