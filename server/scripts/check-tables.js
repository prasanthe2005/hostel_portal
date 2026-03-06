import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hostel_db'
  });

  try {
    console.log('Connected to database\n');
    
    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Existing tables:');
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`  - ${tableName}`);
    });
    
    console.log('\nChecking for foreign key constraints on each table...\n');
    
    for (const row of tables) {
      const tableName = Object.values(row)[0];
      const [constraints] = await connection.query(`
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          CONSTRAINT_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? 
        AND (TABLE_NAME = ? OR REFERENCED_TABLE_NAME = ?)
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [process.env.DB_NAME || 'hostel_db', tableName, tableName]);
      
      if (constraints.length > 0) {
        console.log(`Table: ${tableName}`);
        constraints.forEach(c => {
          if (c.TABLE_NAME === tableName) {
            console.log(`  ➤ References: ${c.REFERENCED_TABLE_NAME}.${c.REFERENCED_COLUMN_NAME}`);
          } else {
            console.log(`  ➤ Referenced by: ${c.TABLE_NAME}.${c.COLUMN_NAME}`);
          }
        });
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

checkTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
