import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { wardenLogin, getWardenDashboard } from '../controllers/wardenController.js';

const router = express.Router();

router.post('/login', wardenLogin);
router.get('/dashboard', authMiddleware('warden'), getWardenDashboard);

export default router;
