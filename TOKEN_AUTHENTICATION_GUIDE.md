# Token-Based Authentication Guide

## 🔐 How Token Authentication Works

### Flow Diagram

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   Client    │                    │   Server    │                    │  Database   │
│  (Postman)  │                    │   (Node.js) │                    │   (MySQL)   │
└─────────────┘                    └─────────────┘                    └─────────────┘
      │                                    │                                    │
      │  1. POST /api/auth/login           │                                    │
      │  { email, password }               │                                    │
      │───────────────────────────────────>│                                    │
      │                                    │  2. Query user by email            │
      │                                    │───────────────────────────────────>│
      │                                    │                                    │
      │                                    │  3. Return user data               │
      │                                    │<───────────────────────────────────│
      │                                    │                                    │
      │                                    │  4. Compare password (bcrypt)      │
      │                                    │                                    │
      │                                    │  5. Generate JWT token             │
      │                                    │     jwt.sign({                     │
      │                                    │       student_id: 1,               │
      │                                    │       role: 'student',             │
      │                                    │       name: 'John'                 │
      │                                    │     }, JWT_SECRET, {expiresIn:'8h'})│
      │                                    │                                    │
      │                                    │  6. Update current_token           │
      │                                    │───────────────────────────────────>│
      │                                    │                                    │
      │  7. Response with token            │                                    │
      │  { token: "eyJhbG...",             │                                    │
      │    user: {...} }                   │                                    │
      │<───────────────────────────────────│                                    │
      │                                    │                                    │
      │  8. Store token in Postman         │                                    │
      │                                    │                                    │
      │  9. GET /api/student/dashboard     │                                    │
      │  Header: Authorization: Bearer ... │                                    │
      │───────────────────────────────────>│                                    │
      │                                    │  10. Extract token from header     │
      │                                    │      token = "eyJhbG..."           │
      │                                    │                                    │
      │                                    │  11. Verify token                  │
      │                                    │      jwt.verify(token, JWT_SECRET) │
      │                                    │      → returns payload             │
      │                                    │                                    │
      │                                    │  12. Check role matches            │
      │                                    │      payload.role === 'student'?   │
      │                                    │                                    │
      │                                    │  13. Query dashboard data          │
      │                                    │───────────────────────────────────>│
      │                                    │                                    │
      │                                    │  14. Return data                   │
      │                                    │<───────────────────────────────────│
      │                                    │                                    │
      │  15. Response with dashboard data  │                                    │
      │<───────────────────────────────────│                                    │
      │                                    │                                    │
```

---

## 📋 Step-by-Step Token Flow

### 1. USER REGISTRATION/LOGIN
```javascript
// Client sends credentials
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. SERVER VALIDATES CREDENTIALS
```javascript
// authController.js
const [students] = await conn.query(
  'SELECT * FROM student WHERE email=? LIMIT 1',
  [email]
);

const ok = await bcrypt.compare(password, students[0].password);
if (!ok) return res.status(400).json({error: 'Invalid credentials'});
```

### 3. SERVER GENERATES JWT TOKEN
```javascript
// Create token with user info
const token = jwt.sign(
  {
    student_id: s.student_id,
    role: 'student',
    name: s.name
  },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '8h' }
);
```

**Token Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHVkZW50X2lkIjoxLCJyb2xlIjoic3R1ZGVudCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTY3ODM0NTY3OCwiZXhwIjoxNjc4Mzc0NDc4fQ.example_signature_here

┌─────────────┬─────────────────────────────────────────────┬───────────────┐
│   HEADER    │              PAYLOAD                        │  SIGNATURE    │
│  (Base64)   │             (Base64)                        │ (Encrypted)   │
└─────────────┴─────────────────────────────────────────────┴───────────────┘
```

**Decoded Token Parts:**

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "student_id": 1,
  "role": "student",
  "name": "John Doe",
  "iat": 1678345678,
  "exp": 1678374478
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

### 4. SERVER RETURNS TOKEN
```javascript
res.json({
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    student_id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "student"
  }
});
```

### 5. CLIENT STORES TOKEN
```
// In Postman:
// 1. Copy the token from response
// 2. Save to Environment variable: student_token
// 3. Use {{student_token}} in requests
```

### 6. CLIENT SENDS TOKEN IN REQUESTS
```http
GET /api/student/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 7. SERVER VERIFIES TOKEN
```javascript
// middleware/auth.js
export function authMiddleware(requiredRole) {
  return async (req, res, next) => {
    // Extract token from header
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({error: 'Unauthorized'});
    }
    
    const token = auth.split(' ')[1];
    
    try {
      // Verify token with secret
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      
      // Token is valid, attach user to request
      req.user = payload;
      
      // Check if role matches
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({error: 'Forbidden - Invalid role'});
      }
      
      // All good, proceed to route handler
      next();
    } catch (err) {
      return res.status(401).json({error: 'Invalid token'});
    }
  }
}
```

### 8. ROUTE HANDLER PROCESSES REQUEST
```javascript
// studentController.js
export async function dashboard(req, res) {
  // req.user is available from middleware
  const student_id = req.user.student_id;
  
  // Fetch student data
  const [students] = await conn.query(
    'SELECT * FROM student WHERE student_id=?',
    [student_id]
  );
  
  res.json({ student: students[0] });
}
```

---

## 🔍 How to Check Token in Postman

### Decoding JWT Token

You can decode (but not verify) a JWT token at [jwt.io](https://jwt.io):

1. Copy your token from Postman response
2. Go to https://jwt.io
3. Paste token in the "Encoded" field
4. See decoded payload on the right

**Example:**

**Encoded Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHVkZW50X2lkIjoxLCJyb2xlIjoic3R1ZGVudCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTY3ODM0NTY3OCwiZXhwIjoxNjc4Mzc0NDc4fQ.signature
```

**Decoded Payload:**
```json
{
  "student_id": 1,
  "role": "student",
  "name": "John Doe",
  "iat": 1678345678,    // Issued at: March 9, 2026
  "exp": 1678374478     // Expires: March 9, 2026 (8 hours later)
}
```

---

## 🧪 Testing Token Authentication in Postman

### Setup 1: Create Environment

1. Click on "Environments" in Postman
2. Create new environment "Hostel API"
3. Add variables:
   ```
   base_url = http://localhost:4000
   admin_token = (empty for now)
   student_token = (empty for now)
   caretaker_token = (empty for now)
   ```

### Setup 2: Login Request

Create a new request:
```
POST {{base_url}}/api/auth/login
Body: raw (JSON)
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Setup 3: Auto-Save Token (Advanced)

In the "Tests" tab of login request, add:
```javascript
// Parse response
const response = pm.response.json();

// Save token to environment
if (response.token) {
  pm.environment.set("student_token", response.token);
  console.log("Token saved:", response.token);
}

// Save user info
if (response.user) {
  pm.environment.set("user_id", response.user.student_id);
  pm.environment.set("user_role", response.user.role);
  pm.environment.set("user_name", response.user.name);
}
```

Now when you login, the token is automatically saved!

### Setup 4: Use Token in Protected Routes

For any protected endpoint:
```
GET {{base_url}}/api/student/dashboard

Headers:
Key: Authorization
Value: Bearer {{student_token}}
```

---

## 🎯 Testing Different Roles

### Test as Student

1. **Login as Student:**
   ```
   POST /api/auth/login
   {
     "email": "student@example.com",
     "password": "password123"
   }
   ```
   
2. **Save token to `student_token`**

3. **Test student endpoints:**
   ```
   GET /api/student/dashboard
   Header: Authorization: Bearer {{student_token}}
   
   POST /api/student/request
   Header: Authorization: Bearer {{student_token}}
   Body: { "to_room_id": 5, "reason": "Health" }
   
   POST /api/complaints/submit
   Header: Authorization: Bearer {{student_token}}
   Body: { "category": "Maintenance", "description": "Broken AC" }
   ```

### Test as Admin

1. **Login as Admin:**
   ```
   POST /api/auth/login
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```

2. **Save token to `admin_token`**

3. **Test admin endpoints:**
   ```
   GET /api/admin/students
   Header: Authorization: Bearer {{admin_token}}
   
   POST /api/admin/hostels
   Header: Authorization: Bearer {{admin_token}}
   Body: { "name": "Hostel A", "location": "North", "capacity": 100 }
   
   GET /api/admin/complaints
   Header: Authorization: Bearer {{admin_token}}
   ```

### Test as Caretaker

1. **Login as Caretaker:**
   ```
   POST /api/caretaker/login
   {
     "email": "caretaker@example.com",
     "password": "care123"
   }
   ```

2. **Save token to `caretaker_token`**

3. **Test caretaker endpoints:**
   ```
   GET /api/caretaker/dashboard
   Header: Authorization: Bearer {{caretaker_token}}
   
   GET /api/caretaker/complaints
   Header: Authorization: Bearer {{caretaker_token}}
   
   PUT /api/caretaker/complaints/1/status
   Header: Authorization: Bearer {{caretaker_token}}
   Body: { "status": "resolved", "notes": "Fixed" }
   ```

---

## ⚠️ Common Token Errors

### 1. Missing Authorization Header
```json
{
  "error": "Unauthorized"
}
```
**Fix:** Add `Authorization: Bearer YOUR_TOKEN` header

### 2. Invalid Token Format
```json
{
  "error": "Unauthorized"
}
```
**Fix:** Ensure format is `Bearer TOKEN` (with space)

### 3. Expired Token
```json
{
  "error": "Invalid token"
}
```
**Fix:** Login again to get new token

### 4. Wrong Role
```json
{
  "error": "Forbidden - Invalid role"
}
```
**Fix:** Use correct role token (admin/student/caretaker)

### 5. Token Verification Failed
```json
{
  "error": "Invalid token"
}
```
**Fix:** Check if JWT_SECRET matches on server

---

## 🔒 Security Features

### 1. Password Hashing
```javascript
// Registration
const hash = await bcrypt.hash(password, 10);

// Login
const ok = await bcrypt.compare(password, storedHash);
```

### 2. Token Expiration
```javascript
// Tokens expire after 8 hours
jwt.sign(payload, secret, { expiresIn: '8h' });
```

### 3. Role-Based Access Control
```javascript
// Only admins can access
router.use(authMiddleware('admin'));

// Only students can access
router.use(authMiddleware('student'));

// Only caretakers can access
router.use(authMiddleware('caretaker'));
```

### 4. Token Storage in Database
```javascript
// Update student's current token
await conn.query(
  'UPDATE student SET current_token=? WHERE student_id=?',
  [token, student_id]
);
```

---

## 📊 Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                          │
└─────────────────────────────────────────────────────────────┘

    ┌───────────┐
    │  Login    │
    └─────┬─────┘
          │
          ▼
    ┌───────────┐
    │ Generate  │
    │  Token    │────────┐
    └─────┬─────┘        │
          │              │ Store in DB
          │              ▼
          │        ┌───────────┐
          │        │ Database  │
          │        │  current_ │
          │        │  token    │
          │        └───────────┘
          │
          ▼
    ┌───────────┐
    │  Return   │
    │  to Client│
    └─────┬─────┘
          │
          ▼
    ┌───────────┐
    │  Client   │
    │  Stores   │
    │  Token    │────────┐
    └─────┬─────┘        │
          │              │
          │              ▼
          │        ┌───────────┐
          │        │  Postman  │
          │        │  Environ- │
          │        │  ment Var │
          │        └───────────┘
          │
          ▼
    ┌───────────┐
    │  Client   │
    │  Sends    │
    │  Token    │
    │  in Header│
    └─────┬─────┘
          │
          ▼
    ┌───────────┐
    │  Server   │
    │  Verifies │────────┐
    │  Token    │        │
    └─────┬─────┘        │
          │              │ Valid?
          ├──────────────┤
          │              │
      YES │              │ NO
          │              │
          ▼              ▼
    ┌───────────┐  ┌───────────┐
    │  Allow    │  │  Reject   │
    │  Access   │  │  401/403  │
    └───────────┘  └───────────┘
          │
          ▼
    ┌───────────┐
    │ Token Age?│
    └─────┬─────┘
          │
          ├─ < 8 hours: Valid
          │
          └─ > 8 hours: Expired
                  │
                  ▼
            ┌───────────┐
            │  Login    │
            │  Again    │
            └───────────┘
```

---

## 🎓 Understanding JWT Claims

### Standard Claims (in payload)

| Claim | Name | Description | Example |
|-------|------|-------------|---------|
| `iat` | Issued At | Timestamp when token was created | 1678345678 |
| `exp` | Expiration | Timestamp when token expires | 1678374478 |
| `sub` | Subject | User identifier | student_id: 1 |
| `iss` | Issuer | Who issued the token | (not used) |
| `aud` | Audience | Who should accept the token | (not used) |

### Custom Claims (your app)

| Claim | Description | Example |
|-------|-------------|---------|
| `student_id` | Student identifier | 1 |
| `admin_id` | Admin identifier | 1 |
| `caretaker_id` | Caretaker identifier | 1 |
| `role` | User role | "student", "admin", "caretaker" |
| `name` | User's name | "John Doe" |

---

## 🛠️ Troubleshooting

### Problem: "Unauthorized" error
**Check:**
1. Is Authorization header present?
2. Is format correct? `Bearer TOKEN`
3. Is there a space after "Bearer"?
4. Is token copied correctly (no extra spaces)?

### Problem: "Forbidden - Invalid role" error
**Check:**
1. Are you using the right token for the endpoint?
2. Student token for student routes
3. Admin token for admin routes
4. Caretaker token for caretaker routes

### Problem: Token seems invalid
**Check:**
1. Has token expired? (8 hours)
2. Is JWT_SECRET same on server?
3. Did you login successfully?
4. Is database updated with current_token?

### Problem: Can't decode token
**Solution:**
1. Go to https://jwt.io
2. Paste your token
3. See if it decodes properly
4. Check "Signature Verified" (needs JWT_SECRET)

---

## 📚 Additional Resources

- **JWT Official Site:** https://jwt.io
- **JWT Debugger:** https://jwt.io/#debugger
- **Postman Docs:** https://learning.postman.com
- **bcrypt Library:** https://www.npmjs.com/package/bcryptjs

---

## 🎯 Quick Reference

### Login & Get Token
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Use Token
```bash
curl -X GET http://localhost:4000/api/student/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Token Expiry
```bash
# Token expires in 8 hours
# To test expiry, wait 8 hours or manually change exp claim
```

---

**Remember:** Always keep your JWT_SECRET secure and never commit it to version control!
