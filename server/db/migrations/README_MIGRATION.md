# Database Migration Instructions

## Running the Complaints System Migration

This migration adds support for the complete complaint workflow with student confirmation and escalation features.

### What's New:
- **Escalated** status: For issues that cannot be resolved by caretakers
- **Reopened** status: For issues marked as resolved but rejected by students

### How to Run:

1. **Using MySQL Workbench or Command Line:**
   ```bash
   mysql -u root -p hostel_db < server/db/migrations/create_complaints_system.sql
   ```

2. **Using the migration script:**
   ```bash
   cd server
   npm run migrate
   ```

3. **Manual execution:**
   - Open MySQL Workbench
   - Connect to your database
   - Open the file `create_complaints_system.sql`
   - Execute the script

### Important Notes:
- The migration includes a backup mechanism to preserve existing complaint data
- If the complaints table already exists, it will be dropped and recreated with the new status enum
- All existing data will be restored after the table recreation

### New Workflow Status Flow:
```
Pending → In Progress → Resolved
                         ↓
              Student Confirmation
                    ↙    ↘
            YES (Satisfied)  NO (Not Fixed)
                 ↓              ↓
              Completed      Reopened
```

### Escalation Flow:
```
Any Status → Escalated (Cannot be resolved by caretaker)
```
