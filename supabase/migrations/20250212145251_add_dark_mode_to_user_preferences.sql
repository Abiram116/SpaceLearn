-- Migration to add dark_mode column to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN dark_mode BOOLEAN DEFAULT FALSE;
