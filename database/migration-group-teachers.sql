-- ============================================
-- MIGRACIÓN: Tabla group_teachers (varios profesores por grupo)
-- Ejecutar en Supabase → SQL Editor
-- ============================================

-- Eliminar columna teacher_id del esquema anterior (un solo profesor)
ALTER TABLE groups DROP COLUMN IF EXISTS teacher_id;

-- Nueva tabla de relación grupo ↔ profesores
CREATE TABLE IF NOT EXISTS group_teachers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, teacher_id)
);

-- RLS
ALTER TABLE group_teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_group_teachers"
  ON group_teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Verificar
SELECT 'group_teachers creada OK' AS resultado;
