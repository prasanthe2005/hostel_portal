# Database Migration: Add Phone Column

This migration adds a `phone` column to the `students` table to store student phone numbers during registration.

## What Changed

### Database Schema
- Added `phone VARCHAR(20)` column to `students` table
- Position: After `department` column

### Updated Files
1. **Backend**:
   - `/server/db/schema.sql` - Updated schema with phone column
   - `/server/src/controllers/authController.js` - Register and login now handle phone
   - `/server/src/controllers/studentController.js` - Dashboard query includes phone
   - `/server/src/controllers/adminController.js` - Student listing includes phone

2. **Frontend**:
   - `/client/src/pages/auth/Register.jsx` - Added department dropdown and captures phone
   - `/client/src/student/StudentDashboard.jsx` - Displays phone number
   - `/client/src/admin/ManageStudents.jsx` - Shows phone in student tables

## How to Run Migration

### Option 1: Using Node.js Script (Recommended)
```bash
cd server
node scripts/migrate-add-phone.js
```

### Option 2: Using MySQL Command
```bash
cd server
mysql -u root -p < db/migrations/add_phone_to_students.sql
```

### Option 3: Manual MySQL
```sql
USE hostel_db;
ALTER TABLE students ADD COLUMN phone VARCHAR(20) AFTER department;
```

## Verify Migration

Check if the column was added:
```sql
USE hostel_db;
DESCRIBE students;
```

You should see:
```
+---------------+--------------+------+-----+-------------------+
| Field         | Type         | Null | Key | Default           |
+---------------+--------------+------+-----+-------------------+
| student_id    | bigint       | NO   | PRI | NULL              |
| name          | varchar(100) | NO   |     | NULL              |
| email         | varchar(150) | YES  | UNI | NULL              |
| password_hash | varchar(255) | YES  |     | NULL              |
| roll_number   | varchar(50)  | YES  |     | NULL              |
| department    | varchar(100) | YES  |     | NULL              |
| phone         | varchar(20)  | YES  |     | NULL              | <-- NEW
| created_at    | timestamp    | YES  |     | CURRENT_TIMESTAMP |
+---------------+--------------+------+-----+-------------------+
```

## Impact on Existing Data

- Existing student records will have `phone` = NULL
- New registrations will include phone number
- No data is lost during migration

## Testing

1. Run migration
2. Start server: `cd server && npm start`
3. Register new student with phone number
4. Login as student and verify phone shows in dashboard
5. Login as admin and verify phone shows in student list
