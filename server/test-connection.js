// Load environment variables first
require('dotenv').config();

const { testConnection, createDatabaseIfNotExists } = require('./config/database');

// Simple database connection test
const testDatabaseConnection = async () => {
  console.log('🔄 Testing MySQL Database Connection...');
  console.log('================================');
  console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`User: ${process.env.DB_USER || 'root'}`);
  console.log(`Database: ${process.env.DB_NAME || 'hostel_db'}`);
  console.log(`Port: ${process.env.DB_PORT || 3306}`);
  console.log('================================');
  
  try {
    // Test database creation and connection
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection test PASSED');
      console.log('🎉 MySQL is ready for use!');
      process.exit(0);
    } else {
      console.log('❌ Database connection test FAILED');
      console.log('💡 Check your MySQL server and credentials in .env file');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Connection test error:', error.message);
    process.exit(1);
  }
};

testDatabaseConnection();