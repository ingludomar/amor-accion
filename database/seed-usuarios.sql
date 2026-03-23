-- ============================================
-- SEED: Usuarios del sistema
-- Ejecutar en Supabase → SQL Editor
-- Contraseña inicial para todos: Amor2026!
-- (Cada usuario debe cambiarla al entrar)
-- ============================================

DO $$
DECLARE
  uid_lourdes   UUID := gen_random_uuid();
  uid_alberto   UUID := gen_random_uuid();
  uid_julisa    UUID := gen_random_uuid();
  uid_mariaines UUID := gen_random_uuid();
  uid_iracema   UUID := gen_random_uuid();
  uid_almicar   UUID := gen_random_uuid();
  pass TEXT := crypt('Amor2026!', gen_salt('bf'));
BEGIN

  -- ── Insertar en auth.users ──────────────────────────────
  INSERT INTO auth.users
    (id, instance_id, email, encrypted_password,
     email_confirmed_at, created_at, updated_at,
     raw_app_meta_data, raw_user_meta_data, role, aud)
  VALUES
    (uid_lourdes,   '00000000-0000-0000-0000-000000000000',
     'lourdes.escalante@amoraccion.com', pass,
     NOW(), NOW(), NOW(),
     '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),

    (uid_alberto,   '00000000-0000-0000-0000-000000000000',
     'alberto.gomez@amoraccion.com', pass,
     NOW(), NOW(), NOW(),
     '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),

    (uid_julisa,    '00000000-0000-0000-0000-000000000000',
     'julisa.gonzalez@amoraccion.com', pass,
     NOW(), NOW(), NOW(),
     '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),

    (uid_mariaines, '00000000-0000-0000-0000-000000000000',
     'mariaines.marulanda@amoraccion.com', pass,
     NOW(), NOW(), NOW(),
     '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),

    (uid_iracema,   '00000000-0000-0000-0000-000000000000',
     'iracema.polo@amoraccion.com', pass,
     NOW(), NOW(), NOW(),
     '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),

    (uid_almicar,   '00000000-0000-0000-0000-000000000000',
     'almicar.pertuz@amoraccion.com', pass,
     NOW(), NOW(), NOW(),
     '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')

  ON CONFLICT (id) DO NOTHING;

  -- ── Insertar en profiles ────────────────────────────────
  INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES
    (uid_lourdes,   'lourdes.escalante@amoraccion.com',   'Lourdes Escalante',   'profesor',      true, NOW(), NOW()),
    (uid_alberto,   'alberto.gomez@amoraccion.com',        'Alberto Gomez',        'profesor',      true, NOW(), NOW()),
    (uid_julisa,    'julisa.gonzalez@amoraccion.com',      'Julisa Gonzalez',      'profesor',      true, NOW(), NOW()),
    (uid_mariaines, 'mariaines.marulanda@amoraccion.com',  'Maria Ines Marulanda', 'profesor',      true, NOW(), NOW()),
    (uid_iracema,   'iracema.polo@amoraccion.com',         'Iracema Polo',         'profesor',      true, NOW(), NOW()),
    (uid_almicar,   'almicar.pertuz@amoraccion.com',       'Almicar Pertuz',       'admin',         true, NOW(), NOW())

  ON CONFLICT (id) DO UPDATE SET
    full_name  = EXCLUDED.full_name,
    role       = EXCLUDED.role,
    is_active  = true,
    updated_at = NOW();

END $$;

-- ── Verificación ─────────────────────────────────────────
SELECT full_name, email, role FROM profiles ORDER BY role, full_name;
