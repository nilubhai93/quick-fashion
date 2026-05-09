import { Router } from 'express';
import { createOrder, getOrders, getOrderById, trackOrder, saveDeliveryAddress, getDeliveryAddresses, cancelOrder, rateOrderItem, requestReturn, cancelReturn } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/addresses', authenticate, getDeliveryAddresses);
router.post('/address', authenticate, saveDeliveryAddress);
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.get('/:id/track', authenticate, trackOrder);
router.post('/:id/cancel', authenticate, cancelOrder);
router.post('/:id/rate', authenticate, rateOrderItem);
router.post('/:id/return', authenticate, requestReturn);
router.post('/:id/cancel-return', authenticate, cancelReturn);

export default router;
