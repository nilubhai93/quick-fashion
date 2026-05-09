import express from 'express';
import { applySeller, getSellerStatus } from '../controllers/seller.controller.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Route to submit a seller application
// 'document' matches the name sent by the frontend in FormData
router.post('/apply', authenticate, upload.single('document'), applySeller);

// Route to get current user application status
router.get('/status', authenticate, getSellerStatus);

export default router;
