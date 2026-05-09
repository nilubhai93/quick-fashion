import { Router } from 'express';
import { register, login, getProfile, updateProfile, updateSizeProfile, sendOtp, verifyOtp, getBankDetails, updateBankDetails } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validate.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/profile/size', authenticate, updateSizeProfile);
router.get('/profile/bank', authenticate, getBankDetails);
router.put('/profile/bank', authenticate, updateBankDetails);

export default router;
