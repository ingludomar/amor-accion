-- ============================================
-- MIGRACIÓN: Sistema de Roles y Permisos
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de permisos por rol y módulo
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  UNIQUE(role_name, module)
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer roles y permisos
CREATE POLICY "authenticated_read_roles" ON roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_role_permissions" ON role_permissions
  FOR SELECT TO authenticated USING (true);

-- Solo admins pueden modificar
CREATE POLICY "admin_manage_roles" ON roles
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_manage_role_permissions" ON role_permissions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- SEED: Roles base
-- ============================================

INSERT INTO roles (name, description) VALUES
  ('admin',       'Acceso total al sistema'),
  ('coordinador', 'Gestión de grupos y temas'),
  ('profesor',    'Toma asistencia de su grupo')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED: Permisos por rol
-- Módulos: dashboard, campuses, users, students,
--          groups, topics, attendance, reports,
--          settings, roles
-- ============================================

-- ADMIN: acceso total
INSERT INTO role_permissions (role_name, module, can_view, can_create, can_edit, can_delete) VALUES
  ('admin', 'dashboard',  true, false, false, false),
  ('admin', 'campuses',   true, true,  true,  true),
  ('admin', 'users',      true, true,  true,  true),
  ('admin', 'students',   true, true,  true,  true),
  ('admin', 'groups',     true, true,  true,  true),
  ('admin', 'topics',     true, true,  true,  true),
  ('admin', 'attendance', true, true,  true,  true),
  ('admin', 'reports',    true, false, false, false),
  ('admin', 'settings',   true, true,  true,  true),
  ('admin', 'roles',      true, true,  true,  true)
ON CONFLICT (role_name, module) DO NOTHING;

-- COORDINADOR: gestión de grupos, temas y estudiantes
INSERT INTO role_permissions (role_name, module, can_view, can_create, can_edit, can_delete) VALUES
  ('coordinador', 'dashboard',  true,  false, false, false),
  ('coordinador', 'campuses',   false, false, false, false),
  ('coordinador', 'users',      false, false, false, false),
  ('coordinador', 'students',   true,  true,  true,  false),
  ('coordinador', 'groups',     true,  true,  true,  false),
  ('coordinador', 'topics',     true,  true,  true,  true),
  ('coordinador', 'attendance', true,  true,  true,  false),
  ('coordinador', 'reports',    true,  false, false, false),
  ('coordinador', 'settings',   false, false, false, false),
  ('coordinador', 'roles',      false, false, false, false)
ON CONFLICT (role_name, module) DO NOTHING;

-- PROFESOR: solo asistencia y consulta
INSERT INTO role_permissions (role_name, module, can_view, can_create, can_edit, can_delete) VALUES
  ('profesor', 'dashboard',  true,  false, false, false),
  ('profesor', 'campuses',   false, false, false, false),
  ('profesor', 'users',      false, false, false, false),
  ('profesor', 'students',   true,  false, false, false),
  ('profesor', 'groups',     true,  false, false, false),
  ('profesor', 'topics',     true,  false, false, false),
  ('profesor', 'attendance', true,  true,  true,  false),
  ('profesor', 'reports',    true,  false, false, false),
  ('profesor', 'settings',   false, false, false, false),
  ('profesor', 'roles',      false, false, false, false)
ON CONFLICT (role_name, module) DO NOTHING;
