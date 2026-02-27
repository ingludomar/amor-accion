-- Feature-004: Gestión de Familias y Acudientes
-- Migration: families, student_families, guardian_families + campos adicionales en guardians

-- ============================================
-- TABLA: families
-- ============================================
CREATE TABLE IF NOT EXISTS families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,                     -- "Familia Rodríguez" (opcional)
    address TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: student_families
-- ============================================
CREATE TABLE IF NOT EXISTS student_families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'hijo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, family_id)
);

-- ============================================
-- TABLA: guardian_families
-- ============================================
CREATE TABLE IF NOT EXISTS guardian_families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    relationship_type TEXT,         -- padre, madre, abuela, tio, tutor
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guardian_id, family_id)
);

-- ============================================
-- MODIFICAR: guardians - agregar campos de teléfonos
-- ============================================
ALTER TABLE guardians 
ADD COLUMN IF NOT EXISTS phone_home TEXT,
ADD COLUMN IF NOT EXISTS phone_mobile TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT,
ADD COLUMN IF NOT EXISTS has_whatsapp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_note TEXT;

-- ============================================
-- RLS - Habilitar y crear políticas
-- ============================================
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_families ENABLE ROW LEVEL SECURITY;

-- Políticas para families
DROP POLICY IF EXISTS "Allow all on families" ON families;
CREATE POLICY "Allow all on families" ON families FOR ALL TO authenticated USING (true);

-- Políticas para student_families
DROP POLICY IF EXISTS "Allow all on student_families" ON student_families;
CREATE POLICY "Allow all on student_families" ON student_families FOR ALL TO authenticated USING (true);

-- Políticas para guardian_families
DROP POLICY IF EXISTS "Allow all on guardian_families" ON guardian_families;
CREATE POLICY "Allow all on guardian_families" ON guardian_families FOR ALL TO authenticated USING (true);

-- ============================================
-- ÍNDICES para mejor rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_student_families_student ON student_families(student_id);
CREATE INDEX IF NOT EXISTS idx_student_families_family ON student_families(family_id);
CREATE INDEX IF NOT EXISTS idx_guardian_families_guardian ON guardian_families(guardian_id);
CREATE INDEX IF NOT EXISTS idx_guardian_families_family ON guardian_families(family_id);
CREATE INDEX IF NOT EXISTS idx_families_active ON families(is_active) WHERE is_active = true;
