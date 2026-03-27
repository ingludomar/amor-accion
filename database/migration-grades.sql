-- ============================================
-- MIGRACIÓN: Sistema de Calificaciones
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS grades (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic_id     UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  score        SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  notes        TEXT,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, topic_id)
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_grades_topic_id   ON grades(topic_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_grades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grades_updated_at
  BEFORE UPDATE ON grades
  FOR EACH ROW EXECUTE FUNCTION update_grades_updated_at();

-- RLS
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver calificaciones
CREATE POLICY "grades_select" ON grades
  FOR SELECT TO authenticated USING (true);

-- Solo usuarios autenticados pueden insertar/actualizar/eliminar
CREATE POLICY "grades_insert" ON grades
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "grades_update" ON grades
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "grades_delete" ON grades
  FOR DELETE TO authenticated USING (true);
