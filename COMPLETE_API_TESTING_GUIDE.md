# Complete API Testing Guide with Expected Responses

## 🚀 Server Configuration
- **Base URL:** `http://localhost:5000` (from your .env)
- **Authentication:** JWT Token in `Authorization: Bearer TOKEN` header

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. Student Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Arun Kumar",
  "email": "arun@gmail.com",
  "password": "123456",
  "roll_number": "21CS101",
  "year": 3,
  "department": "CSE",
  "address": "Chennai",
  "phone": "9876543210",
  "parent_contact": "9876543211",
  "gender": "Male",
  "residence_type": "Hosteller",
  "preferred_room_type": "Non-AC"
}
```

**✅ Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHVkZW50X2lkIjoxLCJyb2xlIjoic3R1ZGVudCIsIm5hbWUiOiJBcnVuIEt1bWFyIiwiaWF0IjoxNzA5OTcwMDAwLCJleHAiOjE3MDk5OTg4MDB9.signature",
  "user": {
    "student_id": 1,
    "name": "Arun Kumar",
    "email": "arun@gmail.com",
    "role": "student",
    "roll_number": "21CS101",
    "year": 3,
    "department": "CSE",
    "address": "Chennai",
    "phone": "9876543210",
    "parent_contact": "9876543211",
    "gender": "Male",
    "residence_type": "Hosteller",
    "preferred_room_type": "Non-AC",
    "allocation_status": "Pending"
  }
}
```

**❌ Error Responses:**
```json
// Missing fields
{ "error": "name, email, and password required" }

// Email already exists
{ "error": "Email already registered" }
```

---

### 2. Login (Admin/Student)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "arun@gmail.com",
  "password": "123456"
}
```

**✅ Success Response - Student (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "student_id": 1,
    "name": "Arun Kumar",
    "email": "arun@gmail.com",
    "role": "student",
    "roll_number": "21CS101",
    "year": 3,
    "department": "CSE",
    "address": "Chennai",
    "phone": "9876543210",
    "parent_contact": "9876543211",
    "gender": "Male",
    "residence_type": "Hosteller",
    "preferred_room_type": "Non-AC",
    "allocation_status": "Pending"
  }
}
```

**✅ Success Response - Admin (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "admin_id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**❌ Error Responses:**
```json
// Invalid credentials
{ "error": "Invalid credentials" }

// Missing fields
{ "error": "email,password required" }
```

---

### 3. Caretaker Login
```http
POST /api/caretaker/login
Content-Type: application/json

{
  "email": "caretaker@example.com",
  "password": "password123"
}
```

**✅ Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "caretaker_id": 1,
    "name": "Caretaker Name",
    "email": "caretaker@example.com",
    "phone": "1234567890",
    "hostel_id": 1,
    "role": "caretaker"
  }
}
```

---

## 👨‍💼 ADMIN - HOSTEL MANAGEMENT

### 4. Create Hostel
```http
POST /api/admin/hostels
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "hostel_name": "Tech Hostel",
  "location": "North Campus",
  "floors": [
    { "rooms": 10, "type": "AC" },
    { "rooms": 15, "type": "Non-AC" }
  ],
  "icon": "building",
  "bg_color": "bg-blue-50",
  "text_color": "text-blue-600"
}
```

**✅ Success Response (200 OK):**
```json
{
  "hostel_id": 1,
  "hostel_name": "Tech Hostel",
  "location": "North Campus",
  "total_floors": 2,
  "total_rooms": 25,
  "icon": "building",
  "bg_color": "bg-blue-50",
  "text_color": "text-blue-600",
  "created_at": "2026-03-09T10:00:00.000Z"
}
```

---

### 5. List All Hostels
```http
GET /api/admin/hostels
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
[
  {
    "hostel_id": 1,
    "hostel_name": "Tech Hostel",
    "location": "North Campus",
    "total_floors": 2,
    "total_rooms": 25,
    "rooms_count": 25,
    "occupied_count": 10,
    "occupancy": 40,
    "icon": "building",
    "bg_color": "bg-blue-50",
    "text_color": "text-blue-600",
    "created_at": "2026-03-09T10:00:00.000Z"
  }
]
```

---

### 6. Update Hostel
```http
PUT /api/admin/hostels/1
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "hostel_name": "Tech Hostel Updated",
  "location": "South Campus",
  "icon": "home",
  "bg_color": "bg-green-50",
  "text_color": "text-green-600"
}
```

**✅ Success Response (200 OK):**
```json
{
  "hostel_id": 1,
  "hostel_name": "Tech Hostel Updated",
  "location": "South Campus",
  "total_floors": 2,
  "total_rooms": 25,
  "icon": "home",
  "bg_color": "bg-green-50",
  "text_color": "text-green-600",
  "created_at": "2026-03-09T10:00:00.000Z"
}
```

---

### 7. Delete Hostel
```http
DELETE /api/admin/hostels/1
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
{
  "message": "Hostel deleted successfully"
}
```

**❌ Error Response:**
```json
{
  "error": "Cannot delete hostel with allocated rooms. Deallocate students first."
}
```

---

## 👨‍💼 ADMIN - ROOM MANAGEMENT

### 8. List All Rooms
```http
GET /api/admin/rooms
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
[
  {
    "room_id": 1,
    "room_number": "101",
    "type": "AC",
    "capacity": 2,
    "hostel_name": "Tech Hostel",
    "hostel_id": 1,
    "floor_number": 1,
    "assigned": 1,
    "status": "available"
  },
  {
    "room_id": 2,
    "room_number": "102",
    "type": "Non-AC",
    "capacity": 4,
    "hostel_name": "Tech Hostel",
    "hostel_id": 1,
    "floor_number": 1,
    "assigned": 4,
    "status": "occupied"
  }
]
```

---

### 9. Create Room
```http
POST /api/admin/rooms
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "hostel_id": 1,
  "floor_id": 1,
  "room_number": "301",
  "type": "AC",
  "capacity": 2
}
```

**✅ Success Response (200 OK):**
```json
{
  "room_id": 15,
  "hostel_id": 1,
  "floor_id": 1,
  "room_number": "301",
  "type": "AC",
  "capacity": 2,
  "created_at": "2026-03-09T10:00:00.000Z"
}
```

---

### 10. Update Room
```http
PUT /api/admin/rooms/1
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "room_number": "102",
  "type": "Non-AC",
  "capacity": 4
}
```

**✅ Success Response (200 OK):**
```json
{
  "room_id": 1,
  "hostel_id": 1,
  "floor_id": 1,
  "room_number": "102",
  "type": "Non-AC",
  "capacity": 4,
  "created_at": "2026-03-09T10:00:00.000Z"
}
```

**❌ Error Response:**
```json
{
  "error": "Cannot convert room type when students are already assigned. Please deallocate students first."
}
```

---

### 11. Delete Room
```http
DELETE /api/admin/rooms/1
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
{
  "message": "Room deleted successfully"
}
```

**❌ Error Response:**
```json
{
  "error": "Cannot delete room with students allocated. Deallocate students first."
}
```

---

## 👨‍💼 ADMIN - STUDENT MANAGEMENT

### 12. List All Students
```http
GET /api/admin/students
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
[
  {
    "student_id": 1,
    "name": "Arun Kumar",
    "email": "arun@gmail.com",
    "roll_number": "21CS101",
    "year": 3,
    "department": "CSE",
    "address": "Chennai",
    "phone": "9876543210",
    "parent_contact": "9876543211",
    "gender": "Male",
    "residence_type": "Hosteller",
    "preferred_room_type": "Non-AC",
    "allocation_status": "Allocated",
    "hostel_name": "Tech Hostel",
    "room_number": "101",
    "room_type": "Non-AC",
    "created_at": "2026-03-09T09:00:00.000Z",
    "last_login": "2026-03-09T10:30:00.000Z"
  }
]
```

---

## 👨‍💼 ADMIN - ROOM ALLOCATION

### 13. Auto-Allocate Rooms (FCFS)
```http
POST /api/admin/allocate
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
{
  "message": "Allocation complete. AC: 5 students allocated, Non-AC: 12 students allocated. Total: 17 allocated."
}
```

---

### 14. Allocate Room to Specific Student
```http
POST /api/admin/allocate-student
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "student_id": 1,
  "room_id": 5
}
```

**✅ Success Response (200 OK):**
```json
{
  "allocation_id": 1,
  "student_id": 1,
  "room_id": 5,
  "allocated_at": "2026-03-09T10:00:00.000Z"
}
```

**❌ Error Responses:**
```json
// Room full
{ "error": "Room is already at full capacity" }

// Student already allocated
{ "error": "Student is already allocated to a room" }

// Type mismatch
{ "error": "Room type mismatch. Student prefers AC but room is Non-AC" }
```

---

### 15. Deallocate Room
```http
POST /api/admin/deallocate
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "student_id": 1
}
```

**✅ Success Response (200 OK):**
```json
{
  "message": "Student deallocated successfully"
}
```

---

## 👨‍💼 ADMIN - ROOM CHANGE REQUESTS

### 16. List Room Change Requests
```http
GET /api/admin/requests
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
[
  {
    "request_id": 1,
    "student_id": 1,
    "student_name": "Arun Kumar",
    "roll_number": "21CS101",
    "current_room": "101",
    "choice1": 5,
    "choice2": 6,
    "choice3": 7,
    "reason": "Health issues - need ground floor",
    "status": "pending",
    "created_at": "2026-03-09T10:00:00.000Z"
  }
]
```

---

### 17. Approve/Reject Room Change Request
```http
POST /api/admin/requests/1
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "action": "approve"  // or "reject"
}
```

**✅ Success Response (200 OK):**
```json
{
  "message": "Request approved and room changed successfully"
}
```

---

## 👨‍💼 ADMIN - CARETAKER MANAGEMENT

### 18. Create Caretaker
```http
POST /api/admin/caretakers
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "John Caretaker",
  "email": "john@hostel.com",
  "password": "password123",
  "phone": "9876543210",
  "hostel_id": 1
}
```

**✅ Success Response (201 Created):**
```json
{
  "caretaker": {
    "caretaker_id": 1,
    "name": "John Caretaker",
    "email": "john@hostel.com",
    "phone": "9876543210",
    "hostel_id": 1,
    "hostel_name": "Tech Hostel",
    "created_at": "2026-03-09T10:00:00.000Z"
  },
  "credentials": {
    "email": "john@hostel.com",
    "password": "password123"
  }
}
```

---

### 19. List All Caretakers
```http
GET /api/admin/caretakers
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
[
  {
    "caretaker_id": 1,
    "name": "John Caretaker",
    "email": "john@hostel.com",
    "phone": "9876543210",
    "hostel_id": 1,
    "hostel_name": "Tech Hostel",
    "total_complaints": 25,
    "pending_complaints": 10,
    "in_progress_complaints": 8,
    "resolved_complaints": 5,
    "completed_complaints": 2,
    "reopened_complaints": 0,
    "created_at": "2026-03-09T10:00:00.000Z"
  }
]
```

---

### 20. Update Caretaker
```http
PUT /api/admin/caretakers/1
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "1234567890",
  "hostel_id": 2
}
```

**✅ Success Response (200 OK):**
```json
{
  "caretaker_id": 1,
  "name": "John Updated",
  "email": "john@hostel.com",
  "phone": "1234567890",
  "hostel_id": 2,
  "hostel_name": "Science Hostel",
  "created_at": "2026-03-09T10:00:00.000Z"
}
```

---

### 21. Delete Caretaker
```http
DELETE /api/admin/caretakers/1
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
{
  "message": "Caretaker deleted successfully"
}
```

---

## 👨‍💼 ADMIN - COMPLAINTS

### 22. Get All Complaints
```http
GET /api/admin/complaints
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
[
  {
    "complaint_id": 1,
    "student_id": 1,
    "student_name": "Arun Kumar",
    "roll_number": "21CS101",
    "student_phone": "9876543210",
    "room_number": "101",
    "hostel_name": "Tech Hostel",
    "complaint_type": "Maintenance",
    "description": "AC not working properly",
    "status": "Pending",
    "created_at": "2026-03-09T10:00:00.000Z",
    "updated_at": "2026-03-09T10:00:00.000Z"
  }
]
```

---

### 23. Get Complaints Statistics
```http
GET /api/admin/complaints/stats
Authorization: Bearer ADMIN_TOKEN
```

**✅ Success Response (200 OK):**
```json
{
  "total": 50,
  "pending": 15,
  "in_progress": 20,
  "resolved": 15
}
```

---

### 24. Update Complaint Status (Admin)
```http
PUT /api/admin/complaints/1/status
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "status": "In Progress"
}
```

**✅ Success Response (200 OK):**
```json
{
  "complaint_id": 1,
  "student_id": 1,
  "student_name": "Arun Kumar",
  "roll_number": "21CS101",
  "room_number": "101",
  "hostel_name": "Tech Hostel",
  "complaint_type": "Maintenance",
  "description": "AC not working properly",
  "status": "In Progress",
  "created_at": "2026-03-09T10:00:00.000Z",
  "updated_at": "2026-03-09T11:00:00.000Z"
}
```

---

## 🎓 STUDENT ENDPOINTS

### 25. Get Student Dashboard
```http
GET /api/student/dashboard
Authorization: Bearer STUDENT_TOKEN
```

**✅ Success Response (200 OK):**
```json
{
  "student_id": 1,
  "name": "Arun Kumar",
  "email": "arun@gmail.com",
  "roll_number": "21CS101",
  "year": 3,
  "department": "CSE",
  "address": "Chennai",
  "phone": "9876543210",
  "parent_contact": "9876543211",
  "gender": "Male",
  "residence_type": "Hosteller",
  "preferred_room_type": "Non-AC",
  "allocation_status": "Allocated",
  "hostel_name": "Tech Hostel",
  "room_number": "101",
  "type": "Non-AC",
  "floor_number": 1,
  "allocated_at": "2026-03-01T10:00:00.000Z",
  "has_pending_request": false,
  "created_at": "2026-02-15T09:00:00.000Z",
  "last_login": "2026-03-09T10:30:00.000Z"
}
```

---

### 26. Request Room Change
```http
POST /api/student/request
Authorization: Bearer STUDENT_TOKEN
Content-Type: application/json

{
  "choice1": 5,
  "choice2": 6,
  "choice3": 7,
  "reason": "Health issues - need ground floor room"
}
```

**✅ Success Response (200 OK):**
```json
{
  "request_id": 1,
  "message": "Room change request submitted successfully"
}
```

**❌ Error Responses:**
```json
// Already has pending request
{ "error": "You already have a pending room change request" }

// No choices provided
{ "error": "At least one choice required" }

// No reason provided
{ "error": "Reason is required" }
```

---

### 27. Submit Complaint
```http
POST /api/complaints/submit
Authorization: Bearer STUDENT_TOKEN
Content-Type: application/json

{
  "complaint_type": "Maintenance",
  "description": "AC not cooling properly, making strange noise"
}
```

**✅ Success Response (201 Created):**
```json
{
  "complaint_id": 1,
  "student_id": 1,
  "student_name": "Arun Kumar",
  "roll_number": "21CS101",
  "room_id": 1,
  "room_number": "101",
  "hostel_name": "Tech Hostel",
  "complaint_type": "Maintenance",
  "description": "AC not cooling properly, making strange noise",
  "status": "Pending",
  "created_at": "2026-03-09T10:00:00.000Z",
  "updated_at": "2026-03-09T10:00:00.000Z"
}
```

**❌ Error Responses:**
```json
// Not allocated a room
{ "error": "You must be allocated a room to submit complaints" }

// Missing fields
{ "error": "Complaint type and description are required" }
```

---

### 28. Get My Complaints
```http
GET /api/complaints/my-complaints
Authorization: Bearer STUDENT_TOKEN
```

**✅ Success Response (200 OK):**
```json
[
  {
    "complaint_id": 1,
    "student_id": 1,
    "room_id": 1,
    "room_number": "101",
    "hostel_name": "Tech Hostel",
    "complaint_type": "Maintenance",
    "description": "AC not cooling properly",
    "status": "In Progress",
    "created_at": "2026-03-09T10:00:00.000Z",
    "updated_at": "2026-03-09T11:00:00.000Z"
  },
  {
    "complaint_id": 2,
    "student_id": 1,
    "room_id": 1,
    "room_number": "101",
    "hostel_name": "Tech Hostel",
    "complaint_type": "Cleanliness",
    "description": "Bathroom needs cleaning",
    "status": "Resolved",
    "created_at": "2026-03-08T10:00:00.000Z",
    "updated_at": "2026-03-09T09:00:00.000Z"
  }
]
```

---

### 29. Confirm Resolution (Satisfied - YES)
```http
PUT /api/complaints/1/confirm
Authorization: Bearer STUDENT_TOKEN
```

**✅ Success Response (200 OK):**
```json
{
  "complaint_id": 1,
  "student_id": 1,
  "room_id": 1,
  "room_number": "101",
  "hostel_name": "Tech Hostel",
  "complaint_type": "Maintenance",
  "description": "AC not cooling properly",
  "status": "Completed",
  "created_at": "2026-03-09T10:00:00.000Z",
  "updated_at": "2026-03-09T15:00:00.000Z"
}
```

**❌ Error Responses:**
```json
// Not your complaint
{ "error": "Complaint not found or access denied" }

// Not in Resolved status
{ "error": "Complaint is not in Resolved status. Current status: Pending" }
```

---

### 30. Reject Resolution (Not Fixed - NO)
```http
PUT /api/complaints/1/reject
Authorization: Bearer STUDENT_TOKEN
```

**✅ Success Response (200 OK):**
```json
{
  "complaint_id": 1,
  "student_id": 1,
  "room_id": 1,
  "room_number": "101",
  "hostel_name": "Tech Hostel",
  "complaint_type": "Maintenance",
  "description": "AC not cooling properly",
  "status": "Reopened",
  "created_at": "2026-03-09T10:00:00.000Z",
  "updated_at": "2026-03-09T15:00:00.000Z"
}
```

---

## 🛠️ CARETAKER ENDPOINTS

### 31. Get Caretaker Dashboard
```http
GET /api/caretaker/dashboard
Authorization: Bearer CARETAKER_TOKEN
```

**✅ Success Response (200 OK):**
```json
{
  "caretaker": {
    "caretaker_id": 1,
    "name": "John Caretaker",
    "email": "john@hostel.com",
    "phone": "9876543210",
    "hostel_id": 1,
    "hostel_name": "Tech Hostel",
    "created_at": "2026-03-01T10:00:00.000Z"
  },
  "complaints": [
    {
      "complaint_id": 1,
      "student_id": 1,
      "student_name": "Arun Kumar",
      "roll_number": "21CS101",
      "student_phone": "9876543210",
      "room_number": "101",
      "hostel_name": "Tech Hostel",
      "complaint_type": "Maintenance",
      "description": "AC not working",
      "status": "Pending",
      "created_at": "2026-03-09T10:00:00.000Z"
    }
  ],
  "statistics": {
    "total_complaints": 25,
    "pending": 10,
    "in_progress": 8,
    "resolved": 5,
    "completed": 2,
    "reopened": 0
  }
}
```

---

### 32. Get Hostel Complaints
```http
GET /api/caretaker/complaints
Authorization: Bearer CARETAKER_TOKEN
```

**✅ Success Response (200 OK):**
```json
[
  {
    "complaint_id": 1,
    "student_id": 1,
    "student_name": "Arun Kumar",
    "roll_number": "21CS101",
    "student_phone": "9876543210",
    "room_number": "101",
    "hostel_name": "Tech Hostel",
    "complaint_type": "Maintenance",
    "description": "AC not working properly",
    "status": "Pending",
    "created_at": "2026-03-09T10:00:00.000Z",
    "updated_at": "2026-03-09T10:00:00.000Z"
  }
]
```

---

### 33. Update Complaint Status (Caretaker)
```http
PUT /api/caretaker/complaints/1/status
Authorization: Bearer CARETAKER_TOKEN
Content-Type: application/json

{
  "status": "Resolved"
}
```

**✅ Success Response (200 OK):**
```json
{
  "complaint_id": 1,
  "student_id": 1,
  "student_name": "Arun Kumar",
  "roll_number": "21CS101",
  "room_number": "101",
  "hostel_name": "Tech Hostel",
  "complaint_type": "Maintenance",
  "description": "AC not working properly",
  "status": "Resolved",
  "created_at": "2026-03-09T10:00:00.000Z",
  "updated_at": "2026-03-09T14:00:00.000Z"
}
```

**Valid Status Values:**
- `Pending`
- `In Progress`
- `Resolved`
- `Completed`
- `Escalated`
- `Reopened`

---

## 🔓 PUBLIC ENDPOINTS (No Auth Required)

### 34. Get Public Rooms List
```http
GET /api/rooms
```

**✅ Success Response (200 OK):**
```json
[
  {
    "room_id": 1,
    "room_number": "101",
    "type": "AC",
    "capacity": 2,
    "hostel_name": "Tech Hostel",
    "hostel_id": 1,
    "floor_number": 1,
    "assigned": 1,
    "status": "available"
  },
  {
    "room_id": 2,
    "room_number": "102",
    "type": "Non-AC",
    "capacity": 4,
    "hostel_name": "Tech Hostel",
    "hostel_id": 1,
    "floor_number": 1,
    "assigned": 4,
    "status": "occupied"
  }
]
```

---

### 35. Health Check
```http
GET /health
```

**✅ Success Response (200 OK):**
```json
{
  "ok": true
}
```

---

## 🧪 TESTING WORKFLOW IN POSTMAN

### Step 1: Test Public Endpoints
```
✓ GET /health
✓ GET /api/rooms
```

### Step 2: Create & Login Admin
```
1. Run: node src/createAdmin.js (in server folder)
2. POST /api/auth/login (with admin credentials)
3. Save admin token
```

### Step 3: Setup System
```
✓ POST /api/admin/hostels (create hostel)
✓ POST /api/admin/rooms (create rooms - auto-created with hostel)
✓ POST /api/admin/caretakers (create caretaker)
```

### Step 4: Register & Login Student
```
✓ POST /api/auth/register
✓ POST /api/auth/login
✓ Save student token
```

### Step 5: Test Student Features
```
✓ GET /api/student/dashboard
✓ POST /api/complaints/submit
✓ GET /api/complaints/my-complaints
```

### Step 6: Test Admin Features
```
✓ GET /api/admin/students
✓ POST /api/admin/allocate (allocate rooms)
✓ GET /api/admin/complaints
```

### Step 7: Test Caretaker Features
```
✓ POST /api/caretaker/login
✓ GET /api/caretaker/dashboard
✓ PUT /api/caretaker/complaints/:id/status
```

---

## 📝 POSTMAN TIPS

### Auto-Save Tokens
Add to Tests tab of login requests:
```javascript
const response = pm.response.json();
if (response.token) {
    if (response.user.role === 'admin') {
        pm.environment.set("admin_token", response.token);
    } else if (response.user.role === 'student') {
        pm.environment.set("student_token", response.token);
    } else if (response.user.role === 'caretaker') {
        pm.environment.set("caretaker_token", response.token);
    }
    console.log("✅ Token saved for", response.user.role);
}
```

### Use Environment Variables
```
{{base_url}}/api/auth/login
Authorization: Bearer {{student_token}}
```

### View Token Payload
Add to Tests:
```javascript
if (pm.response.json().token) {
    const token = pm.response.json().token;
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("Token Payload:", JSON.stringify(payload, null, 2));
}
```

---

## ⚠️ COMMON ERROR RESPONSES

### 401 Unauthorized
```json
{ "error": "Unauthorized" }
```
**Fix:** Add Authorization header or login again

### 403 Forbidden
```json
{ "error": "Forbidden - Invalid role" }
```
**Fix:** Use token for correct role (admin/student/caretaker)

### 404 Not Found
**Fix:** Check URL, make sure server is running on port 5000

### 500 Internal Server Error
```json
{ "error": "Database connection error" }
```
**Fix:** Check database connection, server logs

---

**Server URL:** `http://localhost:5000`  
**Token Expiry:** 8 hours (student/admin), 7 days (caretaker)  
**Server Running:** Check with `GET /health`
