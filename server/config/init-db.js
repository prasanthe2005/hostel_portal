const { promisePool } = require('./database');
const bcrypt = require('bcryptjs');

// Database initialization script tailored to the user's requested schema
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database schema for Hostel Management...');

    // 1. Admin table
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS Admin (
        admin_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Student table
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS Student (
        student_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        roll_number VARCHAR(100) UNIQUE,
        year INT,
        department VARCHAR(255),
        address TEXT,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Hostel table
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS Hostel (
        hostel_id INT PRIMARY KEY AUTO_INCREMENT,
        hostel_name VARCHAR(255) NOT NULL,
        total_floors INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Floor table
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS Floor (
        floor_id INT PRIMARY KEY AUTO_INCREMENT,
        floor_number INT NOT NULL,
        hostel_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Room table
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS Room (
        room_id INT PRIMARY KEY AUTO_INCREMENT,
        room_number VARCHAR(50) NOT NULL,
        room_type ENUM('AC','Non-AC') DEFAULT 'Non-AC',
        status ENUM('Available','Occupied') DEFAULT 'Available',
        floor_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (floor_id) REFERENCES Floor(floor_id) ON DELETE CASCADE,
        UNIQUE KEY unique_room_per_floor (floor_id, room_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Room_Allocation table (one student <-> one room at a time)
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS Room_Allocation (
        allocation_id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        room_id INT NOT NULL,
        allocated_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE,
        UNIQUE KEY unique_student (student_id),
        UNIQUE KEY unique_room (room_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Room_Change_Request table
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS Room_Change_Request (
        request_id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        current_room_id INT NOT NULL,
        preferred_room_1 INT,
        preferred_room_2 INT,
        preferred_room_3 INT,
        status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
        request_date DATE NOT NULL,
        processed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
        FOREIGN KEY (current_room_id) REFERENCES Room(room_id) ON DELETE CASCADE,
        FOREIGN KEY (preferred_room_1) REFERENCES Room(room_id) ON DELETE SET NULL,
        FOREIGN KEY (preferred_room_2) REFERENCES Room(room_id) ON DELETE SET NULL,
        FOREIGN KEY (preferred_room_3) REFERENCES Room(room_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Database initialization completed with requested tables:');
    console.log('   - Admin');
    console.log('   - Student');
    console.log('   - Hostel');
    console.log('   - Floor');
    console.log('   - Room');
    console.log('   - Room_Allocation');
    console.log('   - Room_Change_Request');

    // Add last_login columns if they don't exist (safe on MySQL 8+)
    try {
      await promisePool.execute(`ALTER TABLE Admin ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL`);
      await promisePool.execute(`ALTER TABLE Student ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL`);
      console.log('✅ Ensured last_login columns exist on Admin and Student');
    } catch (e) {
      // If ALTER ... IF NOT EXISTS is not supported, attempt add and ignore errors
      try {
        await promisePool.execute(`ALTER TABLE Admin ADD COLUMN last_login TIMESTAMP NULL`);
      } catch (e2) {}
      try {
        await promisePool.execute(`ALTER TABLE Student ADD COLUMN last_login TIMESTAMP NULL`);
      } catch (e3) {}
    }
    // Add current_token column to Admin to store active session token
    try {
      await promisePool.execute(`ALTER TABLE Admin ADD COLUMN IF NOT EXISTS current_token VARCHAR(500) NULL`);
      console.log('✅ Ensured current_token column exists on Admin');
    } catch (e) {
      try {
        await promisePool.execute(`ALTER TABLE Admin ADD COLUMN current_token VARCHAR(500) NULL`);
      } catch (e2) {}
    }

    // Add current_token column to Student to store active session token
    try {
      await promisePool.execute(`ALTER TABLE Student ADD COLUMN IF NOT EXISTS current_token VARCHAR(500) NULL`);
      console.log('✅ Ensured current_token column exists on Student');
    } catch (e) {
      try {
        await promisePool.execute(`ALTER TABLE Student ADD COLUMN current_token VARCHAR(500) NULL`);
      } catch (e2) {}
    }

    // Insert a default admin user if none exists
    try {
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@hostel.com';
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const [rows] = await promisePool.execute(`SELECT admin_id FROM Admin WHERE email = ? LIMIT 1`, [adminEmail]);
      if (!rows || !rows.length) {
        const hashed = await bcrypt.hash(adminPassword, 10);
        await promisePool.execute(`INSERT INTO Admin (name, email, password) VALUES (?, ?, ?)`, ['Default Admin', adminEmail, hashed]);
        console.log(`✅ Default admin created: ${adminEmail} / ${adminPassword}`);
      } else {
        console.log('ℹ️  Default admin already exists');
      }
    } catch (e) {
      console.warn('⚠️  Could not ensure default admin exists:', e.message || e);
    }

    // Insert a default student user if none exists
    try {
      const studentEmail = process.env.DEFAULT_STUDENT_EMAIL || 'student@hostel.com';
      const studentPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'student123';
      const [srows] = await promisePool.execute(`SELECT student_id FROM Student WHERE email = ? LIMIT 1`, [studentEmail]);
      if (!srows || !srows.length) {
        const shashed = await bcrypt.hash(studentPassword, 10);
        await promisePool.execute(`INSERT INTO Student (name, roll_number, year, department, address, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)`, ['Default Student', 'S1001', 1, 'CSE', 'Hostel Block A', studentEmail, shashed]);
        console.log(`✅ Default student created: ${studentEmail} / ${studentPassword}`);
      } else {
        console.log('ℹ️  Default student already exists');
      }
    } catch (e) {
      console.warn('⚠️  Could not ensure default student exists:', e.message || e);
    }

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };