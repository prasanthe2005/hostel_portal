USE hostel_db;

-- Sample hostel and rooms
INSERT INTO hostels (hostel_name) VALUES ('Alpha Hostel');
SET @hostel_id = LAST_INSERT_ID();
INSERT INTO floors (hostel_id, floor_number) VALUES (@hostel_id, 1), (@hostel_id, 2);
SET @floor1 = (SELECT floor_id FROM floors WHERE hostel_id=@hostel_id AND floor_number=1 LIMIT 1);
SET @floor2 = (SELECT floor_id FROM floors WHERE hostel_id=@hostel_id AND floor_number=2 LIMIT 1);

INSERT INTO rooms (hostel_id, floor_id, room_number, type, capacity) VALUES
(@hostel_id,@floor1,'101','AC',1),
(@hostel_id,@floor1,'102','Non-AC',1),
(@hostel_id,@floor2,'201','AC',1),
(@hostel_id,@floor2,'202','Non-AC',1);

-- Note: create admin and student accounts using the provided scripts (`npm run create-admin`, `npm run create-student`)
