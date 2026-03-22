-- ============================================
-- MIGRACIÓN COMPLETA: Limpieza y restructuración
-- Fecha: 2026-03-21
-- Ejecutar en Supabase → SQL Editor
-- ============================================
-- Diagnóstico antes de correr:
--   ELIMINAMOS: families, student_families, guardian_families
--   RECREAMOS:  class_sessions, attendance_records (esquema viejo, vacías)
--   CREAMOS:    groups, topics
--   MODIFICAMOS: students (agregar group_id)
-- ============================================


-- ============================================================
-- PASO 1: Eliminar tablas obsoletas (todas vacías, seguro)
-- ============================================================

DROP TABLE IF EXISTS guardian_families CASCADE;
DROP TABLE IF EXISTS student_families CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- Eliminar las tablas con esquema viejo (estaban vacías)
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS class_sessions CASCADE;


-- ============================================================
-- PASO 2: Crear tabla GRUPOS (Niños, Jóvenes, Adolescentes)
-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  teacher_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar los 3 grupos fijos (idempotente)
INSERT INTO groups (name, description) VALUES
  ('Niños',        'Grupo de niños')
ON CONFLICT DO NOTHING;

INSERT INTO groups (name, description) VALUES
  ('Jóvenes',      'Grupo de jóvenes')
ON CONFLICT DO NOTHING;

INSERT INTO groups (name, description) VALUES
  ('Adolescentes', 'Grupo de adolescentes')
ON CONFLICT DO NOTHING;


-- ============================================================
-- PASO 3: Agregar group_id a students
-- ============================================================

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;


-- ============================================================
-- PASO 4: Crear tabla TEMAS
-- ============================================================

CREATE TABLE IF NOT EXISTS topics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  group_id     UUID REFERENCES groups(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  actual_date  DATE,
  is_done      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- PASO 5: Recrear CLASS_SESSIONS con esquema correcto
-- ============================================================

CREATE TABLE class_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  topic_id     UUID REFERENCES topics(id) ON DELETE SET NULL,
  teacher_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- PASO 6: Recrear ATTENDANCE_RECORDS con esquema correcto
-- ============================================================

CREATE TABLE attendance_records (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status     TEXT NOT NULL CHECK (status IN ('presente', 'ausente', 'excusado')),
  notes      TEXT,
  marked_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);


-- ============================================================
-- PASO 7: RLS — Row Level Security
-- Política simple: cualquier usuario autenticado puede leer y escribir.
-- La seguridad la da el login (solo el equipo accede).
-- ============================================================

ALTER TABLE groups           ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Grupos
CREATE POLICY "auth_all_groups"
  ON groups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Temas
CREATE POLICY "auth_all_topics"
  ON topics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sesiones
CREATE POLICY "auth_all_sessions"
  ON class_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Asistencia
CREATE POLICY "auth_all_attendance"
  ON attendance_records FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ============================================================
-- PASO 8: Verificación final
-- ============================================================

SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS num_cols
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
