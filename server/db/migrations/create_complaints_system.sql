-- Migration: Create complaints and caretakers tables with full workflow support
USE hostel_db;

-- Create caretakers table if not exists
CREATE TABLE IF NOT EXISTS caretakers (
  caretaker_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  hostel_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE SET NULL
);

-- Create complaints table with all status options
CREATE TABLE IF NOT EXISTS complaints (
  complaint_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
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
);

-- If complaints table already exists, update the status enum to include new values
-- This is a workaround since ALTER ENUM is not straightforward in MySQL
-- First backup existing data
CREATE TABLE IF NOT EXISTS complaints_backup AS SELECT * FROM complaints;

-- Drop and recreate with new enum values
DROP TABLE IF EXISTS complaints;

CREATE TABLE complaints (
  complaint_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
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
);

-- Restore data if backup exists
INSERT IGNORE INTO complaints 
SELECT * FROM complaints_backup 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'complaints_backup');

-- Clean up backup
DROP TABLE IF EXISTS complaints_backup;
