-- Migration: Add logo_url column to campuses table
-- Run this in Supabase SQL Editor to fix the update issue

-- Add logo_url column if it doesn't exist
ALTER TABLE campuses 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campuses';
