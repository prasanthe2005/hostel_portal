# Complaint Management System

## Overview
The Hostel Management System includes a complete complaint management workflow that allows students to report issues, caretakers to manage and resolve them, and includes a student confirmation system with escalation support.

## Features

### For Students:
- ✅ Submit complaints with type and detailed description
- ✅ View all their submitted complaints
- ✅ Track complaint status through the entire workflow
- ✅ **Confirm or reject resolution** when caretaker marks issue as resolved
- ✅ **YES/NO confirmation buttons** for resolved issues
- ✅ Filter complaints by status (Pending, In Progress, Resolved, Reopened, Escalated, Completed)
- ✅ Automatic forwarding to hostel caretaker

### For Caretakers:
- ✅ Dedicated caretaker login portal
- ✅ Dashboard with comprehensive complaint statistics
- ✅ View all complaints from their assigned hostel
- ✅ Update complaint status with multiple options:
  - **Pending** - Initial state
  - **In Progress** - Currently working on the issue
  - **Resolved** - Issue fixed, awaiting student confirmation
  - **Escalated** - Cannot resolve, escalated to admin
- ✅ See reopened complaints that need attention
- ✅ Filter complaints by status
- ✅ View student contact information

### For Admin:
- ✅ Monitor all complaints across all hostels
- ✅ View statistics: total, pending, in progress, resolved, completed, escalated
- ✅ Handle escalated issues that caretakers cannot resolve

## Complete Workflow

### Student Workflow:
1. **Submit Complaint** → Status: **Pending**
2. Wait for caretaker to work on it
3. When status changes to **Resolved**, student sees YES/NO confirmation:
   - **YES (Satisfied)** → Status: **Completed** ✅
   - **NO (Not Fixed)** → Status: **Reopened** 🔄

### Caretaker Workflow:
1. View complaint in dashboard (Status: **Pending**)
2. Mark as **In Progress** when starting work
3. Mark as **Resolved** when fixed
4. OR mark as **Escalated** if cannot resolve
5. If student clicks NO, issue becomes **Reopened** - work on it again

### Status Flow Diagram:
```
Student Submits → Pending
                    ↓
        Caretaker → In Progress
                    ↓
              Two Options:
        ┌──────────┴──────────┐
        ↓                     ↓
    Resolved              Escalated
        ↓                (To Admin)
Student Confirmation
    ↙       ↘
   YES       NO
    ↓         ↓
Completed  Reopened
            ↓
    (Back to Caretaker)
```

## Database Schema

### `complaints` table:
- `complaint_id` (INT, Primary Key)
- `student_id` (BIGINT, Foreign Key to students)
- `room_id` (BIGINT, Foreign Key to rooms)
- `complaint_type` (VARCHAR) - e.g., "Electrical Issue", "Plumbing Issue"
- `description` (TEXT) - Detailed description of the issue
- `status` (ENUM: **'Pending', 'In Progress', 'Resolved', 'Completed', 'Escalated', 'Reopened'**)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Status Definitions:
- **Pending**: Initial state when student submits complaint
- **In Progress**: Caretaker is actively working on the issue
- **Resolved**: Caretaker has fixed the issue, awaiting student confirmation
- **Completed**: Student confirmed the issue is fixed (satisfied)
- **Escalated**: Caretaker cannot resolve, escalated to admin
- **Reopened**: Student rejected the resolution (not satisfied), needs rework

## API Endpoints

### Student APIs:
- **POST** `/api/complaints/submit` - Submit a new complaint
- **GET** `/api/complaints/my-complaints` - Get student's complaints
- **PUT** `/api/complaints/:complaint_id/confirm` - Confirm resolution (YES - Satisfied)
- **PUT** `/api/complaints/:complaint_id/reject` - Reject resolution (NO - Not Fixed)

### Caretaker APIs:
- **POST** `/api/caretaker/login` - Caretaker login
- **GET** `/api/caretaker/dashboard` - Get dashboard with statistics
- **GET** `/api/caretaker/complaints` - Get hostel complaints
- **PUT** `/api/complaints/:complaint_id/status` - Update complaint status
  - Valid statuses: 'Pending', 'In Progress', 'Resolved', 'Escalated'

### Admin APIs:
- **GET** `/api/admin/complaints` - Get all complaints across all hostels
- **PUT** `/api/admin/complaints/:complaint_id/status` - Update any complaint status

## Setup Instructions

### 1. Create a Caretaker Account

```bash
cd server
npm run create-caretaker
```

Follow the prompts to create a caretaker account:
- Name: John Doe
- Email: caretaker@hostel.com
- Password: (your password)
- Phone: 1234567890
- Hostel ID: 1 (or leave blank for all hostels)

### 2. Start the Server

```bash
cd server
npm start
```

Server will run on `http://localhost:5000`

### 3. Start the Client

```bash
cd client
npm run dev
```

Client will run on `http://localhost:5173`

## Usage Guide

### Student Workflow:

1. **Login** as a student at `/login`
2. **Submit a Complaint:**
   - Click "Submit Complaint" button on dashboard
   - Or navigate to `/student/submit-complaint`
   - Select complaint type
   - Enter detailed description
   - Submit

3. **View Complaints:**
   - Click "My Complaints" in navigation
   - Or navigate to `/student/complaints`
   - Filter by status (All, Pending, In Progress, Resolved)
   - View complaint details and status updates

### Caretaker Workflow:

1. **Login** at `/caretaker/login` with caretaker credentials
2. **View Dashboard:**
   - See complaint statistics (Total, Pending, In Progress, Resolved)
   - View all complaints from assigned hostel
   - Filter complaints by status

3. **Manage Complaints:**
   - Click "Mark In Progress" to start working on a complaint
   - Click "Mark Resolved" when issue is fixed
   - View student contact information for follow-up

## File Structure

### Backend:
```
server/src/
├── controllers/
│   ├── complaintController.js    # Complaint management logic
│   └── caretakerController.js    # Caretaker operations
├── routes/
│   ├── complaint.js              # Complaint routes
│   └── caretaker.js              # Caretaker routes
├── services/
└── createCaretaker.js            # Script to create caretaker accounts
```

### Frontend:
```
client/src/
├── pages/
│   ├── student/
│   │   ├── SubmitComplaint.jsx  # Submit complaint form
│   │   └── MyComplaints.jsx      # View student's complaints
│   └── auth/
│       └── CaretakerLogin.jsx    # Caretaker login page
├── caretaker/
│   └── CaretakerDashboard.jsx    # Caretaker dashboard
└── services/
    ├── complaint.service.js      # Complaint API calls
    └── caretaker.service.js      # Caretaker API calls
```

## Complaint Types

Pre-defined complaint types:
- Electrical Issue
- Plumbing Issue
- Furniture Damage
- Cleanliness
- AC/Heating Problem
- Internet/Wi-Fi Issue
- Security Concern
- Other

## Status Flow

```
Pending → In Progress → Resolved
```

- **Pending**: Complaint submitted, awaiting caretaker action
- **In Progress**: Caretaker is working on the issue
- **Resolved**: Issue has been fixed

## Testing

### Create Test Data:

1. **Create a caretaker:**
   ```bash
   npm run create-caretaker
   ```

2. **Create a student** (if not exists):
   ```bash
   npm run create-student
   ```

3.** Login as student** and submit complaints

4. **Login as caretaker** and manage complaints

## Security

- ✅ All endpoints require JWT authentication
- ✅ Students can only view their own complaints
- ✅ Caretakers can only view complaints from their assigned hostel
- ✅ Passwords are hashed using bcrypt
- ✅ Role-based access control (student/caretaker/admin)

## Notes

- Complaints are automatically linked to student's currently allocated room
- Students without room allocation can still submit complaints
- Caretakers with `hostel_id = null` can view complaints from all hostels
- All timestamps are automatically managed
- Complaint descriptions support detailed information for better issue resolution

## Troubleshooting

### Students cannot submit complaints:
- Ensure student is authenticated (logged in)
- Check if student has a valid token
- Verify room allocation exists

### Caretaker cannot login:
- Verify caretaker account exists in database
- Check email and password are correct
- Ensure JWT_SECRET is configured in `.env`

### Complaints not showing:
- Check database connection
- Verify foreign key relationships are correct
- Check browser console for errors

## Future Enhancements

Potential improvements:
- Email notifications when complaint status changes
- Complaint priority levels (Low, Medium, High, Urgent)
- Add photos/attachments to complaints
- Complaint resolution notes/comments
- Complaint analytics and reports
- Mobile app support
