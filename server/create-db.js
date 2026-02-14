const mysql = require('mysql2');
require('dotenv').config();

// Create database if it doesn't exist
const createDatabase = async () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('🔌 Connecting to MySQL server...');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'hostel_db';
    await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created or already exists`);
    
    // Test connection to the database
    await connection.promise().execute(`USE \`${dbName}\``);
    console.log(`✅ Successfully connected to database '${dbName}'`);
    
    connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    connection.end();
    return false;
  }
};

// Run database creation
const run = async () => {
  try {
    const success = await createDatabase();
    if (success) {
      console.log('✅ Database setup completed successfully!');
      console.log('🚀 You can now run: npm run db:init');
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
};

run();