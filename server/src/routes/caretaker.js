import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { 
  caretakerLogin, 
  getCaretakerDashboard, 
  getHostelComplaints 
} from '../controllers/caretakerController.js';
import { updateComplaintStatus } from '../controllers/complaintController.js';

const router = express.Router();

// Public routes
router.post('/login', caretakerLogin);

// Protected routes
router.get('/dashboard', authMiddleware('caretaker'), getCaretakerDashboard);
router.get('/complaints', authMiddleware('caretaker'), getHostelComplaints);
router.put('/complaints/:complaint_id/status', authMiddleware('caretaker'), updateComplaintStatus);

export default router;
