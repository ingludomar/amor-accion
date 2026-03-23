-- ============================================
-- SEED: Grupos correctos + 51 Estudiantes
-- Programa Solidario Amor Acción - Sede Siape
-- Ejecutar en Supabase → SQL Editor
-- ============================================


-- ============================================================
-- PASO 1: Recrear grupos con nombres correctos
-- ============================================================

DELETE FROM students;
DELETE FROM groups;

INSERT INTO groups (id, name, description) VALUES
  (gen_random_uuid(), 'Jardín',        'Grupo Jardín (5 a 7 años)'),
  (gen_random_uuid(), 'Infancia',      'Grupo Infancia (8 a 11 años)'),
  (gen_random_uuid(), 'Pre-Juventud',  'Grupo Pre-Juventud (12 a 16 años)');


-- ============================================================
-- PASO 2: Insertar los 51 estudiantes
-- Se usan subqueries para obtener campus_id y group_id
-- ============================================================

INSERT INTO students (
  student_code, first_name, last_name,
  birth_date, gender, campus_id, group_id, is_active
)
SELECT
  v.student_code,
  v.first_name,
  v.last_name,
  v.birth_date::DATE,
  v.gender,
  (SELECT id FROM campuses LIMIT 1) AS campus_id,
  (SELECT id FROM groups WHERE name = v.grupo) AS group_id,
  true
FROM (VALUES
  -- ── ENERO ──────────────────────────────────────────────
  ('20260001', 'ALANA SOFIA',       'VANEGA FERNANDEZ',     '2019-01-08', 'female', 'Jardín'),
  ('20260002', 'ISRAEL',            'ARTEAGA',               '2018-01-22', 'male',   'Jardín'),
  ('20260003', 'JOSUE',             'ANDASOL ARTEAGA',       '2018-01-22', 'male',   'Jardín'),
  ('20260004', 'HECTOR',            'ARAPE CANTILLO',        '2012-01-30', 'male',   'Pre-Juventud'),
  -- ── FEBRERO ────────────────────────────────────────────
  ('20260005', 'ISRAEL',            'CUETO',                 '2019-02-21', 'male',   'Jardín'),
  -- ── MARZO ──────────────────────────────────────────────
  ('20260006', 'ENMANUEL',          'GUTIERREZ CAMARGO',     '2013-03-16', 'male',   'Infancia'),
  ('20260007', 'ANDREWS DAVID',     'ESCOBAR VALLECILLO',    '2014-03-24', 'male',   'Infancia'),
  -- ── ABRIL ──────────────────────────────────────────────
  ('20260008', 'SIRIANIS',          'RODRIGUEZ',             '2010-04-07', 'female', 'Pre-Juventud'),
  ('20260009', 'JUAN',              'GONZALEZ',              '2015-04-11', 'male',   'Jardín'),
  ('20260010', 'SINAI',             'CUETO',                 '2020-04-17', 'female', 'Jardín'),
  ('20260011', 'VALENTINA',         'HAMBURGUER',            '2012-04-27', 'female', 'Pre-Juventud'),
  -- ── MAYO ───────────────────────────────────────────────
  ('20260012', 'ANGIBEL',           'CANTILLO',              '2015-05-13', 'female', 'Jardín'),
  ('20260013', 'SHERMAN',           'BERRIO RUIZ',           '2009-05-28', 'male',   'Pre-Juventud'),
  -- ── JUNIO ──────────────────────────────────────────────
  ('20260014', 'SHEILY',            'BERRIO RUIZ',           '2014-06-04', 'female', 'Infancia'),
  ('20260015', 'DARWIN',            'ESPINOZA',              '2013-06-06', 'male',   'Infancia'),
  ('20260016', 'GALILEA',           'VALBUENA',              '2016-06-07', 'female', 'Jardín'),
  ('20260017', 'IVANNA',            'PEÑALOZA',              '2015-06-11', 'female', 'Jardín'),
  ('20260018', 'MAIA',              'UDUEÑA ARIZA',          '2014-06-14', 'female', 'Infancia'),
  -- ── JULIO ──────────────────────────────────────────────
  ('20260019', 'LORAINE ANDREA',    'VILCHES',               '2012-07-05', 'female', 'Infancia'),
  ('20260020', 'JOSEPH',            'HAMBURGUER',            '2020-07-08', 'male',   'Jardín'),
  ('20260021', 'JUAN ANTONIO',      'CANTILLO CAMARGO',      '2015-07-14', 'male',   'Infancia'),
  ('20260022', 'MOISES',            'MOLINA MENDOZA',        '2018-07-17', 'male',   'Jardín'),
  ('20260023', 'NAYEUIS SOFIA',     'GONZALEZ',              '2016-07-21', 'female', 'Jardín'),
  -- ── AGOSTO ─────────────────────────────────────────────
  ('20260024', 'ANGELA JANETT',     'AREVALO MENDOZA',       '2014-08-02', 'female', 'Infancia'),
  -- ── SEPTIEMBRE ─────────────────────────────────────────
  ('20260025', 'DANIELA',           'VILLA AREVALO',         '2002-09-01', 'female', 'Jardín'),
  ('20260026', 'DIEGO',             'FERNANDEZ PEREZ',       '2017-09-01', 'male',   'Jardín'),
  ('20260027', 'YELKIN',            'BERRIO RUIZ',           '2020-09-01', 'male',   'Jardín'),
  ('20260028', 'KENAY DAVID',       'MONSALVO',              '2020-09-05', 'male',   'Jardín'),
  ('20260029', 'AYNARA',            'VANEGAS FERNANDEZ',     '2015-09-14', 'female', 'Infancia'),
  ('20260030', 'SAMUEL DE JESUS',   'CAMARGO GUTIERREZ',     '2016-09-15', 'male',   'Infancia'),
  ('20260031', 'KENUIS',            'FERNANDEZ PEREZ',       '2015-09-25', 'male',   'Jardín'),
  ('20260032', 'SHAMIRA',           'CHAVEZ ESTRADA',        '2014-09-25', 'female', 'Jardín'),
  -- ── OCTUBRE ────────────────────────────────────────────
  ('20260033', 'SHARIT CECILIA',    'JULIO',                 '2012-10-08', 'female', 'Infancia'),
  ('20260034', 'CARLOS JOSE',       'RUIZ BARRIOS',          '2016-10-06', 'male',   'Jardín'),
  ('20260035', 'EIDAN JOSE',        'MENDOZA',               '2018-10-07', 'male',   'Jardín'),
  ('20260036', 'JUAN SEBASTIAN',    'FERNANDEZ',             '2018-10-10', 'male',   'Jardín'),
  ('20260037', 'JOEL DAVID',        'DE LA HOZ ORTEGA',      '2016-10-21', 'male',   'Jardín'),
  ('20260038', 'CESAR',             'ORTIZ WARNERS',         '2012-10-25', 'male',   'Infancia'),
  ('20260039', 'DULCE',             'HAMBURGUER',            '2015-10-29', 'female', 'Jardín'),
  -- ── NOVIEMBRE ──────────────────────────────────────────
  ('20260040', 'ADANAI MICETH',     'MEZA GUTIERREZ',        '2014-11-14', 'female', 'Infancia'),
  ('20260041', 'MIGUEL ANGEL',      'MENDOZA TRAVECEDO',     '2015-11-30', 'male',   'Infancia'),
  ('20260042', 'EILEEN SOFIA',      'SANABRIA BLANCO',       '2019-11-25', 'female', 'Jardín'),
  ('20260043', 'JOSTING JULIAN',    'CASTELLAR DIAZ',        '2016-11-26', 'male',   'Jardín'),
  -- ── DICIEMBRE ──────────────────────────────────────────
  ('20260044', 'ANDY DANIEL',       'ORTEGA FERNANDEZ',      '2012-12-01', 'male',   'Infancia'),
  ('20260045', 'VICTORIA',          'DEL VALLE',             '2020-12-03', 'female', 'Jardín'),
  ('20260046', 'SOFIA CAROLINA',    'ROCHA BARRIOS',         '2009-12-09', 'female', 'Pre-Juventud'),
  ('20260047', 'LEWIS',             'ORTEGA FERNANDEZ',      '2011-12-19', 'male',   'Pre-Juventud'),
  ('20260048', 'VALERIA NICOL',     'ARGOTE HERRERA',        '2012-12-21', 'female', 'Infancia'),
  ('20260049', 'JONAIKEL',          'RUIZ ESTRADA',          '2016-12-28', 'male',   'Jardín'),
  ('20260050', 'JULIAN',            'OSORIO',                '2009-12-26', 'male',   'Pre-Juventud'),
  ('20260051', 'SEBASTIAN',         'DIAZ',                  NULL,         'male',   'Jardín')
) AS v(student_code, first_name, last_name, birth_date, gender, grupo);


-- ============================================================
-- PASO 3: Verificación
-- ============================================================

SELECT
  g.name AS grupo,
  COUNT(s.id) AS total_estudiantes
FROM groups g
LEFT JOIN students s ON s.group_id = g.id
GROUP BY g.name
ORDER BY g.name;

SELECT COUNT(*) AS total_estudiantes FROM students;
