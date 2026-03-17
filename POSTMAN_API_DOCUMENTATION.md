# Hostel Management System - API Documentation

## Base URL
```
http://localhost:4000
```

## Authentication
This API uses **JWT (JSON Web Token)** based authentication. After login, you'll receive a token that must be included in subsequent requests.

### How to Use Token in Postman:
1. Login to get your token
2. Copy the token from the response
3. For protected routes, add to Headers:
   - **Key**: `Authorization`
   - **Value**: `Bearer YOUR_TOKEN_HERE`

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔓 PUBLIC ENDPOINTS (No Authentication Required)

### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "ok": true
}
```

### 2. Get Public Rooms List
```http
GET /api/rooms
```
**Response:**
```json
[
  {
    "room_id": 1,
    "hostel_id": 1,
    "room_number": "101",
    "capacity": 2,
    "room_type": "AC",
    "occupied": 1,
    "hostel_name": "Hostel A"
  }
]
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### 3. Student Registration
```http
POST /api/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "roll_number": "CS2024001",
  "year": 2,
  "department": "Computer Science",
  "address": "123 Main St",
  "phone": "1234567890",
  "parent_contact": "9876543210",
  "gender": "Male",
  "residence_type": "Hosteller",
  "preferred_room_type": "AC"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "student_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "roll_number": "CS2024001",
    "year": 2,
    "department": "Computer Science",
    "address": "123 Main St",
    "phone": "1234567890",
    "parent_contact": "9876543210",
    "gender": "Male",
    "residence_type": "Hosteller",
    "preferred_room_type": "AC",
    "allocation_status": "Pending"
  }
}
```

### 4. Login (Admin/Student)
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
**Response (Admin):**
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
**Response (Student):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "student_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "roll_number": "CS2024001",
    "allocation_status": "Pending"
  }
}
```

### 5. Caretaker Login
```http
POST /api/caretaker/login
```
**Request Body:**
```json
{
  "email": "caretaker@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "caretaker_id": 1,
    "name": "Caretaker Name",
    "email": "caretaker@example.com",
    "role": "caretaker",
    "hostel_id": 1
  }
}
```

---

## 👨‍💼 ADMIN ENDPOINTS (Requires Admin Token)

**Header Required:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### HOSTEL MANAGEMENT

#### 6. Create Hostel
```http
POST /api/admin/hostels
```
**Request Body:**
```json
{
  "name": "Hostel A",
  "location": "North Campus",
  "capacity": 100
}
```

#### 7. List All Hostels
```http
GET /api/admin/hostels
```
**Response:**
```json
[
  {
    "hostel_id": 1,
    "name": "Hostel A",
    "location": "North Campus",
    "capacity": 100,
    "occupied": 45
  }
]
```

#### 8. Update Hostel
```http
PUT /api/admin/hostels/:hostel_id
```
**Request Body:**
```json
{
  "name": "Hostel A (Updated)",
  "location": "North Campus",
  "capacity": 120
}
```

#### 9. Delete Hostel
```http
DELETE /api/admin/hostels/:hostel_id
```

### ROOM MANAGEMENT

#### 10. Create Room
```http
POST /api/admin/rooms
```
**Request Body:**
```json
{
  "hostel_id": 1,
  "room_number": "101",
  "capacity": 2,
  "room_type": "AC"
}
```

#### 11. List All Rooms
```http
GET /api/admin/rooms
```
**Response:**
```json
[
  {
    "room_id": 1,
    "hostel_id": 1,
    "room_number": "101",
    "capacity": 2,
    "room_type": "AC",
    "occupied": 1,
    "hostel_name": "Hostel A"
  }
]
```

#### 12. Update Room
```http
PUT /api/admin/rooms/:room_id
```
**Request Body:**
```json
{
  "room_number": "102",
  "capacity": 3,
  "room_type": "Non-AC"
}
```

#### 13. Delete Room
```http
DELETE /api/admin/rooms/:room_id
```

### STUDENT MANAGEMENT

#### 14. List All Students
```http
GET /api/admin/students
```
**Response:**
```json
[
  {
    "student_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roll_number": "CS2024001",
    "year": 2,
    "department": "Computer Science",
    "allocation_status": "Allocated",
    "room_id": 1,
    "room_number": "101",
    "hostel_name": "Hostel A"
  }
]
```

### ROOM ALLOCATION

#### 15. Allocate Rooms (FCFS)
```http
POST /api/admin/allocate
```
**Response:**
```json
{
  "message": "Allocated X rooms"
}
```

#### 16. Allocate Room to Specific Student
```http
POST /api/admin/allocate-student
```
**Request Body:**
```json
{
  "student_id": 1,
  "room_id": 5
}
```

#### 17. Deallocate Room from Student
```http
POST /api/admin/deallocate
```
**Request Body:**
```json
{
  "student_id": 1
}
```

### ROOM CHANGE REQUESTS

#### 18. List Room Change Requests
```http
GET /api/admin/requests
```
**Response:**
```json
[
  {
    "request_id": 1,
    "student_id": 1,
    "student_name": "John Doe",
    "from_room": "101",
    "to_room": "201",
    "reason": "Health issues",
    "status": "pending",
    "created_at": "2026-03-09T10:00:00.000Z"
  }
]
```

#### 19. Handle Room Change Request
```http
POST /api/admin/requests/:id
```
**Request Body:**
```json
{
  "action": "approve"
}
```
or
```json
{
  "action": "reject"
}
```

### CARETAKER MANAGEMENT

#### 20. Create Caretaker
```http
POST /api/admin/caretakers
```
**Request Body:**
```json
{
  "name": "Caretaker Name",
  "email": "caretaker@example.com",
  "password": "password123",
  "phone": "1234567890",
  "hostel_id": 1
}
```

#### 21. List All Caretakers
```http
GET /api/admin/caretakers
```
**Response:**
```json
[
  {
    "caretaker_id": 1,
    "name": "Caretaker Name",
    "email": "caretaker@example.com",
    "phone": "1234567890",
    "hostel_id": 1,
    "hostel_name": "Hostel A"
  }
]
```

#### 22. Update Caretaker
```http
PUT /api/admin/caretakers/:caretaker_id
```
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "9876543210",
  "hostel_id": 2
}
```

#### 23. Delete Caretaker
```http
DELETE /api/admin/caretakers/:caretaker_id
```

### ADMIN COMPLAINT MANAGEMENT

#### 24. Get All Complaints
```http
GET /api/admin/complaints
```
**Response:**
```json
[
  {
    "complaint_id": 1,
    "student_id": 1,
    "student_name": "John Doe",
    "category": "Maintenance",
    "description": "Broken AC",
    "status": "pending",
    "priority": "high",
    "created_at": "2026-03-09T10:00:00.000Z"
  }
]
```

#### 25. Get Complaints Statistics
```http
GET /api/admin/complaints/stats
```
**Response:**
```json
{
  "total_complaints": 50,
  "pending": 20,
  "in_progress": 15,
  "resolved": 10,
  "closed": 5
}
```

#### 26. Update Complaint Status (Admin)
```http
PUT /api/admin/complaints/:complaint_id/status
```
**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Working on it"
}
```

---

## 🎓 STUDENT ENDPOINTS (Requires Student Token)

**Header Required:**
```
Authorization: Bearer YOUR_STUDENT_TOKEN
```

#### 27. Get Student Dashboard
```http
GET /api/student/dashboard
```
**Response:**
```json
{
  "student": {
    "student_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roll_number": "CS2024001",
    "year": 2,
    "department": "Computer Science",
    "allocation_status": "Allocated",
    "room_number": "101",
    "hostel_name": "Hostel A",
    "room_type": "AC"
  },
  "roomChangeRequests": [
    {
      "request_id": 1,
      "from_room": "101",
      "to_room": "201",
      "status": "pending",
      "created_at": "2026-03-09T10:00:00.000Z"
    }
  ]
}
```

#### 28. Request Room Change
```http
POST /api/student/request
```
**Request Body:**
```json
{
  "to_room_id": 5,
  "reason": "Health issues - need ground floor"
}
```

#### 29. Submit Complaint
```http
POST /api/complaints/submit
```
**Request Body:**
```json
{
  "category": "Maintenance",
  "description": "AC not working in room 101",
  "priority": "high"
}
```

#### 30. Get My Complaints
```http
GET /api/complaints/my-complaints
```
**Response:**
```json
[
  {
    "complaint_id": 1,
    "category": "Maintenance",
    "description": "AC not working",
    "status": "pending",
    "priority": "high",
    "created_at": "2026-03-09T10:00:00.000Z",
    "caretaker_notes": null
  }
]
```

#### 31. Confirm Complaint Resolution
```http
PUT /api/complaints/:complaint_id/confirm
```
**Request Body:**
```json
{
  "feedback": "Issue resolved, thank you!"
}
```

#### 32. Reject Complaint Resolution
```http
PUT /api/complaints/:complaint_id/reject
```
**Request Body:**
```json
{
  "reason": "Issue still persists"
}
```

---

## 🛠️ CARETAKER ENDPOINTS (Requires Caretaker Token)

**Header Required:**
```
Authorization: Bearer YOUR_CARETAKER_TOKEN
```

#### 33. Get Caretaker Dashboard
```http
GET /api/caretaker/dashboard
```
**Response:**
```json
{
  "caretaker": {
    "caretaker_id": 1,
    "name": "Caretaker Name",
    "email": "caretaker@example.com",
    "hostel_id": 1,
    "hostel_name": "Hostel A"
  },
  "stats": {
    "total_complaints": 25,
    "pending": 10,
    "in_progress": 8,
    "resolved": 7
  }
}
```

#### 34. Get Hostel Complaints
```http
GET /api/caretaker/complaints
```
**Response:**
```json
[
  {
    "complaint_id": 1,
    "student_id": 1,
    "student_name": "John Doe",
    "room_number": "101",
    "category": "Maintenance",
    "description": "AC not working",
    "status": "pending",
    "priority": "high",
    "created_at": "2026-03-09T10:00:00.000Z"
  }
]
```

#### 35. Update Complaint Status (Caretaker)
```http
PUT /api/caretaker/complaints/:complaint_id/status
```
**Request Body:**
```json
{
  "status": "resolved",
  "notes": "AC repaired and tested"
}
```

---

## 🔍 TOKEN STRUCTURE

When you receive a token, it contains encoded information:

**Token Payload (Admin):**
```json
{
  "admin_id": 1,
  "role": "admin",
  "name": "Admin Name",
  "iat": 1678345678,
  "exp": 1678374478
}
```

**Token Payload (Student):**
```json
{
  "student_id": 1,
  "role": "student",
  "name": "John Doe",
  "iat": 1678345678,
  "exp": 1678374478
}
```

**Token Payload (Caretaker):**
```json
{
  "caretaker_id": 1,
  "role": "caretaker",
  "name": "Caretaker Name",
  "iat": 1678345678,
  "exp": 1678374478
}
```

**Token Expiry:** 8 hours from login

---

## 🧪 TESTING WORKFLOW IN POSTMAN

### Step 1: Login as Admin
```http
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```
**Copy the token from response**

### Step 2: Set Environment Variable
In Postman:
1. Create an Environment called "Hostel API"
2. Add variable: `admin_token` with the token value
3. Add variable: `student_token` for student login
4. Add variable: `caretaker_token` for caretaker login

### Step 3: Use Token in Requests
For any protected endpoint, add to Headers:
```
Authorization: Bearer {{admin_token}}
```

### Step 4: Test Each Role
- Login as Admin → Test admin endpoints
- Login as Student → Test student endpoints  
- Login as Caretaker → Test caretaker endpoints

---

## ⚠️ ERROR RESPONSES

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Cause:** No token provided or invalid token format

### 403 Forbidden
```json
{
  "error": "Forbidden - Invalid role"
}
```
**Cause:** Token is valid but role doesn't match required role

### 400 Bad Request
```json
{
  "error": "Invalid credentials"
}
```
**Cause:** Wrong email/password combination

### 500 Internal Server Error
```json
{
  "error": "Database error message"
}
```
**Cause:** Server-side error

---

## 📝 NOTES

1. **Token Validation**: The server checks the `Authorization` header for all protected routes
2. **Role-Based Access**: Each endpoint requires a specific role (admin, student, or caretaker)
3. **Token Format**: Must be `Bearer YOUR_TOKEN` (note the space after Bearer)
4. **Token Verification**: Server uses JWT_SECRET from .env file to verify tokens
5. **Session Management**: Students' current_token is stored in database and updated on login

---

## 🚀 QUICK START GUIDE

### Create Admin User (Run Script)
```bash
cd server
node src/createAdmin.js
```

### Create Student User
```http
POST /api/auth/register
{
  "name": "Test Student",
  "email": "student@test.com",
  "password": "password123"
}
```

### Login
```http
POST /api/auth/login
{
  "email": "student@test.com",
  "password": "password123"
}
```

### Use Token
Copy the token and add to all subsequent requests:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📦 POSTMAN COLLECTION STRUCTURE

```
Hostel Management API
├── 🔓 Public
│   ├── Health Check
│   └── Get Public Rooms
├── 🔐 Authentication
│   ├── Register Student
│   ├── Login (Admin/Student)
│   └── Caretaker Login
├── 👨‍💼 Admin
│   ├── Hostel Management (Create, List, Update, Delete)
│   ├── Room Management (Create, List, Update, Delete)
│   ├── Student Management (List)
│   ├── Room Allocation (Allocate, Deallocate)
│   ├── Requests (List, Approve/Reject)
│   ├── Caretaker Management (Create, List, Update, Delete)
│   └── Complaints (List, Stats, Update Status)
├── 🎓 Student
│   ├── Dashboard
│   ├── Request Room Change
│   ├── Submit Complaint
│   ├── Get My Complaints
│   ├── Confirm Resolution
│   └── Reject Resolution
└── 🛠️ Caretaker
    ├── Dashboard
    ├── Get Hostel Complaints
    └── Update Complaint Status
```

---

**Server Port:** 4000  
**Token Expiry:** 8 hours  
**Authentication Method:** JWT Bearer Token
