# Hostel Management Frontend

A React application for managing hostel operations.

## Project Structure

```
hostel-management-frontend/
│
├── index.html
├── package.json
├── vite.config.js
│
├── public/
│   └── logo.png
│
├── src/
│   ├── auth/
│   │   └── Login.jsx
│   │
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── ManageHostels.jsx
│   │   ├── ManageRooms.jsx
│   │   └── RoomRequests.jsx
│   │
│   ├── student/
│   │   ├── StudentDashboard.jsx
│   │   ├── StudentProfile.jsx
│   │   └── RequestRoomChange.jsx
│   │
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
└── README.md
```

## Setup

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`