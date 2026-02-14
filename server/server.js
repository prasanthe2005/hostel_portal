const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { testConnection } = require('./config/database');
const { initializeDatabase } = require('./config/init-db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "Hostel Management Server Running",
    status: "active",
    timestamp: new Date().toISOString()
  });
});

// Database connection test endpoint
app.get("/api/test-db", async (req, res) => {
  const isConnected = await testConnection();
  res.json({
    database: isConnected ? "connected" : "disconnected",
    message: isConnected ? "Database connection successful" : "Database connection failed"
  });
});

// Database initialization endpoint
app.post("/api/init-db", async (req, res) => {
  try {
    await initializeDatabase();
    res.json({
      success: true,
      message: "Database initialized successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database initialization failed",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

// Start server and test database connection
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API endpoint: http://localhost:${PORT}`);
      console.log(`🗄️  Database test: http://localhost:${PORT}/api/test-db`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
