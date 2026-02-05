-- Add scheduled_duration column to tasks table
-- This column stores the duration of scheduled tasks in minutes
-- Default is 60 minutes (1 hour)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_duration integer DEFAULT 60;
