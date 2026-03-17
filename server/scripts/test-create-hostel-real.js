import pool from '../src/config/db.js';

async function testRealHostelCreation() {
    const connection = await pool.getConnection();
    
    try {
        console.log('🧪 Testing REAL hostel creation (with commit)...\n');

        // Test data - similar to what frontend sends
        const testHostel = {
            hostel_name: 'Test Building Z',
            location: 'West Campus',
            floors: [
                { rooms: 10, type: 'Non-AC' },
                { rooms: 10, type: 'Non-AC' },
                { rooms: 10, type: 'AC' }
            ],
            icon: 'apartment',
            bg_color: 'bg-purple-50 dark:bg-purple-900/20',
            text_color: 'text-purple-600'
        };

        console.log('📋 Hostel data:');
        console.log(JSON.stringify(testHostel, null, 2));

        // Use the exact same logic as the controller
        await connection.beginTransaction();
        console.log('\n✅ Transaction started');

        const total_floors = testHostel.floors.length;
        const total_rooms = testHostel.floors.reduce((sum, f) => sum + (f.rooms || 0), 0);
        
        console.log(`\n1️⃣ Inserting hostel...`);
        console.log(`   Floors: ${total_floors}, Total Rooms: ${total_rooms}`);
        
        const [r] = await connection.query(
            'INSERT INTO hostels (hostel_name, location, total_floors, total_rooms, icon, bg_color, text_color) VALUES (?,?,?,?,?,?,?)',
            [testHostel.hostel_name, testHostel.location, total_floors, total_rooms, testHostel.icon, testHostel.bg_color, testHostel.text_color]
        );
        const hostelId = r.insertId;
        console.log(`✅ Hostel created with ID: ${hostelId}`);

        console.log('\n2️⃣ Creating floors and rooms...');
        for(let i = 0; i < testHostel.floors.length; i++){
            const floorNum = i + 1;
            const floorConfig = testHostel.floors[i];
            const roomsOnFloor = floorConfig.rooms || 0;
            const roomType = floorConfig.type || 'Non-AC';
            
            console.log(`\n   Floor ${floorNum}:`);
            console.log(`   - Rooms: ${roomsOnFloor}`);
            console.log(`   - Type: ${roomType}`);
            
            const [fr] = await connection.query(
                'INSERT INTO floors (hostel_id, floor_number) VALUES (?,?)',
                [hostelId, floorNum]
            );
            const floorId = fr.insertId;
            console.log(`   ✅ Floor ${floorNum} created (ID: ${floorId})`);
            
            const roomCapacity = roomType === 'AC' ? 2 : 4;
            console.log(`   💺 Room capacity: ${roomCapacity} (${roomType})`);
            
            for(let rnum = 1; rnum <= roomsOnFloor; rnum++){
                const roomNumber = `${floorNum}${String(rnum).padStart(2, '0')}`;
                await connection.query(
                    'INSERT INTO rooms (hostel_id, floor_id, room_number, type, capacity) VALUES (?,?,?,?,?)',
                    [hostelId, floorId, roomNumber, roomType, roomCapacity]
                );
            }
            console.log(`   ✅ Created ${roomsOnFloor} rooms`);
        }

        await connection.commit();
        console.log('\n✅ Transaction committed!');

        // Verify creation
        console.log('\n3️⃣ Verifying created hostel...');
        const [hostel] = await connection.query('SELECT * FROM hostels WHERE hostel_id = ?', [hostelId]);
        console.log('\n📦 Created hostel:');
        console.table(hostel);

        const [rooms] = await connection.query(
            'SELECT room_id, room_number, type, capacity FROM rooms WHERE hostel_id = ? ORDER BY room_number LIMIT 10', 
            [hostelId]
        );
        console.log(`\n🚪 Sample of created rooms (showing first 10):`);
        console.table(rooms);

        const [totalRooms] = await connection.query(
            'SELECT COUNT(*) as total FROM rooms WHERE hostel_id = ?', 
            [hostelId]
        );
        console.log(`\n📊 Total rooms created: ${totalRooms[0].total}`);

        console.log('\n✅ Test completed successfully!');
        console.log(`🎉 Hostel "${testHostel.hostel_name}" has been created with ID ${hostelId}`);
        console.log('\nYou can now view it in the admin dashboard.\n');

    } catch (error) {
        try {
            await connection.rollback();
            console.log('\n🔄 Transaction rolled back due to error');
        } catch (e) {
            // Ignore rollback error
        }
        console.error('\n❌ Test failed:', error.message);
        console.error('Error code:', error.code);
        console.error('SQL State:', error.sqlState);
        if (error.sql) {
            console.error('Failed SQL:', error.sql);
        }
    } finally {
        connection.release();
        await pool.end();
    }
}

testRealHostelCreation();
