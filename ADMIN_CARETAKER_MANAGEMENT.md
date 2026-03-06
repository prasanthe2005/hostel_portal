# Admin Caretaker Management Guide

## Overview
Admins can now create and manage caretaker accounts directly from the admin panel. When a caretaker is successfully added, their login credentials are displayed so the admin can share them with the caretaker.

## How It Works

### 1. Admin Creates Caretaker Account

**Step-by-Step:**
1. Admin logs in at `/login` (as admin)
2. Navigate to **"Manage Caretakers"** from the sidebar
3. Click **"+ Add Caretaker"** button
4. Fill in the caretaker details:
   - **Name** (required): Full name of the caretaker
   - **Email** (required): Email address (will be used for login)
   - **Password** (required): Login password
     - Can manually type password
     - Or click 🎲 button to generate a random secure password
   - **Phone** (optional): Contact number
   - **Assigned Hostel** (optional): 
     - Select a specific hostel
     - Or leave as "All Hostels" for access to all complaints
5. Click **"Create Caretaker"**

### 2. Credentials Display

After successful creation, a modal appears showing:
- ✅ Success message
- 📧 Login credentials:
  - Name
  - Email (login username)
  - Password (plaintext - shown only once!)
  - Assigned hostel
  - Login URL: `/caretaker/login`

**Important:** 
- ⚠️ The password is shown **only once** during creation
- Admin should copy/note the credentials immediately
- Share these credentials securely with the caretaker

### 3. Caretaker Logs In

The caretaker receives their credentials from the admin and:
1. Visit `/caretaker/login`
2. Enter email and password
3. Click "Sign In"
4. Redirected to caretaker dashboard

## Features

### Admin Panel Features:
✅ **View All Caretakers**
- List all registered caretakers
- See assigned hostels
- View complaint statistics (resolved/total)
- Contact information

✅ **Add New Caretaker**
- Create caretaker accounts
- Assign to specific hostels
- Generate secure passwords
- Get credentials immediately

✅ **Delete Caretaker**
- Remove caretaker accounts
- Confirmation dialog before deletion

### Caretaker Features:
✅ **Dedicated Login Portal** at `/caretaker/login`
✅ **Dashboard** with complaint statistics
✅ **View Complaints** from assigned hostel(s)
✅ **Update Status** (Pending → In Progress → Resolved)
✅ **Access Student Information** for follow-up

## Technical Details

### Backend API Endpoints:

#### Admin Caretaker Management:
```
POST   /api/admin/caretakers          - Create caretaker
GET    /api/admin/caretakers          - List all caretakers
PUT    /api/admin/caretakers/:id      - Update caretaker
DELETE /api/admin/caretakers/:id      - Delete caretaker
GET    /api/admin/complaints          - View all complaints
GET    /api/admin/complaints/stats    - Get complaint statistics
```

#### Caretaker Authentication:
```
POST   /api/caretaker/login           - Caretaker login
GET    /api/caretaker/dashboard       - Get dashboard data
GET    /api/caretaker/complaints      - Get hostel complaints
```

### Database Schema:

**caretakers table:**
```sql
CREATE TABLE caretakers (
  caretaker_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,      -- bcrypt hashed
  phone VARCHAR(15),
  hostel_id BIGINT,                    -- NULL = all hostels
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id)
);
```

### File Structure:

**Backend:**
```
server/src/
├── controllers/
│   ├── adminCaretakerController.js   # Admin caretaker management
│   ├── caretakerController.js        # Caretaker operations
│   └── complaintController.js        # Complaint operations
└── routes/
    ├── admin.js                       # Admin routes (includes caretaker)
    └── caretaker.js                   # Caretaker routes
```

**Frontend:**
```
client/src/
├── admin/
│   └── ManageCaretakers.jsx          # Caretaker management UI
├── caretaker/
│   └── CaretakerDashboard.jsx        # Caretaker dashboard
├── pages/auth/
│   └── CaretakerLogin.jsx            # Caretaker login page
└── services/
    ├── admin.service.js               # Admin API calls
    └── caretaker.service.js           # Caretaker API calls
```

## Security Features

✅ **Password Hashing**: All passwords hashed with bcrypt (10 rounds)
✅ **JWT Authentication**: Token-based authentication for all routes
✅ **Role-Based Access**: Separate roles for admin/student/caretaker
✅ **Hostel Isolation**: Caretakers only see their assigned hostel's complaints
✅ **Email Uniqueness**: Prevents duplicate caretaker accounts

## Usage Example

### Example Workflow:

**Admin Side:**
1. Admin logs in
2. Goes to "Manage Caretakers"
3. Clicks "+ Add Caretaker"
4. Fills form:
   ```
   Name: John Doe
   Email: john.caretaker@hostel.com
   Password: [Generated: SecurePass123!]
   Phone: +1234567890
   Hostel: Alpha Hostel
   ```
5. Clicks "Create Caretaker"
6. Modal shows credentials - Admin notes them down
7. Admin sends email/message to John:
   ```
   Hi John,
   
   Your caretaker account has been created:
   Email: john.caretaker@hostel.com
   Password: SecurePass123!
   Login: https://hostel.example.com/caretaker/login
   
   You are assigned to Alpha Hostel.
   ```

**Caretaker Side:**
1. John receives credentials
2. Visits `/caretaker/login`
3. Enters email and password
4. Successfully logs in
5. Views dashboard with complaints
6. Starts managing complaints

## Best Practices

### For Admins:
1. ✅ Use the password generator for secure passwords
2. ✅ Always copy credentials before closing the success modal
3. ✅ Share credentials through secure channels (not plain email)
4. ✅ Assign caretakers to specific hostels when possible
5. ✅ Regularly review caretaker performance (resolved complaints)

### For Caretakers:
1. ✅ Change default password after first login (feature to be added)
2. ✅ Check dashboard regularly for new complaints
3. ✅ Update complaint status promptly
4. ✅ Contact students if more information needed
5. ✅ Mark complaints as resolved only when fixed

## Navigation

### Admin Navigation:
```
Admin Dashboard → Sidebar → "Caretakers" → Manage Caretakers Page
```

### Caretaker Navigation:
```
/caretaker/login → Login → Caretaker Dashboard
```

### Direct URLs:
- Admin Caretaker Management: `/admin/caretakers`
- Caretaker Login: `/caretaker/login`
- Caretaker Dashboard: `/caretaker/dashboard`

## Troubleshooting

### Issue: Caretaker can't login
**Solution:**
- Verify email and password are correct
- Check if caretaker account exists in database
- Ensure password was copied correctly (no spaces)
- Check JWT_SECRET is configured

### Issue: Credentials modal closed accidentally
**Solution:**
- Password cannot be retrieved once modal is closed
- Admin needs to reset caretaker password (update feature)
- Or delete and recreate the caretaker account

### Issue: Caretaker sees no complaints
**Solution:**
- Check if caretaker is assigned to correct hostel
- Verify complaints exist for that hostel
- Check database foreign key relationships

## Future Enhancements

Planned improvements:
- 📧 Email notifications to caretaker with credentials
- 🔑 Password reset functionality
- 📊 Detailed caretaker performance reports
- 📱 Mobile app for caretakers
- 🔔 Real-time notifications for new complaints
- 💬 Chat/messaging between caretaker and students
- 📷 Photo attachments for complaints
- 📝 Complaint resolution notes

## Testing Checklist

Before deploying:
- [ ] Admin can create caretaker successfully
- [ ] Credentials are displayed correctly
- [ ] Password is hashed in database
- [ ] Caretaker can login with provided credentials
- [ ] Caretaker sees only assigned hostel complaints
- [ ] Caretaker can update complaint status
- [ ] Admin can view all caretakers
- [ ] Admin can delete caretakers
- [ ] Duplicate email validation works
- [ ] JWT authentication works correctly

## Support

For issues or questions:
- Check server logs for error messages
- Verify database connections
- Check browser console for frontend errors
- Review JWT token validity
- Ensure environment variables are set correctly
