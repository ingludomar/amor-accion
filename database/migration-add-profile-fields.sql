-- Migration: Add missing columns to profiles table
-- Agrega: document_number, phone, campus_id

-- Add document_number column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS document_number TEXT;

-- Add phone column  
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add campus_id column (si no existe)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS campus_id UUID REFERENCES campuses(id);

-- Verificar todas las columnas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
