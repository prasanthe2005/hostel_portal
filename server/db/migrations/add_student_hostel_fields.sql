-- Add hostel-related fields to student table
USE hostel_db;

-- Add residence type field (Hosteller or DayScholar)
ALTER TABLE student 
ADD COLUMN residence_type ENUM('Hosteller', 'DayScholar') DEFAULT 'Hosteller' 
AFTER department;

-- Add preferred room type (only relevant for Hostellers)
ALTER TABLE student 
ADD COLUMN preferred_room_type ENUM('AC', 'Non-AC') DEFAULT 'Non-AC' 
AFTER residence_type;

-- Add parent contact number
ALTER TABLE student 
ADD COLUMN parent_contact VARCHAR(20) 
AFTER phone;

-- Add gender field
ALTER TABLE student 
ADD COLUMN gender ENUM('Male', 'Female', 'Other') 
AFTER parent_contact;

-- Add allocation status (Pending, Allocated, Not Applicable)
ALTER TABLE student 
ADD COLUMN allocation_status ENUM('Pending', 'Allocated', 'Not Applicable') DEFAULT 'Pending' 
AFTER gender;

-- The created_at field already exists as registration_date equivalent

-- Add index on allocation fields for faster queries
CREATE INDEX idx_residence_allocation ON student(residence_type, allocation_status, created_at);
CREATE INDEX idx_preferred_room ON student(preferred_room_type, allocation_status);
