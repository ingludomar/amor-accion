-- ============================================
-- MIGRACIÓN: Configuración global de la app
-- Ejecutar en Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer
CREATE POLICY "app_settings_select" ON app_settings
  FOR SELECT TO authenticated USING (true);

-- Solo admin puede modificar
CREATE POLICY "app_settings_update" ON app_settings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "app_settings_insert" ON app_settings
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Valor por defecto: umbral de 3 ausencias mensuales
INSERT INTO app_settings (key, value)
VALUES ('absence_threshold', '3')
ON CONFLICT (key) DO NOTHING;
