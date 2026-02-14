import express from 'express';
import { listPublicRooms } from '../controllers/publicController.js';
const router = express.Router();

router.get('/rooms', listPublicRooms);

export default router;
