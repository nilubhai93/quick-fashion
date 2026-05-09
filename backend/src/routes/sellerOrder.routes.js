import express from 'express';
import { getSellerOrders, updateOrderStatus } from '../controllers/sellerOrder.controller.js';
import { authenticate, sellerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(sellerOrAdmin);

router.get('/', getSellerOrders);
router.put('/:orderId/status', updateOrderStatus);

export default router;
