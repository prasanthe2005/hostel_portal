-- Migration: Add more fields to hostels table for complete hostel management
-- Run this after the initial schema creation

USE hostel_db;

-- Add new columns to hostels table (using procedure to check if column exists)
ALTER TABLE hostels 
  ADD COLUMN location VARCHAR(200) DEFAULT 'Main Campus';

ALTER TABLE hostels 
  ADD COLUMN total_floors INT DEFAULT 1;

ALTER TABLE hostels 
  ADD COLUMN total_rooms INT DEFAULT 0;

ALTER TABLE hostels 
  ADD COLUMN icon VARCHAR(50) DEFAULT 'home';

ALTER TABLE hostels 
  ADD COLUMN bg_color VARCHAR(100) DEFAULT 'bg-blue-50 dark:bg-blue-900/20';

ALTER TABLE hostels 
  ADD COLUMN text_color VARCHAR(100) DEFAULT 'text-blue-600';
