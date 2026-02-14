# Database Setup Instructions

## Prerequisites

1. **MySQL Server**: Make sure MySQL is installed and running on your system
2. **Database Creation**: Create a database named `hostel_db` (or update the name in `.env`)

```sql
CREATE DATABASE hostel_db;
```

## Configuration

1. **Environment Variables**: Update the `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=hostel_db
DB_PORT=3306
```

## Database Initialization

### Method 1: Using npm script
```bash
npm run setup-db
```

### Method 2: Using API endpoint
Start the server and make a POST request to:
```
POST http://localhost:5000/api/init-db
```

### Method 3: Manual setup
```bash
node setup-db.js
```

## Database Schema

The initialization will create the following tables:

### Users Table
- Stores students, admins, and wardens
- Default admin: `admin@hostel.edu` / `password`

### Hostels Table
- Stores hostel information and facilities

### Rooms Table
- Stores room details, capacity, and availability

### Room Allocations Table
- Tracks current and past room assignments

### Room Requests Table
- Manages student room requests and applications

### Maintenance Requests Table
- Handles maintenance and repair requests

## API Endpoints

- `GET /api/test-db` - Test database connection
- `POST /api/init-db` - Initialize database tables
- `GET /` - Server health check

## Starting the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Connection Details

The server uses MySQL2 with connection pooling for optimal performance:
- Connection Pool Size: 10
- Timeout: 60 seconds
- Auto-reconnection: Enabled

## Troubleshooting

1. **Connection Failed**: Check MySQL service is running
2. **Access Denied**: Verify credentials in `.env` file
3. **Database Not Found**: Ensure database `hostel_db` exists
4. **Port Issues**: Check if MySQL is running on the specified port