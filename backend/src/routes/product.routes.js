import { Router } from 'express';
import { getProducts, getProductById, getCategories, getFeatured, getDeals, getQuickDelivery } from '../controllers/product.controller.js';
import { productQueryValidation } from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, productQueryValidation, getProducts);
router.get('/categories', getCategories);
router.get('/featured', getFeatured);
router.get('/deals', getDeals);
router.get('/quick-delivery', getQuickDelivery);
router.get('/:id', optionalAuth, getProductById);

export default router;
