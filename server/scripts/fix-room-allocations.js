import pool from '../src/config/db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  console.log('🔧 Running room allocations fix migration...\n');
  
  const conn = await pool.getConnection();
  try {
    const statements = [
      {
        name: 'Remove duplicate allocations',
        sql: `DELETE ra1 FROM room_allocations ra1
              INNER JOIN room_allocations ra2 
              WHERE ra1.student_id = ra2.student_id 
                AND ra1.allocation_id < ra2.allocation_id`
      },
      {
        name: 'Add UNIQUE constraint on student_id',
        sql: `ALTER TABLE room_allocations 
              ADD UNIQUE KEY unique_student_allocation (student_id)`
      },
      {
        name: 'Update students to Allocated status',
        sql: `UPDATE student s
              SET allocation_status = 'Allocated'
              WHERE EXISTS (
                SELECT 1 FROM room_allocations ra WHERE ra.student_id = s.student_id
              )
              AND allocation_status != 'Allocated'
              AND residence_type = 'Hosteller'`
      },
      {
        name: 'Update students to Pending status',
        sql: `UPDATE student s
              SET allocation_status = 'Pending'  
              WHERE NOT EXISTS (
                SELECT 1 FROM room_allocations ra WHERE ra.student_id = s.student_id
              )
              AND allocation_status = 'Allocated'
              AND residence_type = 'Hosteller'`
      }
    ];
    
    console.log(`📋 Executing ${statements.length} migration steps\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const {name, sql} = statements[i];
      console.log(`\n[${i + 1}/${statements.length}] ${name}...`);
      
      try {
        const [result] = await conn.query(sql);
        console.log('✅ Success');
        if (result.affectedRows !== undefined) {
          console.log(`   Affected rows: ${result.affectedRows}`);
        }
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log('⚠️  Unique constraint already exists, skipping...');
        } else {
          console.error('❌ Error:', err.message);
          if (i === 0) {
            // First statement can fail if no duplicates, continue
            console.log('   Continuing...');
          } else {
            throw err;
          }
        }
      }
    }
    
    // Verify the migration
    console.log('\n\n📊 Verification:');
    
    // Check for any duplicate allocations
    const [duplicates] = await conn.query(`
      SELECT student_id, COUNT(*) as count 
      FROM room_allocations 
      GROUP BY student_id 
      HAVING count > 1
    `);
    
    if (duplicates.length > 0) {
      console.log('⚠️  WARNING: Found students with multiple allocations:');
      console.log(duplicates);
    } else {
      console.log('✅ No duplicate allocations found');
    }
    
    // Check allocation count vs student status
    const [allocStats] = await conn.query(`
      SELECT 
        (SELECT COUNT(*) FROM room_allocations) as total_allocations,
        (SELECT COUNT(*) FROM student WHERE allocation_status = 'Allocated') as students_marked_allocated,
        (SELECT COUNT(DISTINCT student_id) FROM room_allocations) as unique_students_allocated
    `);
    
    console.log('\n📈 Statistics:');
    console.log(`   Total allocations: ${allocStats[0].total_allocations}`);
    console.log(`   Unique students allocated: ${allocStats[0].unique_students_allocated}`);
    console.log(`   Students marked as "Allocated": ${allocStats[0].students_marked_allocated}`);
    
    if (allocStats[0].total_allocations === allocStats[0].unique_students_allocated) {
      console.log('✅ All allocations are unique (1 room per student)');
    }
    
    if (allocStats[0].total_allocations === allocStats[0].students_marked_allocated) {
      console.log('✅ Student status matches allocation records');
    } else {
      console.log(`⚠️  Mismatch: ${allocStats[0].total_allocations} allocations but ${allocStats[0].students_marked_allocated} students marked allocated`);
    }
    
    console.log('\n\n🎉 Migration completed successfully!');
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

runMigration();
