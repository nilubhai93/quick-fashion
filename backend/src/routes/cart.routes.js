import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, acceptBundle } from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getCart);
router.post('/add', authenticate, addToCart);
router.put('/item/:itemId', authenticate, updateCartItem);
router.delete('/item/:itemId', authenticate, removeFromCart);
router.delete('/clear', authenticate, clearCart);
router.post('/accept-bundle', authenticate, acceptBundle);

export default router;
