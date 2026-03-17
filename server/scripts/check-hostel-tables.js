import pool from '../src/config/db.js';

async function checkHostelTables() {
    const connection = await pool.getConnection();
    
    try {
        console.log('🔍 Checking hostels, floors, and rooms tables...\n');

        // Check hostels table structure
        console.log('1️⃣  HOSTELS table structure:');
        const [hostelCols] = await connection.query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                COLUMN_TYPE,
                IS_NULLABLE,
                COLUMN_KEY,
                COLUMN_DEFAULT,
                EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'hostel_db' 
            AND TABLE_NAME = 'hostels'
            ORDER BY ORDINAL_POSITION
        `);
        console.table(hostelCols);

        // Check floors table structure
        console.log('\n2️⃣  FLOORS table structure:');
        const [floorCols] = await connection.query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                COLUMN_TYPE,
                IS_NULLABLE,
                COLUMN_KEY,
                COLUMN_DEFAULT,
                EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'hostel_db' 
            AND TABLE_NAME = 'floors'
            ORDER BY ORDINAL_POSITION
        `);
        console.table(floorCols);

        // Check rooms table structure
        console.log('\n3️⃣  ROOMS table structure:');
        const [roomCols] = await connection.query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                COLUMN_TYPE,
                IS_NULLABLE,
                COLUMN_KEY,
                COLUMN_DEFAULT,
                EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'hostel_db' 
            AND TABLE_NAME = 'rooms'
            ORDER BY ORDINAL_POSITION
        `);
        console.table(roomCols);

        // Check foreign key constraints
        console.log('\n4️⃣  Foreign key constraints:');
        const [constraints] = await connection.query(`
            SELECT 
                TABLE_NAME,
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'hostel_db'
            AND TABLE_NAME IN ('floors', 'rooms')
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        console.table(constraints);

        // Check existing hostels
        console.log('\n5️⃣  Existing hostels:');
        const [hostels] = await connection.query('SELECT hostel_id, hostel_name, location, total_floors, total_rooms, created_at FROM hostels');
        if (hostels.length > 0) {
            console.table(hostels);
        } else {
            console.log('   No hostels found');
        }

        console.log('\n✅ Database check completed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Error code:', error.code);
    } finally {
        connection.release();
        await pool.end();
    }
}

checkHostelTables();
