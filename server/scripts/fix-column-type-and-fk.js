const mysql = require('mysql2/promise');

async function fixColumnTypeAndFK() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'admin',
            database: 'hostel_db'
        });

        console.log('🔧 Starting column type fix and FK recreation...\n');

        // Step 1: Check current allocations
        console.log('Step 1: Checking existing allocations...');
        const [allocations] = await connection.query('SELECT * FROM room_allocations');
        console.log(`Found ${allocations.length} existing allocation(s)`);
        if (allocations.length > 0) {
            console.log('Existing allocations:', allocations);
        }

        // Step 2: Modify column type from BIGINT to INT
        console.log('\nStep 2: Changing room_allocations.student_id from BIGINT to INT...');
        await connection.query(`
            ALTER TABLE room_allocations 
            MODIFY student_id INT NOT NULL
        `);
        console.log('✅ Column type changed successfully');

        // Step 3: Verify the change
        console.log('\nStep 3: Verifying column types...');
        const [studentCol] = await connection.query(`
            SELECT DATA_TYPE, COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'hostel_db' 
            AND TABLE_NAME = 'student' 
            AND COLUMN_NAME = 'student_id'
        `);
        
        const [roomAllocCol] = await connection.query(`
            SELECT DATA_TYPE, COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'hostel_db' 
            AND TABLE_NAME = 'room_allocations' 
            AND COLUMN_NAME = 'student_id'
        `);

        console.log(`student.student_id:              ${studentCol[0].DATA_TYPE} (${studentCol[0].COLUMN_TYPE})`);
        console.log(`room_allocations.student_id:     ${roomAllocCol[0].DATA_TYPE} (${roomAllocCol[0].COLUMN_TYPE})`);

        if (studentCol[0].DATA_TYPE === roomAllocCol[0].DATA_TYPE) {
            console.log('✅ Column types now match!\n');
        } else {
            throw new Error('Column types still do not match!');
        }

        // Step 4: Recreate foreign key constraint with correct table name
        console.log('Step 4: Creating foreign key constraint (referencing student table)...');
        await connection.query(`
            ALTER TABLE room_allocations 
            ADD CONSTRAINT room_allocations_ibfk_1 
            FOREIGN KEY (student_id) 
            REFERENCES student(student_id) 
            ON DELETE CASCADE
        `);
        console.log('✅ Foreign key constraint created successfully');

        // Step 5: Verify the constraint
        console.log('\nStep 5: Verifying foreign key constraints...');
        const [constraints] = await connection.query(`
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'hostel_db'
            AND TABLE_NAME = 'room_allocations'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('\nCurrent foreign key constraints:');
        console.table(constraints);

        console.log('\n✅ Migration completed successfully!');
        console.log('Room allocations should now work properly.');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Error code:', error.code);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixColumnTypeAndFK();
