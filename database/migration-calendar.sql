-- ============================================
-- MIGRACIÓN: Calendario de eventos
-- Ejecutar en Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  event_date  DATE NOT NULL,
  event_time  TIME,
  event_type  TEXT NOT NULL CHECK (event_type IN ('jornada', 'paseo', 'reunion', 'festivo', 'otro')),
  campus_id   UUID REFERENCES campuses(id),
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_events_select" ON calendar_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "calendar_events_insert" ON calendar_events
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "calendar_events_update" ON calendar_events
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "calendar_events_delete" ON calendar_events
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Permisos RBAC (admin puede gestionar, todos pueden ver)
INSERT INTO role_permissions (role_name, module, can_view, can_create, can_edit, can_delete)
VALUES ('admin', 'calendar', true, true, true, true)
ON CONFLICT (role_name, module) DO NOTHING;

INSERT INTO role_permissions (role_name, module, can_view, can_create, can_edit, can_delete)
VALUES ('profesor', 'calendar', true, false, false, false)
ON CONFLICT (role_name, module) DO NOTHING;
