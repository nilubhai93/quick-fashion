import { Router } from 'express';
import { recommend, getChatHistory, clearChatHistory, smartFit, occasionSearch } from '../controllers/ai.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { chatValidation } from '../middleware/validate.js';

const router = Router();

router.post('/recommend', optionalAuth, recommend);
router.post('/occasion-search', optionalAuth, occasionSearch);
router.post('/smart-fit', smartFit);
router.get('/chat/history', authenticate, getChatHistory);
router.delete('/chat/history', authenticate, clearChatHistory);

export default router;
