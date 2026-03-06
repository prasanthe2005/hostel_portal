// Restore Student Table Script
// This script restores the student table with complete structure

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hostel_db',
  multipleStatements: true
};

async function restoreStudentTable() {
  let connection;
  
  try {
    console.log('\n========================================');
    console.log('  Student Table Restoration Script');
    console.log('========================================\n');
    
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database\n');
    
    // Read the SQL file
    const sqlFilePath = join(__dirname, 'db', 'restore_student_table.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');
    
    console.log('Restoring student table structure...');
    await connection.query(sqlContent);
    console.log('✓ Student table restored successfully!\n');
    
    // Verify table structure
    console.log('Verifying table structure...');
    const [columns] = await connection.query('DESCRIBE student');
    
    console.log('\nStudent Table Columns:');
    console.log('─'.repeat(80));
    console.log('Field'.padEnd(25), 'Type'.padEnd(30), 'Key'.padEnd(10));
    console.log('─'.repeat(80));
    
    columns.forEach(col => {
      console.log(
        col.Field.padEnd(25),
        col.Type.padEnd(30),
        (col.Key || '').padEnd(10)
      );
    });
    
    console.log('─'.repeat(80));
    console.log(`\n✓ Total columns: ${columns.length}`);
    
    // Check if there are any students
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM student');
    console.log(`✓ Current students: ${rows[0].count}`);
    
    console.log('\n✓ Student table is ready!');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n✗ Error restoring student table:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('1. MySQL is running');
    console.error('2. Database credentials in .env file');
    console.error('3. Database "hostel_db" exists\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

restoreStudentTable();
