-- ============================================
-- SUPABASE STORAGE CONFIGURATION
-- ============================================

-- Crear buckets para almacenamiento
-- Ejecutar esto en Supabase Dashboard → SQL Editor

-- 1. Crear bucket para logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- 2. Crear bucket para fotos de estudiantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true);

-- 3. Crear bucket para documentos (opcional)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Políticas para bucket 'logos' (público, solo admins pueden subir)
CREATE POLICY "Logos públicos para lectura"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

CREATE POLICY "Solo admins pueden subir logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Políticas para bucket 'student-photos'
CREATE POLICY "Fotos públicas para lectura"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-photos');

CREATE POLICY "Usuarios autenticados pueden subir fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Usuarios autenticados pueden actualizar fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'student-photos');

CREATE POLICY "Usuarios autenticados pueden eliminar fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-photos');

-- ============================================
-- EJEMPLOS DE USO
-- ============================================

-- Subir logo:
-- storage.from('logos').upload('amor-accion-logo.png', file)

-- Subir foto de estudiante:
-- storage.from('student-photos').upload('students/${studentId}.jpg', file)

-- Obtener URL pública:
-- storage.from('logos').getPublicUrl('amor-accion-logo.png')
