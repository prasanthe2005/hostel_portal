# Room Allocation & Occupancy Fix

## Issues Fixed

### 1. **Duplicate Room Allocations**
- **Problem**: A student could have multiple room allocations, causing incorrect occupancy counts
- **Solution**: Added UNIQUE constraint on `student_id` in `room_allocations` table
- **Impact**: Ensures one student = one room only

### 2. **Inaccurate Room Occupancy Display**  
- **Problem**: Admin dashboard showed wrong occupied/available counts
- **Solution**: Fixed by preventing duplicate allocations
- **Impact**: Room capacity now displays correctly

### 3. **Room Change Approval Not Updating Occupancy**
- **Problem**: When admin approves room change, old room didn't free up
- **Solution**: Added proper DELETE old allocation before INSERT new allocation with comprehensive logging
- **Impact**: Room occupancy updates correctly when students change rooms

### 4. **Student Allocation Status Mismatch**
- **Problem**: Student table `allocation_status` didn't match actual room_allocations
- **Solution**: Migration synchronizes status with actual allocations
- **Impact**: Student status accurately reflects allocation state

## How to Apply the Fix

### Step 1: Run the Migration

```bash
cd server
node scripts/fix-room-allocations.js
```

This will:
- ✅ Remove any duplicate allocations (keeps the latest)
- ✅ Add UNIQUE constraint on student_id
- ✅ Synchronize student allocation_status with actual allocations
- ✅ Show verification statistics

### Step 2: Restart the Server

```bash
npm start
# or
npm run dev
```

## Enhanced Logging

All allocation functions now have detailed console logging:

### When Admin Approves Room Change:
```
=== 📋 ROOM CHANGE REQUEST APPROVAL ===
Request ID: 5
Action: approve
🔍 Fetching request details...
✅ Request found for student: 123
Choices: {choice1: 45, choice2: 46, choice3: null}
🔍 Finding target room...
Checking room 45...
Room 45: 3/4 occupied
✅ Room 45 is available
🎯 Target room selected: 45
Old room: 30, New room: 45
🗑️ Removing old allocation...
Deleted 1 old allocation(s)
➕ Adding new allocation...
✅ New allocation created
📝 Updating student status...
✅ Student status updated to Allocated
✅ Transaction committed successfully
=== ✅ APPROVAL SUCCESS ===
```

### When Admin Allocates Room to Student:
```
=== 🏠 ALLOCATE ROOM TO STUDENT ===
Student ID: 456
Room ID: 78
🔍 Checking for existing allocation...
✅ No existing allocation found
🔍 Checking room capacity...
Room capacity: 2/4
✅ Room has capacity
➕ Allocating room to student...
✅ Room allocated
📝 Updating student status...
✅ Student status updated
=== ✅ ALLOCATION SUCCESS ===
```

## Testing the Fix

### Test 1: Room Change Request
1. **Student**: Request room change (3 choices)
2. **Admin**: Approve the request
3. **Verify**: 
   - Old room shows available capacity increased
   - New room shows occupied capacity increased
   - Student dashboard shows new room

### Test 2: Check Occupancy Accuracy
1. **Admin**: Go to Manage Rooms page
2. **Verify**: 
   - Each room shows correct `assigned/capacity`
   - Status is 'available' or 'occupied' correctly

### Test 3: Multiple Allocation Prevention
1. **Admin**: Try to allocate room to student who already has a room
2. **Expected**: Error message "Student already has a room allocation"

## Database Schema Changes

### Before:
```sql
CREATE TABLE room_allocations (
  allocation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  ...
);
-- No unique constraint on student_id
```

### After:
```sql
CREATE TABLE room_allocations (
  allocation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  ...
  UNIQUE KEY unique_student_allocation (student_id)  -- ✅ NEW
);
```

## Files Modified

1. ✅ `server/db/migrations/fix_room_allocations_unique.sql` - Migration SQL
2. ✅ `server/scripts/fix-room-allocations.js` - Migration runner script
3. ✅ `server/src/controllers/adminController.js` - Enhanced `handleRequest()` with logging
4. ✅ `server/src/controllers/adminController.js` - Enhanced `allocateRoomToStudent()` with logging
5. ✅ `server/src/controllers/authController.js` - Registration returns "User created successfully" (no token)
6. ✅ `server/src/controllers/studentController.js` - Fixed syntax error in `requestRoomChange()`

## Verification Queries

After migration, run these in MySQL to verify:

```sql
-- Check for duplicates (should return 0 rows)
SELECT student_id, COUNT(*) as count 
FROM room_allocations 
GROUP BY student_id 
HAVING count > 1;

-- Check allocation counts
SELECT 
  (SELECT COUNT(*) FROM room_allocations) as total_allocations,
  (SELECT COUNT(DISTINCT student_id) FROM room_allocations) as unique_students,
  (SELECT COUNT(*) FROM student WHERE allocation_status = 'Allocated') as students_marked_allocated;

-- View room occupancy
SELECT 
  r.room_id,
  r.room_number,
  h.hostel_name,
  r.capacity,
  COUNT(ra.student_id) as occupied,
  r.capacity - COUNT(ra.student_id) as available
FROM rooms r
LEFT JOIN room_allocations ra ON r.room_id = ra.room_id
LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
GROUP BY r.room_id
ORDER BY h.hostel_name, r.room_number;
```

## Summary

All issues between admin and student room allocation/approval are now fixed:
- ✅ Room change requests work correctly
- ✅ Approvals update room occupancy accurately
- ✅ Admin page shows correct occupied room counts
- ✅ Duplicate allocations prevented
- ✅ Comprehensive logging for debugging
