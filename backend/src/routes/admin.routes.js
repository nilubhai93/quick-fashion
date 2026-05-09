import express from 'express';
import { getSellerApplications, updateSellerStatus, getAllUsers, getAllOrders } from '../controllers/admin.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Put all admin routes behind authenticate + adminOnly
router.use(authenticate, adminOnly);

// Seller Applications Management
router.get('/sellers', getSellerApplications);
router.put('/sellers/:id', updateSellerStatus);

// Users Management
router.get('/users', getAllUsers);

// Orders Management
router.get('/orders', getAllOrders);

export default router;
