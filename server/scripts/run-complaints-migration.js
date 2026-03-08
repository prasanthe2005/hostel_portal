import fs from 'fs/promises';
import pool from '../src/config/db.js';

async function runMigration() {
  console.log('\n🚀 Running Complaints System Migration...\n');
  
  const conn = await pool.getConnection();
  try {
    // Read the migration SQL file
    const migrationSQL = await fs.readFile('./db/migrations/create_complaints_system.sql', 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    console.log('⚙️  Executing migration...\n');
    
    // Split by statements and execute
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        try {
          await conn.query(statement);
          console.log('✅ Success');
        } catch (err) {
          // Ignore "already exists" errors
          if (err.message.includes('already exists') || err.message.includes('Duplicate')) {
            console.log('ℹ️  Already exists, skipping...');
          } else {
            console.error('❌ Error:', err.message);
          }
        }
      }
    }
    
    console.log('\n🎉 Migration completed!\n');
    
    // Verify the changes
    console.log('🔍 Verifying changes...');
    const [columns] = await conn.query("DESCRIBE complaints");
    const statusColumn = columns.find(c => c.Field === 'status');
    
    if (statusColumn) {
      console.log('Status column type:', statusColumn.Type);
      const enumMatch = statusColumn.Type.match(/enum\((.*)\)/i);
      if (enumMatch) {
        const values = enumMatch[1].split(',').map(v => v.replace(/'/g, '').trim());
        console.log('✅ Available statuses:', values.join(', '));
      }
    }
    
    console.log('\n✅ All done! You can now use the complaint system.\n');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

runMigration();
