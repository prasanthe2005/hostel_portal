-- Schema for Hostel Management Portal (separate students/admins)
CREATE DATABASE IF NOT EXISTS hostel_db;
USE hostel_db;

CREATE TABLE IF NOT EXISTS admins (
  admin_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  roll_number VARCHAR(100),
  year INT,
  department VARCHAR(255),
  address TEXT,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  current_token VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS hostels (
  hostel_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  hostel_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS floors (
  floor_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  hostel_id BIGINT NOT NULL,
  floor_number INT NOT NULL,
  FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rooms (
  room_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  hostel_id BIGINT NOT NULL,
  floor_id BIGINT,
  room_number VARCHAR(50) NOT NULL,
  type ENUM('AC','Non-AC') DEFAULT 'Non-AC',
  capacity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE CASCADE,
  FOREIGN KEY (floor_id) REFERENCES floors(floor_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS room_allocations (
  allocation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room_change_requests (
  request_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  choice1 BIGINT,
  choice2 BIGINT,
  choice3 BIGINT,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  admin_comment VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);
