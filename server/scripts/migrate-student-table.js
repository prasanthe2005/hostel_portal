import pool from '../src/config/db.js';

async function updateStudentTable() {
  const conn = await pool.getConnection();
  try {
    console.log('Updating student table structure...\n');
    
    // Add phone column
    try {
      await conn.query(`ALTER TABLE student ADD COLUMN phone VARCHAR(20) AFTER email`);
      console.log('✓ Added phone column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- phone column already exists');
      } else {
        console.log('! Error adding phone:', err.message);
      }
    }
    
    // Add year column
    try {
      await conn.query(`ALTER TABLE student ADD COLUMN year INT AFTER roll_number`);
      console.log('✓ Added year column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- year column already exists');
      } else {
        console.log('! Error adding year:', err.message);
      }
    }
    
    // Add address column
    try {
      await conn.query(`ALTER TABLE student ADD COLUMN address TEXT AFTER department`);
      console.log('✓ Added address column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- address column already exists');
      } else {
        console.log('! Error adding address:', err.message);
      }
    }
    
    // Add updated_at column
    try {
      await conn.query(`ALTER TABLE student ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`);
      console.log('✓ Added updated_at column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- updated_at column already exists');
      } else {
        console.log('! Error adding updated_at:', err.message);
      }
    }
    
    // Add last_login column
    try {
      await conn.query(`ALTER TABLE student ADD COLUMN last_login TIMESTAMP NULL AFTER updated_at`);
      console.log('✓ Added last_login column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- last_login column already exists');
      } else {
        console.log('! Error adding last_login:', err.message);
      }
    }
    
    // Add current_token column
    try {
      await conn.query(`ALTER TABLE student ADD COLUMN current_token VARCHAR(500) AFTER last_login`);
      console.log('✓ Added current_token column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- current_token column already exists');
      } else {
        console.log('! Error adding current_token:', err.message);
      }
    }
    
    // Modify name to VARCHAR(255)
    try {
      await conn.query(`ALTER TABLE student MODIFY COLUMN name VARCHAR(255) NOT NULL`);
      console.log('✓ Modified name column to VARCHAR(255)');
    } catch (err) {
      console.log('! Could not modify name column:', err.message);
    }
    
    // Modify roll_number to VARCHAR(100)
    try {
      await conn.query(`ALTER TABLE student MODIFY COLUMN roll_number VARCHAR(100)`);
      console.log('✓ Modified roll_number column to VARCHAR(100)');
    } catch (err) {
      console.log('! Could not modify roll_number column:', err.message);
    }
    
    // Modify department to VARCHAR(255)
    try {
      await conn.query(`ALTER TABLE student MODIFY COLUMN department VARCHAR(255)`);
      console.log('✓ Modified department column to VARCHAR(255)');
    } catch (err) {
      console.log('! Could not modify department column:', err.message);
    }
    
    // Modify email to VARCHAR(255)
    try {
      await conn.query(`ALTER TABLE student MODIFY COLUMN email VARCHAR(255) UNIQUE`);
      console.log('✓ Modified email column to VARCHAR(255)');
    } catch (err) {
      console.log('! Could not modify email column:', err.message);
    }
    
    // Rename password_hash to password if it exists
    try {
      await conn.query(`ALTER TABLE student CHANGE COLUMN password_hash password VARCHAR(255)`);
      console.log('✓ Renamed password_hash to password');
    } catch (err) {
      if (err.message.includes("doesn't exist") || err.message.includes("check that it exists")) {
        console.log('- password column already exists or password_hash not found');
      } else {
        console.log('! Error renaming password_hash:', err.message);
      }
    }
    
    // Modify student_id to INT
    try {
      await conn.query(`ALTER TABLE student MODIFY COLUMN student_id INT PRIMARY KEY AUTO_INCREMENT`);
      console.log('✓ Modified student_id to INT');
    } catch (err) {
      console.log('! Could not modify student_id column:', err.message);
    }
    
    console.log('\n✅ Migration completed successfully!');
    
    // Show final structure
    const [columns] = await conn.query(`DESCRIBE student`);
    console.log('\nFinal student table structure:');
    console.table(columns);
    
  } catch (err) {
    console.error('❌ Error during migration:', err.message);
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

updateStudentTable();
