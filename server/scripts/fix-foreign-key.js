import pool from '../src/config/db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixForeignKey() {
  console.log('🔧 Fixing foreign key constraint in room_allocations table...\n');
  
  const conn = await pool.getConnection();
  try {
    console.log('Step 1: Dropping incorrect foreign key constraint...');
    try {
      await conn.query('ALTER TABLE room_allocations DROP FOREIGN KEY room_allocations_ibfk_1');
      console.log('✅ Old constraint dropped');
    } catch (err) {
      if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('⚠️  Constraint already dropped or does not exist');
      } else {
        throw err;
      }
    }
    
    console.log('\nStep 2: Adding correct foreign key constraint...');
    await conn.query(`
      ALTER TABLE room_allocations
      ADD CONSTRAINT room_allocations_ibfk_1 
      FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
    `);
    console.log('✅ Correct constraint added');
    
    console.log('\nStep 3: Verifying the fix...');
    const [constraints] = await conn.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'hostel_db'
        AND TABLE_NAME = 'room_allocations'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('\n📊 Current Foreign Key Constraints:');
    console.table(constraints);
    
    const correctConstraint = constraints.find(c => 
      c.CONSTRAINT_NAME === 'room_allocations_ibfk_1' && 
      c.REFERENCED_TABLE_NAME === 'student'
    );
    
    if (correctConstraint) {
      console.log('\n✅ Foreign key constraint is now correct!');
      console.log(`   ${correctConstraint.CONSTRAINT_NAME}: student_id -> student(student_id)`);
    } else {
      console.log('\n⚠️  Warning: Constraint verification failed');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error('Error code:', err.code);
    console.error('SQL State:', err.sqlState);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

fixForeignKey();
