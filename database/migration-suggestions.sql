-- ============================================
-- MIGRACIÓN: Buzón de sugerencias
-- Ejecutar en Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS suggestions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL CHECK (category IN ('nueva_funcion', 'mejora', 'error', 'comentario')),
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'revisado', 'descartado')),
  created_by  UUID REFERENCES auth.users(id),
  user_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_status   ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions(category);

-- RLS
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede crear
CREATE POLICY "suggestions_insert" ON suggestions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Cada usuario ve sus propias sugerencias; admin ve todas
CREATE POLICY "suggestions_select" ON suggestions
  FOR SELECT TO authenticated USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admin puede actualizar el estado
CREATE POLICY "suggestions_update" ON suggestions
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Permisos RBAC para la página de gestión (solo admin)
INSERT INTO role_permissions (role_name, module, can_view, can_create, can_edit, can_delete)
VALUES ('admin', 'suggestions', true, true, true, true)
ON CONFLICT (role_name, module) DO NOTHING;
