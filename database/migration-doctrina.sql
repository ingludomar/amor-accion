-- ============================================
-- MIGRACIÓN: Doctrina AmorAcción (Fase 1)
-- Ejecutar en Supabase SQL Editor
-- ============================================

BEGIN;

-- ─── Cursos de doctrina (uno por día/horario) ─────────────────────
CREATE TABLE IF NOT EXISTS doctrine_courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  -- 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado, 7=domingo
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  prerequisite_id UUID REFERENCES doctrine_courses(id),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctrine_courses_day ON doctrine_courses(day_of_week) WHERE is_active = true;

-- ─── Lecciones (secuenciales por curso) ───────────────────────────
CREATE TABLE IF NOT EXISTS doctrine_lessons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID NOT NULL REFERENCES doctrine_courses(id) ON DELETE CASCADE,
  sequence_number  INT NOT NULL,
  title            TEXT NOT NULL,
  scripture_ref    TEXT,
  description      TEXT,
  planned_date     DATE NOT NULL,
  teacher_id       UUID REFERENCES auth.users(id),
  has_quiz         BOOLEAN DEFAULT false,
  is_done          BOOLEAN DEFAULT false,
  actual_date      DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (course_id, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_doctrine_lessons_course ON doctrine_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_doctrine_lessons_date ON doctrine_lessons(planned_date);

-- ─── Inscripciones (profesor ↔ curso) ─────────────────────────────
CREATE TABLE IF NOT EXISTS doctrine_enrollments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES doctrine_courses(id) ON DELETE CASCADE,
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at  TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','dropped')),
  notes        TEXT,
  UNIQUE (course_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_doctrine_enrollments_course ON doctrine_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_doctrine_enrollments_profile ON doctrine_enrollments(profile_id);

-- ─── Asistencia por lección ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctrine_attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES doctrine_lessons(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL CHECK (status IN ('presente','ausente','excusado')),
  notes       TEXT,
  marked_at   TIMESTAMPTZ DEFAULT NOW(),
  marked_by   UUID REFERENCES auth.users(id),
  UNIQUE (lesson_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_doctrine_attendance_lesson ON doctrine_attendance(lesson_id);
CREATE INDEX IF NOT EXISTS idx_doctrine_attendance_profile ON doctrine_attendance(profile_id);

-- ─── RLS ──────────────────────────────────────────────────────────
ALTER TABLE doctrine_courses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctrine_lessons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctrine_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctrine_attendance  ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier autenticado
CREATE POLICY "doctrine_courses_select"    ON doctrine_courses     FOR SELECT TO authenticated USING (true);
CREATE POLICY "doctrine_lessons_select"    ON doctrine_lessons     FOR SELECT TO authenticated USING (true);
CREATE POLICY "doctrine_enrollments_select" ON doctrine_enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "doctrine_attendance_select" ON doctrine_attendance  FOR SELECT TO authenticated USING (true);

-- Escritura: admin y coordinador
CREATE POLICY "doctrine_courses_write" ON doctrine_courses FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','coordinador')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','coordinador')));

CREATE POLICY "doctrine_lessons_write" ON doctrine_lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','coordinador')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','coordinador')));

CREATE POLICY "doctrine_enrollments_write" ON doctrine_enrollments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','coordinador')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','coordinador')));

CREATE POLICY "doctrine_attendance_write" ON doctrine_attendance FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','coordinador')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','coordinador')));

-- ─── Permisos RBAC en role_permissions ────────────────────────────
INSERT INTO role_permissions (role_name, module, can_view, can_create, can_edit, can_delete) VALUES
  ('admin',        'doctrine_courses',     true, true,  true,  true),
  ('admin',        'doctrine_lessons',     true, true,  true,  true),
  ('admin',        'doctrine_enrollments', true, true,  true,  true),
  ('admin',        'doctrine_attendance',  true, true,  true,  true),
  ('coordinador',  'doctrine_courses',     true, false, false, false),
  ('coordinador',  'doctrine_lessons',     true, true,  true,  false),
  ('coordinador',  'doctrine_enrollments', true, false, false, false),
  ('coordinador',  'doctrine_attendance',  true, true,  true,  false),
  ('profesor',     'doctrine_courses',     true, false, false, false),
  ('profesor',     'doctrine_lessons',     true, false, false, false),
  ('profesor',     'doctrine_enrollments', true, false, false, false),
  ('profesor',     'doctrine_attendance',  true, false, false, false)
ON CONFLICT (role_name, module) DO NOTHING;

COMMIT;
