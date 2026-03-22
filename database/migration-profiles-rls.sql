-- Migration: Add RLS policies for profiles table
-- This allows authenticated users to read and manage profiles

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read all profiles (needed for user management)
CREATE POLICY "Allow authenticated users to read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow users to update their own profile
CREATE POLICY "Allow users to update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow admin to insert new profiles (when creating users)
-- Note: In production, you might want to restrict this to admin roles only
CREATE POLICY "Allow authenticated users to insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';
