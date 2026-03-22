-- ============================================
-- SEED: Sede Siape + asignar a todos los estudiantes
-- Ejecutar en Supabase → SQL Editor
-- ============================================

-- 1. Crear la sede Siape
INSERT INTO campuses (name, code, is_active)
VALUES ('Siape', 'SIAPE', true)
ON CONFLICT DO NOTHING;

-- 2. Asignar a todos los estudiantes que no tienen campus
UPDATE students
SET campus_id = (SELECT id FROM campuses WHERE code = 'SIAPE')
WHERE campus_id IS NULL;

-- 3. Verificar
SELECT
  c.name AS sede,
  COUNT(s.id) AS estudiantes
FROM campuses c
LEFT JOIN students s ON s.campus_id = c.id
GROUP BY c.name;
