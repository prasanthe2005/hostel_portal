-- Add reason column to room_change_requests table
ALTER TABLE room_change_requests 
ADD COLUMN reason TEXT AFTER choice3;
