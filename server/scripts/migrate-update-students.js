import pool from '../src/config/db.js';

async function updateStudentsTable() {
  const conn = await pool.getConnection();
  try {
    console.log('Updating students table structure...');
    
    // Rename password_hash to password if it exists
    try {
      await conn.query(`ALTER TABLE students CHANGE COLUMN password_hash password VARCHAR(255)`);
      console.log('✓ Renamed password_hash to password');
    } catch (err) {
      if (err.message.includes("doesn't exist")) {
        console.log('- password column already exists or password_hash not found');
      }
    }
    
    // Add year column
    try {
      await conn.query(`ALTER TABLE students ADD COLUMN year INT AFTER roll_number`);
      console.log('✓ Added year column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- year column already exists');
      } else {
        throw err;
      }
    }
    
    // Modify name to VARCHAR(255)
    try {
      await conn.query(`ALTER TABLE students MODIFY COLUMN name VARCHAR(255) NOT NULL`);
      console.log('✓ Modified name column to VARCHAR(255)');
    } catch (err) {
      console.log('- Could not modify name column:', err.message);
    }
    
    // Modify roll_number to VARCHAR(100)
    try {
      await conn.query(`ALTER TABLE students MODIFY COLUMN roll_number VARCHAR(100)`);
      console.log('✓ Modified roll_number column to VARCHAR(100)');
    } catch (err) {
      console.log('- Could not modify roll_number column:', err.message);
    }
    
    // Modify department to VARCHAR(255)
    try {
      await conn.query(`ALTER TABLE students MODIFY COLUMN department VARCHAR(255)`);
      console.log('✓ Modified department column to VARCHAR(255)');
    } catch (err) {
      console.log('- Could not modify department column:', err.message);
    }
    
    // Modify email to VARCHAR(255)
    try {
      await conn.query(`ALTER TABLE students MODIFY COLUMN email VARCHAR(255) UNIQUE`);
      console.log('✓ Modified email column to VARCHAR(255)');
    } catch (err) {
      console.log('- Could not modify email column:', err.message);
    }
    
    // Add address column
    try {
      await conn.query(`ALTER TABLE students ADD COLUMN address TEXT AFTER department`);
      console.log('✓ Added address column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- address column already exists');
      } else {
        throw err;
      }
    }
    
    // Add updated_at column
    try {
      await conn.query(`ALTER TABLE students ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`);
      console.log('✓ Added updated_at column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- updated_at column already exists');
      } else {
        throw err;
      }
    }
    
    // Add last_login column
    try {
      await conn.query(`ALTER TABLE students ADD COLUMN last_login TIMESTAMP NULL AFTER updated_at`);
      console.log('✓ Added last_login column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- last_login column already exists');
      } else {
        throw err;
      }
    }
    
    // Add current_token column
    try {
      await conn.query(`ALTER TABLE students ADD COLUMN current_token VARCHAR(500) AFTER last_login`);
      console.log('✓ Added current_token column');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('- current_token column already exists');
      } else {
        throw err;
      }
    }
    
    // Modify student_id to INT
    try {
      await conn.query(`ALTER TABLE students MODIFY COLUMN student_id INT PRIMARY KEY AUTO_INCREMENT`);
      console.log('✓ Modified student_id to INT');
    } catch (err) {
      console.log('- Could not modify student_id column:', err.message);
    }
    
    console.log('\n✓ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Error during migration:', err.message);
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

updateStudentsTable();
