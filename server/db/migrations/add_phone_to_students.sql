-- Migration: Add phone column to students table
-- Date: 2026-02-11

USE hostel_db;

-- Add phone column to students table if it doesn't exist
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER department;

-- Show success message
SELECT 'Phone column added successfully to students table' AS message;
