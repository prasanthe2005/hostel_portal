-- Fix room allocations to ensure one student can only have one room at a time
-- This prevents duplicate allocations and ensures accurate occupancy counts

-- Step 1: Remove any duplicate allocations (keep the latest one)
DELETE ra1 FROM room_allocations ra1
INNER JOIN room_allocations ra2 
WHERE ra1.student_id = ra2.student_id 
  AND ra1.allocation_id < ra2.allocation_id;

-- Step 2: Add UNIQUE constraint on student_id
ALTER TABLE room_allocations 
ADD UNIQUE KEY unique_student_allocation (student_id);

-- Step 3: Verify allocation_status matches actual allocations
UPDATE student s
SET allocation_status = 'Allocated'
WHERE EXISTS (
  SELECT 1 FROM room_allocations ra WHERE ra.student_id = s.student_id
)
AND allocation_status != 'Allocated'
AND residence_type = 'Hosteller';

UPDATE student s
SET allocation_status = 'Pending'  
WHERE NOT EXISTS (
  SELECT 1 FROM room_allocations ra WHERE ra.student_id = s.student_id
)
AND allocation_status = 'Allocated'
AND residence_type = 'Hosteller';
