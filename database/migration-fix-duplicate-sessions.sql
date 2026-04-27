-- ============================================
-- MIGRACIÓN: Limpiar sesiones duplicadas + prevenir futuros duplicados
-- Ejecutar en Supabase SQL Editor
-- ============================================

BEGIN;

-- 1. Consolidar Jardín 2026-03-01
-- Ganador: dc668af8 (18 registros)
-- Perdedores: 2dfb1c1b (18 registros, mover los que no existan en ganador), 747bc249 (vacío)
UPDATE attendance_records
SET session_id = 'dc668af8-1bcc-41fd-88c7-b60e3ea71204'
WHERE session_id = '2dfb1c1b-4b4f-471a-938e-dede22bc7434'
  AND NOT EXISTS (
    SELECT 1 FROM attendance_records ar2
    WHERE ar2.session_id = 'dc668af8-1bcc-41fd-88c7-b60e3ea71204'
      AND ar2.student_id = attendance_records.student_id
  );

-- Eliminar registros sobrantes (los que ya existían en el ganador)
DELETE FROM attendance_records
WHERE session_id IN (
  '2dfb1c1b-4b4f-471a-938e-dede22bc7434',
  '747bc249-74fa-45ba-a2eb-216ae27d2b42'
);

-- Eliminar las sesiones duplicadas
DELETE FROM class_sessions
WHERE id IN (
  '2dfb1c1b-4b4f-471a-938e-dede22bc7434',
  '747bc249-74fa-45ba-a2eb-216ae27d2b42'
);

-- 2. Consolidar Pre-Juventud 2026-02-01
-- Ganador: 3920dde9 (7 registros)
-- Perdedores: 055452c0 (4), fa2667f0 (5)
UPDATE attendance_records
SET session_id = '3920dde9-4d1f-4464-8012-5e809ac58979'
WHERE session_id IN (
    '055452c0-608c-4540-a0b6-03a2095d8e85',
    'fa2667f0-3816-4d9d-8827-f36c668b1165'
  )
  AND NOT EXISTS (
    SELECT 1 FROM attendance_records ar2
    WHERE ar2.session_id = '3920dde9-4d1f-4464-8012-5e809ac58979'
      AND ar2.student_id = attendance_records.student_id
  );

-- Eliminar registros sobrantes
DELETE FROM attendance_records
WHERE session_id IN (
  '055452c0-608c-4540-a0b6-03a2095d8e85',
  'fa2667f0-3816-4d9d-8827-f36c668b1165'
);

-- Eliminar las sesiones duplicadas
DELETE FROM class_sessions
WHERE id IN (
  '055452c0-608c-4540-a0b6-03a2095d8e85',
  'fa2667f0-3816-4d9d-8827-f36c668b1165'
);

-- 3. Prevenir futuros duplicados con UNIQUE constraint
ALTER TABLE class_sessions
  ADD CONSTRAINT class_sessions_group_date_unique
  UNIQUE (group_id, session_date);

COMMIT;
