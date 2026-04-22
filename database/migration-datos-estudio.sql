-- ============================================
-- MIGRACIÓN: Datos académicos del estudiante
-- Ejecutar en Supabase SQL Editor
-- ============================================

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS school_name  TEXT,
  ADD COLUMN IF NOT EXISTS grade_level  TEXT;
