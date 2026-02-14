import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { dashboard, requestRoomChange } from '../controllers/studentController.js';
const router = express.Router();

router.use(authMiddleware('student'));

router.get('/dashboard', dashboard);
router.post('/request', requestRoomChange);

export default router;
