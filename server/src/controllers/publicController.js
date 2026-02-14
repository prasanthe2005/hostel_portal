import pool from '../config/db.js';

export async function listPublicRooms(req, res){
  const conn = await pool.getConnection();
  try{
    const [rows] = await conn.query(`
      SELECT r.room_id, r.room_number, r.type, r.capacity,
        h.hostel_name, h.hostel_id,
        f.floor_number,
        (SELECT COUNT(*) FROM room_allocations ra WHERE ra.room_id = r.room_id) as assigned,
        CASE 
          WHEN (SELECT COUNT(*) FROM room_allocations ra WHERE ra.room_id = r.room_id) >= r.capacity THEN 'occupied'
          ELSE 'available'
        END as status
      FROM rooms r
      LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
      LEFT JOIN floors f ON r.floor_id = f.floor_id
      ORDER BY h.hostel_name, f.floor_number, r.room_number
    `);
    res.json(rows);
  }catch(err){ res.status(500).json({error:err.message}); }finally{ conn.release(); }
}
