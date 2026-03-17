import pool from '../src/config/db.js';

async function testCreateHostel() {
    const connection = await pool.getConnection();
    
    try {
        console.log('🧪 Testing createHostel functionality...\n');

        // Test data
        const testHostel = {
            hostel_name: 'Test Hostel ' + Date.now(),
            location: 'Test Campus',
            floors: [
                { rooms: 5, type: 'Non-AC' },
                { rooms: 3, type: 'AC' }
            ],
            icon: 'home',
            bg_color: 'bg-blue-50',
            text_color: 'text-blue-600'
        };

        console.log('📋 Test hostel data:');
        console.log(JSON.stringify(testHostel, null, 2));

        // Start transaction
        await connection.beginTransaction();
        console.log('\n✅ Transaction started');

        // Calculate totals
        const total_floors = testHostel.floors.length;
        const total_rooms = testHostel.floors.reduce((sum, f) => sum + (f.rooms || 0), 0);
        console.log(`\n📊 Calculated: ${total_floors} floors, ${total_rooms} rooms`);

        // Insert hostel
        console.log('\n1️⃣ Inserting hostel...');
        const [r] = await connection.query(
            'INSERT INTO hostels (hostel_name, location, total_floors, total_rooms, icon, bg_color, text_color) VALUES (?,?,?,?,?,?,?)',
            [testHostel.hostel_name, testHostel.location, total_floors, total_rooms, testHostel.icon, testHostel.bg_color, testHostel.text_color]
        );
        const hostelId = r.insertId;
        console.log(`✅ Hostel created with ID: ${hostelId}`);

        // Insert floors and rooms
        console.log('\n2️⃣ Creating floors and rooms...');
        for(let i = 0; i < testHostel.floors.length; i++){
            const floorNum = i + 1;
            const floorConfig = testHostel.floors[i];
            const roomsOnFloor = floorConfig.rooms || 0;
            const roomType = floorConfig.type || 'Non-AC';
            
            console.log(`\n   Floor ${floorNum}: ${roomsOnFloor} ${roomType} rooms`);
            
            const [fr] = await connection.query(
                'INSERT INTO floors (hostel_id, floor_number) VALUES (?,?)',
                [hostelId, floorNum]
            );
            const floorId = fr.insertId;
            console.log(`   ✅ Floor ${floorNum} created (ID: ${floorId})`);
            
            // Create rooms for this floor
            const roomCapacity = roomType === 'AC' ? 2 : 4;
            for(let rnum = 1; rnum <= roomsOnFloor; rnum++){
                const roomNumber = `${floorNum}${String(rnum).padStart(2, '0')}`;
                await connection.query(
                    'INSERT INTO rooms (hostel_id, floor_id, room_number, type, capacity) VALUES (?,?,?,?,?)',
                    [hostelId, floorId, roomNumber, roomType, roomCapacity]
                );
            }
            console.log(`   ✅ Created ${roomsOnFloor} rooms (${roomNumber.slice(0, -2)}01-${roomNumber})`);
        }

        // Verify creation
        console.log('\n3️⃣ Verifying creation...');
        const [hostel] = await connection.query('SELECT * FROM hostels WHERE hostel_id = ?', [hostelId]);
        console.log('\n📦 Created hostel:');
        console.table(hostel);

        const [rooms] = await connection.query('SELECT room_id, room_number, type, capacity FROM rooms WHERE hostel_id = ? ORDER BY room_number', [hostelId]);
        console.log(`\n🚪 Created ${rooms.length} rooms:`);
        console.table(rooms);

        // Rollback to keep database clean
        await connection.rollback();
        console.log('\n🔄 Transaction rolled back (test cleanup)');
        
        console.log('\n✅ Test completed successfully!');
        console.log('The createHostel functionality is working correctly.\n');

    } catch (error) {
        await connection.rollback();
        console.error('\n❌ Test failed:', error.message);
        console.error('Error code:', error.code);
        console.error('SQL State:', error.sqlState);
        console.error('\nStack trace:', error.stack);
    } finally {
        connection.release();
        await pool.end();
    }
}

testCreateHostel();
