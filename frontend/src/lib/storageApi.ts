import { supabase } from './supabaseClient';

// ============================================
// STORAGE API
// ============================================

export const storageAPI = {
  // Subir archivo
  upload: async (
    bucket: string,
    path: string,
    file: File,
    options?: { upsert?: boolean }
  ) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: options?.upsert ?? false,
        contentType: file.type,
      });

    if (error) throw error;
    return { data, error: null };
  },

  // Obtener URL pública
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Eliminar archivo
  delete: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);

    if (error) throw error;
    return { data, error: null };
  },

  // Listar archivos
  list: async (bucket: string, path?: string) => {
    const { data, error } = await supabase.storage.from(bucket).list(path);

    if (error) throw error;
    return { data: data || [], error: null };
  },
};

// ============================================
// HELPERS ESPECÍFICOS
// ============================================

// Subir logo de la organización
export const uploadLogo = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `logo.${fileExt}`;

  const { data, error } = await storageAPI.upload('logos', fileName, file, {
    upsert: true,
  });

  if (error) throw error;

  return storageAPI.getPublicUrl('logos', fileName);
};

// Subir logo de una sede
export const uploadCampusLogo = async (campusId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `campus-${campusId}.${fileExt}`;

  const { error } = await storageAPI.upload('logos', fileName, file, {
    upsert: true,
  });

  if (error) throw error;

  // Cache-busting: usar timestamp para que el navegador cargue la nueva versión
  return storageAPI.getPublicUrl('logos', fileName) + `?t=${Date.now()}`;
};

// Subir foto de estudiante
export const uploadStudentPhoto = async (studentId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${studentId}.${fileExt}`;
  const path = `photos/${fileName}`;

  const { data, error } = await storageAPI.upload(
    'student-photos',
    path,
    file,
    { upsert: true }
  );

  if (error) throw error;

  return storageAPI.getPublicUrl('student-photos', path);
};

// Obtener URL del logo
export const getLogoUrl = () => {
  return storageAPI.getPublicUrl('logos', 'logo.png');
};

// Obtener URL de foto de estudiante
export const getStudentPhotoUrl = (studentId: string) => {
  return storageAPI.getPublicUrl('student-photos', `photos/${studentId}.jpg`);
};

export default storageAPI;
