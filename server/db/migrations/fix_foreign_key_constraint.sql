-- Fix foreign key constraint in room_allocations table
-- The constraint was referencing 'students' but should reference 'student'

-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE room_allocations 
DROP FOREIGN KEY room_allocations_ibfk_1;

-- Step 2: Add the correct foreign key constraint
ALTER TABLE room_allocations
ADD CONSTRAINT room_allocations_ibfk_1 
FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE;

-- Verify the fix
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'hostel_db'
  AND TABLE_NAME = 'room_allocations'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
