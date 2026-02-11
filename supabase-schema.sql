-- AmorAccion Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Create campuses table
CREATE TABLE IF NOT EXISTS campuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_code TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    document_type TEXT,
    document_number TEXT,
    birth_date DATE,
    age INTEGER,
    gender TEXT,
    blood_type TEXT,
    allergies TEXT,
    campus_id UUID REFERENCES campuses(id),
    email TEXT,
    phone TEXT,
    address TEXT,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create guardians table
CREATE TABLE IF NOT EXISTS guardians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    document_type TEXT,
    document_number TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    occupation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create student_guardians junction table
CREATE TABLE IF NOT EXISTS student_guardians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_authorized_pickup BOOLEAN DEFAULT true,
    lives_with BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, guardian_id)
);

-- Create class_sessions table
CREATE TABLE IF NOT EXISTS class_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_group_id UUID,
    subject_id UUID,
    teacher_id UUID REFERENCES profiles(id),
    period_id UUID,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    topic TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_session_id UUID REFERENCES class_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    arrival_time TIME,
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(class_session_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all authenticated users for simplicity)
-- Primero eliminamos las policies si existen para evitar errores
DROP POLICY IF EXISTS "Allow all" ON campuses;
DROP POLICY IF EXISTS "Allow all" ON profiles;
DROP POLICY IF EXISTS "Allow all" ON students;
DROP POLICY IF EXISTS "Allow all" ON guardians;
DROP POLICY IF EXISTS "Allow all" ON student_guardians;
DROP POLICY IF EXISTS "Allow all" ON class_sessions;
DROP POLICY IF EXISTS "Allow all" ON attendance_records;

-- Creamos las nuevas policies
CREATE POLICY "Allow all" ON campuses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all" ON profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all" ON students FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all" ON guardians FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all" ON student_guardians FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all" ON class_sessions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all" ON attendance_records FOR ALL TO authenticated USING (true);

-- Insert default campus
INSERT INTO campuses (name, code, address, city, phone, email)
VALUES (
    'Sede Principal',
    'PRINCIPAL',
    'Dirección Principal',
    'Ciudad',
    '3000000000',
    'contacto@amoraccion.org'
)
ON CONFLICT (code) DO NOTHING;