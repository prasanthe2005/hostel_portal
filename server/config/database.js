const mysql = require('mysql2');
require('dotenv').config();

// Create connection WITHOUT specifying database initially
const createConnection = () => {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
  });
};

// Create connection pool WITH database for normal operations
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hostel_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Get promise-based connection
const promisePool = pool.promise();

// Create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  const connection = createConnection();
  const promiseConnection = connection.promise();
  
  try {
    const dbName = process.env.DB_NAME || 'hostel_db';
    await promiseConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created or already exists`);
    return true;
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    return false;
  } finally {
    await promiseConnection.end();
  }
};

// Test the connection to the specific database
const testConnection = async () => {
  try {
    // First, ensure database exists
    await createDatabaseIfNotExists();
    
    // Then test connection to the specific database
    const connection = await promisePool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  promisePool,
  testConnection,
  createDatabaseIfNotExists
};