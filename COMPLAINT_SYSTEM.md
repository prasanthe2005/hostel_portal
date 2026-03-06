# Complaint Management System

## Overview
The Hostel Management System now includes a complete complaint management module that allows students to report issues (electrical, plumbing, maintenance, etc.) and caretakers to manage and resolve these complaints.

## Features

### For Students:
- ✅ Submit complaints with type and detailed description
- ✅ View all their submitted complaints
- ✅ Track complaint status (Pending → In Progress → Resolved)
- ✅ Filter complaints by status
- ✅ Automatic forwarding to hostel caretaker

### For Caretakers:
- ✅ Dedicated caretaker login portal
- ✅ Dashboard with complaint statistics
- ✅ View all complaints from their assigned hostel
- ✅ Update complaint status
- ✅ Filter complaints by status
- ✅ View student contact information

## Database Tables

### `complaints` table:
- `complaint_id` (INT, Primary Key)
- `student_id` (BIGINT, Foreign Key to students)
- `room_id` (BIGINT, Foreign Key to rooms)
- `complaint_type` (VARCHAR) - e.g., "Electrical Issue", "Plumbing Issue"
- `description` (TEXT) - Detailed description of the issue
- `status` (ENUM: 'Pending', 'In Progress', 'Resolved')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `caretakers` table:
- `caretaker_id` (INT, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR) - Hashed
- `phone` (VARCHAR)
- `hostel_id` (BIGINT, Foreign Key to hostels) - Optional, null = all hostels
- `created_at` (TIMESTAMP)

## API Endpoints

### Student APIs:
- **POST** `/api/complaints/submit` - Submit a new complaint
- **GET** `/api/complaints/my-complaints` - Get student's complaints

### Caretaker APIs:
- **POST** `/api/caretaker/login` - Caretaker login
- **GET** `/api/caretaker/dashboard` - Get dashboard with statistics
- **GET** `/api/caretaker/complaints` - Get hostel complaints

### Admin/Caretaker APIs:
- **GET** `/api/complaints/all` - Get all complaints
- **PUT** `/api/complaints/:complaint_id/status` - Update complaint status

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
