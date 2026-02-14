import pool from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateStudentFields() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Adding hostel-related fields to student table...\n');
    
    // Execute ALTER TABLE statements first
    try {
      await conn.query("ALTER TABLE student ADD COLUMN residence_type ENUM('Hosteller', 'DayScholar') DEFAULT 'Hosteller' AFTER department");
      console.log('✅ Added residence_type');
    } catch (e) {
      if (e.message.includes('Duplicate column')) console.log('⚠️  residence_type already exists');
      else throw e;
    }
    
    try {
      await conn.query("ALTER TABLE student ADD COLUMN preferred_room_type ENUM('AC', 'Non-AC') DEFAULT 'Non-AC' AFTER residence_type");
      console.log('✅ Added preferred_room_type');
    } catch (e) {
      if (e.message.includes('Duplicate column')) console.log('⚠️  preferred_room_type already exists');
      else throw e;
    }
    
    try {
      await conn.query("ALTER TABLE student ADD COLUMN parent_contact VARCHAR(20) AFTER phone");
      console.log('✅ Added parent_contact');
    } catch (e) {
      if (e.message.includes('Duplicate column')) console.log('⚠️  parent_contact already exists');
      else throw e;
    }
    
    try {
      await conn.query("ALTER TABLE student ADD COLUMN gender ENUM('Male', 'Female', 'Other') AFTER parent_contact");
      console.log('✅ Added gender');
    } catch (e) {
      if (e.message.includes('Duplicate column')) console.log('⚠️  gender already exists');
      else throw e;
    }
    
    try {
      await conn.query("ALTER TABLE student ADD COLUMN allocation_status ENUM('Pending', 'Allocated', 'Not Applicable') DEFAULT 'Pending' AFTER gender");
      console.log('✅ Added allocation_status');
    } catch (e) {
      if (e.message.includes('Duplicate column')) console.log('⚠️  allocation_status already exists');
      else throw e;
    }
    
    // Create indexes
    try {
      await conn.query('CREATE INDEX idx_residence_allocation ON student(residence_type, allocation_status, created_at)');
      console.log('✅ Created index idx_residence_allocation');
    } catch (e) {
      if (e.message.includes('Duplicate key')) console.log('⚠️  Index idx_residence_allocation already exists');
      else throw e;
    }
    
    try {
      await conn.query('CREATE INDEX idx_preferred_room ON student(preferred_room_type, allocation_status)');
      console.log('✅ Created index idx_preferred_room');
    } catch (e) {
      if (e.message.includes('Duplicate key')) console.log('⚠️  Index idx_preferred_room already exists');
      else throw e;
    }
    
    console.log('✅ Successfully added fields:');
    console.log('   - residence_type (Hosteller/DayScholar)');
    console.log('   - preferred_room_type (AC/Non-AC)');
    console.log('   - parent_contact');
    console.log('   - gender');
    console.log('   - allocation_status (Pending/Allocated/Not Applicable)\n');
    
    // Verify the changes
    const [columns] = await conn.query('DESCRIBE student');
    console.log('📊 Student table structure:');
    columns.forEach(col => {
      console.log(`   ${col.Field} - ${col.Type}`);
    });
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('⚠️  Fields already exist. Migration skipped.');
    } else {
      console.error('❌ Migration error:', error.message);
      throw error;
    }
  } finally {
    conn.release();
    await pool.end();
  }
}

migrateStudentFields();
