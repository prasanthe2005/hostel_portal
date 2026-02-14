# Hostel Backend

Node/Express backend for the Hostel Management Portal.

Quick start (using Docker for MySQL):

1. Copy `.env.example` to `.env` and adjust values.
2. Start MySQL:

```bash
docker compose up -d
```

3. Import schema and seed (after DB is ready):

```bash
mysql -h 127.0.0.1 -P 3306 -u root -prootpassword < db/schema.sql
mysql -h 127.0.0.1 -P 3306 -u root -prootpassword < db/seed.sql
```

4. Install and run server:

```bash
cd server
npm install
npm run dev
```

Optional: initialize DB and create admin from Node scripts

```bash
cd server
npm run init-db
ADMIN_EMAIL=admin@example.com ADMIN_PASS=admin123 ADMIN_NAME=Admin npm run create-admin
```

Endpoints:
- `POST /api/auth/register` - register user
- `POST /api/auth/login` - login (returns JWT)
- Admin routes (require admin JWT): `/api/admin/...`
- Student routes (require student JWT): `/api/student/...`
