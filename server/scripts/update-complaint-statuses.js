import pool from '../src/config/db.js';

async function updateComplaintStatuses() {
  console.log('\n🚀 Updating Complaint Statuses...\n');
  
  const conn = await pool.getConnection();
  try {
    // First, check current status
    console.log('1️⃣ Checking current status column...');
    const [currentColumns] = await conn.query("DESCRIBE complaints");
    const statusColumn = currentColumns.find(c => c.Field === 'status');
    console.log('Current status type:', statusColumn.Type);
    
    // Create a backup of the complaints table
    console.log('\n2️⃣ Creating backup table...');
    await conn.query('DROP TABLE IF EXISTS complaints_backup');
    await conn.query('CREATE TABLE complaints_backup AS SELECT * FROM complaints');
    console.log('✅ Backup created');
    
    // Get the table structure without the status enum
    console.log('\n3️⃣ Recreating complaints table with new statuses...');
    
    // Drop the existing table
    await conn.query('DROP TABLE complaints');
    
    // Recreate with new enum values
    await conn.query(`
      CREATE TABLE complaints (
        complaint_id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        room_id BIGINT NOT NULL,
        complaint_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('Pending', 'In Progress', 'Resolved', 'Completed', 'Escalated', 'Reopened') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
        INDEX idx_student (student_id),
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ New complaints table created');
    
    // Restore data from backup
    console.log('\n4️⃣ Restoring data from backup...');
    await conn.query(`
      INSERT INTO complaints (complaint_id, student_id, room_id, complaint_type, description, status, created_at, updated_at)
      SELECT complaint_id, student_id, room_id, complaint_type, description, status, created_at, updated_at
      FROM complaints_backup
    `);
    console.log('✅ Data restored');
    
    // Verify
    console.log('\n5️⃣ Verifying new structure...');
    const [newColumns] = await conn.query("DESCRIBE complaints");
    const newStatusColumn = newColumns.find(c => c.Field === 'status');
    console.log('New status type:', newStatusColumn.Type);
    
    const enumMatch = newStatusColumn.Type.match(/enum\((.*)\)/i);
    if (enumMatch) {
      const values = enumMatch[1].split(',').map(v => v.replace(/'/g, '').trim());
      console.log('✅ Available statuses:', values.join(', '));
      
      const expectedStatuses = ['Pending', 'In Progress', 'Resolved', 'Completed', 'Escalated', 'Reopened'];
      const allPresent = expectedStatuses.every(s => values.includes(s));
      
      if (allPresent) {
        console.log('\n✅ SUCCESS! All 6 statuses are now available!');
      } else {
        console.log('\n❌ Some statuses are missing');
      }
    }
    
    // Check data
    console.log('\n6️⃣ Checking restored complaints...');
    const [complaints] = await conn.query('SELECT COUNT(*) as count FROM complaints');
    console.log(`✅ ${complaints[0].count} complaints restored`);
    
    // Clean up backup
    console.log('\n7️⃣ Cleaning up backup table...');
    await conn.query('DROP TABLE complaints_backup');
    console.log('✅ Backup removed');
    
    console.log('\n🎉 Migration completed successfully!\n');
    console.log('You can now:');
    console.log('  - Caretakers can mark complaints as "Escalated"');
    console.log('  - Students can confirm resolution (YES → Completed)');
    console.log('  - Students can reject resolution (NO → Reopened)');
    console.log('\n');
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error('Attempting to restore from backup...');
    
    try {
      // Try to restore from backup
      const [backupExists] = await conn.query("SHOW TABLES LIKE 'complaints_backup'");
      if (backupExists.length > 0) {
        await conn.query('DROP TABLE IF EXISTS complaints');
        await conn.query('CREATE TABLE complaints AS SELECT * FROM complaints_backup');
        console.log('✅ Restored from backup');
      }
    } catch (restoreErr) {
      console.error('❌ Could not restore backup:', restoreErr.message);
    }
  } finally {
    conn.release();
    process.exit(0);
  }
}

updateComplaintStatuses();
