-- Migration: Add campus_id column to profiles table
-- This column links users to their primary campus

-- Add campus_id column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS campus_id UUID REFERENCES campuses(id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
