# API Quick Reference - Token Authentication

## 🚀 Quick Start (3 Steps)

### Step 1: Start Server
```bash
cd server
npm run dev
```
Server runs on: `http://localhost:4000`

### Step 2: Login
```http
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "role": "student", "name": "John" }
}
```

### Step 3: Use Token
```http
GET http://localhost:4000/api/student/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔑 All Login Endpoints

| Role | Endpoint | Email | Default Password |
|------|----------|-------|------------------|
| **Admin** | `POST /api/auth/login` | admin@example.com | (run createAdmin.js) |
| **Student** | `POST /api/auth/login` | student@example.com | (register first) |
| **Caretaker** | `POST /api/caretaker/login` | caretaker@example.com | (admin creates) |

---

## 📋 Complete API List

### 🔓 Public (No Token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check server status |
| GET | `/api/rooms` | List all rooms |

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login admin/student |
| POST | `/api/caretaker/login` | Login caretaker |

### 👨‍💼 Admin Only (Requires admin token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/hostels` | Create hostel |
| GET | `/api/admin/hostels` | List hostels |
| PUT | `/api/admin/hostels/:id` | Update hostel |
| DELETE | `/api/admin/hostels/:id` | Delete hostel |
| POST | `/api/admin/rooms` | Create room |
| GET | `/api/admin/rooms` | List rooms |
| PUT | `/api/admin/rooms/:id` | Update room |
| DELETE | `/api/admin/rooms/:id` | Delete room |
| GET | `/api/admin/students` | List students |
| POST | `/api/admin/allocate` | Auto-allocate rooms |
| POST | `/api/admin/allocate-student` | Allocate to specific student |
| POST | `/api/admin/deallocate` | Deallocate room |
| GET | `/api/admin/requests` | List room change requests |
| POST | `/api/admin/requests/:id` | Approve/reject request |
| POST | `/api/admin/caretakers` | Create caretaker |
| GET | `/api/admin/caretakers` | List caretakers |
| PUT | `/api/admin/caretakers/:id` | Update caretaker |
| DELETE | `/api/admin/caretakers/:id` | Delete caretaker |
| GET | `/api/admin/complaints` | List all complaints |
| GET | `/api/admin/complaints/stats` | Get complaint statistics |
| PUT | `/api/admin/complaints/:id/status` | Update complaint status |

### 🎓 Student Only (Requires student token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/dashboard` | Get student dashboard |
| POST | `/api/student/request` | Request room change |
| POST | `/api/complaints/submit` | Submit complaint |
| GET | `/api/complaints/my-complaints` | Get my complaints |
| PUT | `/api/complaints/:id/confirm` | Confirm resolution |
| PUT | `/api/complaints/:id/reject` | Reject resolution |

### 🛠️ Caretaker Only (Requires caretaker token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/caretaker/dashboard` | Get caretaker dashboard |
| GET | `/api/caretaker/complaints` | Get hostel complaints |
| PUT | `/api/caretaker/complaints/:id/status` | Update complaint status |

---

## 🎯 Token Usage in Postman

### Method 1: Direct Header
```
Key: Authorization
Value: Bearer YOUR_TOKEN_HERE
```

### Method 2: Environment Variable
1. Create environment variable: `student_token`
2. Store token value
3. Use in header:
   ```
   Key: Authorization
   Value: Bearer {{student_token}}
   ```

### Method 3: Auto-Save on Login
Add to login request's "Tests" tab:
```javascript
const response = pm.response.json();
if (response.token) {
  pm.environment.set("student_token", response.token);
}
```

---

## 📊 Response Examples

### ✅ Success Response
```json
{
  "token": "eyJhbG...",
  "user": {
    "student_id": 1,
    "name": "John Doe",
    "role": "student"
  }
}
```

### ❌ Error Responses

**401 Unauthorized - No token or invalid token**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden - Wrong role**
```json
{
  "error": "Forbidden - Invalid role"
}
```

**400 Bad Request - Wrong credentials**
```json
{
  "error": "Invalid credentials"
}
```

---

## 🧪 Testing Workflow

### Test 1: Student Flow
```
1. Register Student
   POST /api/auth/register
   Body: { "name": "John", "email": "john@test.com", "password": "pass123" }
   
2. Copy token from response

3. Get Dashboard
   GET /api/student/dashboard
   Header: Authorization: Bearer TOKEN
   
4. Submit Complaint
   POST /api/complaints/submit
   Header: Authorization: Bearer TOKEN
   Body: { "category": "Maintenance", "description": "Broken AC" }
```

### Test 2: Admin Flow
```
1. Login as Admin
   POST /api/auth/login
   Body: { "email": "admin@example.com", "password": "admin123" }
   
2. Copy admin token

3. Create Hostel
   POST /api/admin/hostels
   Header: Authorization: Bearer ADMIN_TOKEN
   Body: { "name": "Hostel A", "location": "North", "capacity": 100 }
   
4. Create Room
   POST /api/admin/rooms
   Header: Authorization: Bearer ADMIN_TOKEN
   Body: { "hostel_id": 1, "room_number": "101", "capacity": 2, "room_type": "AC" }
   
5. Allocate Rooms
   POST /api/admin/allocate
   Header: Authorization: Bearer ADMIN_TOKEN
```

### Test 3: Caretaker Flow
```
1. Login as Caretaker
   POST /api/caretaker/login
   Body: { "email": "caretaker@example.com", "password": "care123" }
   
2. Copy caretaker token

3. Get Dashboard
   GET /api/caretaker/dashboard
   Header: Authorization: Bearer CARETAKER_TOKEN
   
4. View Complaints
   GET /api/caretaker/complaints
   Header: Authorization: Bearer CARETAKER_TOKEN
   
5. Update Complaint
   PUT /api/caretaker/complaints/1/status
   Header: Authorization: Bearer CARETAKER_TOKEN
   Body: { "status": "resolved", "notes": "Fixed" }
```

---

## 🔍 How to Check Your Token

### Option 1: jwt.io
1. Go to https://jwt.io
2. Paste your token
3. View decoded information

### Option 2: Postman Console
Add to Tests tab:
```javascript
const token = pm.response.json().token;
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log("Token payload:", payload);
```

---

## ⚠️ Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Unauthorized" | No token sent | Add Authorization header |
| "Unauthorized" | Wrong token format | Use `Bearer TOKEN` |
| "Forbidden" | Wrong role | Use correct role's token |
| "Invalid token" | Token expired | Login again |
| "Invalid credentials" | Wrong email/password | Check credentials |

---

## 🎓 Token Information

| Property | Value |
|----------|-------|
| **Type** | JWT (JSON Web Token) |
| **Algorithm** | HS256 |
| **Expiry** | 8 hours |
| **Format** | `Bearer TOKEN` |
| **Header Name** | `Authorization` |
| **Storage** | Client-side (Postman variable) |

**Token Contains:**
- User ID (student_id, admin_id, or caretaker_id)
- Role (student, admin, or caretaker)
- Name
- Issued at (iat)
- Expiry (exp)

---

## 📦 Import Postman Collection

1. Open Postman
2. Click "Import"
3. Select `Hostel_Management_API.postman_collection.json`
4. Create environment variables:
   - `base_url`: `http://localhost:4000`
   - `admin_token`: (empty)
   - `student_token`: (empty)
   - `caretaker_token`: (empty)

---

## 🛠️ Setup Commands

### Create Admin User
```bash
cd server
node src/createAdmin.js
```

### Create Caretaker (via Admin API)
```http
POST /api/admin/caretakers
Authorization: Bearer ADMIN_TOKEN
Body: { 
  "name": "Caretaker Name",
  "email": "care@example.com",
  "password": "pass123",
  "phone": "1234567890",
  "hostel_id": 1
}
```

### Register Student
```http
POST /api/auth/register
Body: {
  "name": "Student Name",
  "email": "student@example.com",
  "password": "pass123"
}
```

---

## 📝 Testing Checklist

- [ ] Server running on port 4000
- [ ] Admin user created
- [ ] Can login as admin
- [ ] Can create hostel
- [ ] Can create room
- [ ] Can register student
- [ ] Can login as student
- [ ] Student can view dashboard
- [ ] Admin can allocate rooms
- [ ] Student can submit complaint
- [ ] Caretaker user created
- [ ] Caretaker can login
- [ ] Caretaker can view complaints
- [ ] Caretaker can update complaint status
- [ ] Token expires after 8 hours

---

## 🎯 Next Steps

1. **Import Postman Collection** 
   - Use `Hostel_Management_API.postman_collection.json`

2. **Read Full Documentation**
   - `POSTMAN_API_DOCUMENTATION.md` - Complete API reference
   - `TOKEN_AUTHENTICATION_GUIDE.md` - Detailed auth guide

3. **Start Testing**
   - Follow testing workflow above
   - Test each role separately
   - Verify token authentication works

---

**Base URL:** `http://localhost:4000`  
**Token Expiry:** 8 hours  
**Authentication:** JWT Bearer Token
