-- ============================================
-- MIGRACIÓN: Registro de notificaciones WhatsApp
-- Ejecutar en Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS whatsapp_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id),
  guardian_id UUID REFERENCES guardians(id),
  sent_by     UUID REFERENCES auth.users(id),
  sent_by_name TEXT,
  guardian_name TEXT,
  phone       TEXT,
  message     TEXT,
  consecutive INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_notif_student ON whatsapp_notifications(student_id);

ALTER TABLE whatsapp_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wa_notif_select" ON whatsapp_notifications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "wa_notif_insert" ON whatsapp_notifications
  FOR INSERT TO authenticated WITH CHECK (true);
