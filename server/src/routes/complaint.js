import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { 
  submitComplaint, 
  getMyComplaints, 
  getAllComplaints, 
  updateComplaintStatus,
  confirmResolution 
} from '../controllers/complaintController.js';

const router = express.Router();

// Student routes - require student authentication
router.post('/submit', authMiddleware('student'), submitComplaint);
router.get('/my-complaints', authMiddleware('student'), getMyComplaints);
router.put('/:complaint_id/confirm', authMiddleware('student'), confirmResolution);

// Caretaker routes - require caretaker authentication
router.put('/:complaint_id/status', authMiddleware('caretaker'), updateComplaintStatus);

export default router;
