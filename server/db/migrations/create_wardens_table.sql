-- Migration: Create wardens table for admin-managed hostel wardens
USE hostel_db;

CREATE TABLE IF NOT EXISTS wardens (
  warden_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  hostel_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE RESTRICT,
  INDEX idx_warden_hostel (hostel_id),
  INDEX idx_warden_email (email)
);
