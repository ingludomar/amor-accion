-- ============================================
-- SCRIPT PARA CONFIRMAR EMAIL DEL ADMIN
-- Ejecutar en: https://supabase.com/dashboard/project/ejfmmyjoyrkffcmhjggu/sql-editor
-- ============================================

-- Actualizar el usuario para confirmar su email
-- (Solo actualizamos email_confirmed_at, confirmed_at se genera automáticamente)
UPDATE auth.users
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'admin@amoraccion.com';

-- Verificar que se actualizó
SELECT email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'admin@amoraccion.com';
