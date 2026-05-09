import express from 'express';
import { authenticate, sellerOrAdmin } from '../middleware/auth.js';
import { productUpload } from '../middleware/productUpload.js';
import {
  getSellerDashboardStats,
  getSellerProducts,
  getSellerProductById,
  addSellerProduct,
  toggleProductStatus,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerSettings,
  updateSellerSettings,
  getSellerWalletStats
} from '../controllers/sellerProduct.controller.js';

const router = express.Router();

// All routes require authentication and the 'seller' or 'admin' role
router.use(authenticate, sellerOrAdmin);

// Dashboard stats
router.get('/dashboard-stats', getSellerDashboardStats);
router.get('/wallet-stats', getSellerWalletStats);

// Seller settings
router.get('/settings', getSellerSettings);
router.put('/settings', updateSellerSettings);

// View products
router.get('/products', getSellerProducts);
router.get('/products/:productId', getSellerProductById);

// Add product (allows dynamic color variants)
router.post('/products', productUpload.any(), addSellerProduct);

// Update product
router.put('/products/:productId', productUpload.any(), updateSellerProduct);

// Delete product
router.delete('/products/:productId', deleteSellerProduct);

// Disable/Enable product
router.patch('/products/:productId/toggle', toggleProductStatus);

export default router;
