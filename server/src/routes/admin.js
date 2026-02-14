import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { 
  createHostel, 
  listHostels, 
  updateHostel,
  deleteHostel,
  allocateRoomsFCFS, 
  listRequests, 
  handleRequest, 
  listStudents, 
  listRooms, 
  createRoom,
  updateRoom,
  deleteRoom,
  allocateRoomToStudent, 
  deallocateRoom 
} from '../controllers/adminController.js';
const router = express.Router();

router.use(authMiddleware('admin'));

// Hostel routes
router.post('/hostels', createHostel);
router.get('/hostels', listHostels);
router.put('/hostels/:hostel_id', updateHostel);
router.delete('/hostels/:hostel_id', deleteHostel);

// Room routes
router.get('/rooms', listRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:room_id', updateRoom);
router.delete('/rooms/:room_id', deleteRoom);

// Student routes
router.get('/students', listStudents);

// Allocation routes
router.post('/allocate', allocateRoomsFCFS);
router.post('/allocate-student', allocateRoomToStudent);
router.post('/deallocate', deallocateRoom);

// Request routes
router.get('/requests', listRequests);
router.post('/requests/:id', handleRequest);

export default router;
