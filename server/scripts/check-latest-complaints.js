import pool from '../src/config/db.js';

async function checkComplaints() {
  const conn = await pool.getConnection();
  try {
    console.log('\n📋 Latest Complaints:\n');
    const [rows] = await conn.query(`
      SELECT 
        complaint_id, 
        complaint_type, 
        description,
        status, 
        created_at, 
        updated_at 
      FROM complaints 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    rows.forEach(c => {
      console.log(`ID: ${c.complaint_id}`);
      console.log(`Type: ${c.complaint_type}`);
      console.log(`Status: ${c.status}`);
      console.log(`Description: ${c.description ? c.description.substring(0, 50) + '...' : 'MISSING!'}`);
      console.log(`Created: ${c.created_at}`);
      console.log(`Updated: ${c.updated_at}`);
      console.log('---');
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

checkComplaints();
