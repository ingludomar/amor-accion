-- ============================================
-- MIGRACIÓN: Permitir login con username
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Función que busca el email de un usuario por su username.
-- SECURITY DEFINER permite que se ejecute sin estar autenticado,
-- bypasando RLS. Solo devuelve el email, nada más.
CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM profiles WHERE username = p_username;
  RETURN v_email;
END;
$$;
