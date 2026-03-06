-- Restore Student Table with Complete Structure
-- This script recreates the student table with all required fields

USE hostel_db;

-- Check if table exists and show message
SELECT 'Checking student table...' AS message;

-- Create the complete student table structure (only if not exists)
CREATE TABLE IF NOT EXISTS student (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  roll_number VARCHAR(100) UNIQUE,
  year INT,
  department VARCHAR(255),
  residence_type ENUM('Hosteller', 'DayScholar') DEFAULT 'Hosteller',
  preferred_room_type ENUM('AC', 'Non-AC') DEFAULT 'Non-AC',
  address TEXT,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  parent_contact VARCHAR(20),
  gender ENUM('Male', 'Female', 'Other'),
  allocation_status ENUM('Pending', 'Allocated', 'Not Applicable') DEFAULT 'Pending',
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  current_token VARCHAR(500)
);

SELECT 'Student table restored successfully with complete structure!' AS message;
