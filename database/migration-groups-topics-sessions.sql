-- ============================================
-- MIGRACIÓN: Grupos, Temas y Sesiones
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. GRUPOS (Niños, Jóvenes, Adolescentes)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar los 3 grupos fijos
INSERT INTO groups (name, description) VALUES
  ('Niños',        'Grupo de niños'),
  ('Jóvenes',      'Grupo de jóvenes'),
  ('Adolescentes', 'Grupo de adolescentes')
ON CONFLICT DO NOTHING;

-- Agregar group_id a students
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;

-- 2. TEMAS
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  actual_date DATE,
  is_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SESIONES DE CLASE
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REGISTROS DE ASISTENCIA (reemplaza la tabla anterior si existe)
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('presente', 'ausente', 'excusado')),
  notes TEXT,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- 5. RLS POLICIES
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden leer todo
CREATE POLICY "Authenticated users can read groups"
  ON groups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read topics"
  ON topics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read sessions"
  ON class_sessions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read attendance"
  ON attendance_records FOR SELECT TO authenticated USING (true);

-- Solo admins y coordinadores pueden escribir grupos y temas
CREATE POLICY "Admins can manage groups"
  ON groups FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'coordinador'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'coordinador'));

CREATE POLICY "Admins can manage topics"
  ON topics FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'coordinador'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'coordinador'));

-- Admins y profesores pueden gestionar sesiones y asistencia
CREATE POLICY "Admins and teachers can manage sessions"
  ON class_sessions FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'coordinador', 'profesor'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'coordinador', 'profesor'));

CREATE POLICY "Admins and teachers can manage attendance"
  ON attendance_records FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'coordinador', 'profesor'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'coordinador', 'profesor'));
