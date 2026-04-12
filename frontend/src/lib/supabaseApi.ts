import { supabase } from './supabaseClient';

// ============================================
// TIPOS BASE
// ============================================

export interface Campus {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  is_primary?: boolean;
  logo_url?: string;
  created_at: string;
}

export interface Student {
  id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  document_type?: string;
  document_number?: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  blood_type?: string;
  allergies?: string;
  campus_id: string;
  group_id?: string;
  group?: { id: string; name: string };
  email?: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  guardians?: Guardian[];
}

export interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  document_type?: string;
  document_number?: string;
  phone_home?: string;
  phone_mobile?: string;
  whatsapp_phone?: string;
  has_whatsapp?: boolean;
  whatsapp_note?: string;
  email?: string;
  address?: string;
  occupation?: string;
  is_primary?: boolean;
  relationship_type?: string;
}

export interface GuardianRelationship {
  id: string;
  student_id: string;
  guardian_id: string;
  relationship_type: string;
  is_primary: boolean;
  is_authorized_pickup: boolean;
  lives_with: boolean;
  notes?: string;
  guardian?: Guardian;
}


export type CreateGuardianRequest = Omit<Guardian, 'id' | 'full_name'>;
export type UpdateGuardianRequest = Partial<CreateGuardianRequest>;


// ============================================
// ATTENDANCE API
// ============================================

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum RelationshipType {
  PADRE = 'padre',
  MADRE = 'madre',
  ACUDIENTE = 'acudiente',
  OTRO = 'otro',
}

// Tipos de request
export type CreateStudentRequest = Omit<Student, 'id' | 'created_at' | 'student_code' | 'full_name' | 'age'> & {
  campus_id?: string;
};
export type UpdateStudentRequest = Partial<Omit<Student, 'id' | 'created_at' | 'student_code'>>;
export type GuardianCreate = Omit<Guardian, 'id' | 'full_name'> & {
  relationship_type: RelationshipType;
  is_primary: boolean;
  is_authorized_pickup: boolean;
  lives_with: boolean;
  notes?: string;
};
export type GuardianSearchResult = Guardian & {
  student_count: number;
};

// ============================================
// CAMPUS API
// ============================================

export const campusAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('campuses')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return { data: data || [], error: null };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('campuses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },

  create: async (campus: Omit<Campus, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('campuses')
      .insert(campus)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },

  update: async (id: string, campus: Partial<Campus>) => {
    const { data, error } = await supabase
      .from('campuses')
      .update(campus)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('campuses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  },
};

// ============================================
// STUDENTS API
// ============================================

export const studentAPI = {
  getAll: async (params?: { campus_id?: string; group_id?: string; is_active?: boolean; search?: string }) => {
    let query = supabase
      .from('students')
      .select(`
        *,
        group:groups(id, name),
        student_guardians(
          relationship_type,
          is_primary,
          guardian:guardians(*)
        )
      `);
    
    if (params?.campus_id) query = query.eq('campus_id', params.campus_id);
    if (params?.group_id)  query = query.eq('group_id', params.group_id);
    if (params?.is_active !== undefined) query = query.eq('is_active', params.is_active);
    if (params?.search) query = query.or(`full_name.ilike.%${params.search}%,student_code.ilike.%${params.search}%`);

    const { data, error } = await query.order('full_name');
    if (error) throw error;

    const transformedData = data?.map(student => ({
      ...student,
      guardians: student.student_guardians?.map((sg: any) => ({
        ...sg.guardian,
        relationship_type: sg.relationship_type,
        is_primary: sg.is_primary,
      })) || [],
    })) || [];
    
    return { data: transformedData, error: null };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        student_guardians(
          guardian:guardians(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transformar datos
    const transformedData = {
      ...data,
      guardians: data.student_guardians?.map((sg: any) => sg.guardian) || []
    };
    
    return { data: transformedData, error: null };
  },

  create: async (student: Omit<Student, 'id' | 'created_at' | 'student_code'>) => {
    // Generar código de estudiante automáticamente
    const studentCode = await generateStudentCode(student.campus_id);
    
    const { data, error } = await supabase
      .from('students')
      .insert({ ...student, student_code: studentCode })
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },

  update: async (id: string, student: Partial<Student>) => {
    const { data, error } = await supabase
      .from('students')
      .update(student)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  },

  // Guardians
  addGuardian: async (studentId: string, guardianId: string, relationshipType: string = 'otro', isPrimary: boolean = false) => {
    const { data, error } = await supabase
      .from('student_guardians')
      .insert({
        student_id: studentId,
        guardian_id: guardianId,
        relationship_type: relationshipType,
        is_primary: isPrimary,
        is_authorized_pickup: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },

  removeGuardian: async (studentId: string, guardianId: string) => {
    const { error } = await supabase
      .from('student_guardians')
      .delete()
      .eq('student_id', studentId)
      .eq('guardian_id', guardianId);
    
    if (error) throw error;
    return { error: null };
  },

};

// ============================================
// GUARDIANS API
// ============================================

export const guardianAPI = {
  getAll: async (search?: string) => {
    let query = supabase.from('guardians').select('*');
    
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,document_number.ilike.%${search}%`);
    }
    
    const { data, error } = await query.order('full_name');
    
    if (error) throw error;
    return { data: data || [], error: null };
  },

  create: async (guardian: Omit<Guardian, 'id' | 'full_name'>) => {
    const { data, error } = await supabase
      .from('guardians')
      .insert(guardian)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },

  update: async (id: string, guardian: Partial<Guardian>) => {
    const { full_name, ...updates } = guardian;
    
    const { data, error } = await supabase
      .from('guardians')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },
};


// ============================================
// ATTENDANCE API
// ============================================

export const attendanceAPI = {
  getRecords: async (params: { 
    class_session_id?: string; 
    student_id?: string; 
    date?: string;
    campus_id?: string;
  }) => {
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        student:students(*)
      `);
    
    if (params.class_session_id) {
      query = query.eq('class_session_id', params.class_session_id);
    }
    
    if (params.student_id) {
      query = query.eq('student_id', params.student_id);
    }
    
    if (params.campus_id) {
      query = query.eq('campus_id', params.campus_id);
    }

    const { data, error } = await query.order('marked_at', { ascending: false });
    
    if (error) throw error;
    return { data: data || [], error: null };
  },

  markAttendance: async (record: Omit<AttendanceRecord, 'id' | 'marked_at'>) => {
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert({
        ...record,
        marked_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },

  getClassSessions: async (params: { date?: string; campus_id?: string }) => {
    let query = supabase.from('class_sessions').select('*');
    
    if (params.date) {
      query = query.eq('date', params.date);
    }
    
    if (params.campus_id) {
      query = query.eq('campus_id', params.campus_id);
    }

    const { data, error } = await query.order('start_time');
    
    if (error) throw error;
    return { data: data || [], error: null };
  },
};

// ============================================
// UTILIDADES
// ============================================

async function generateStudentCode(_campusId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = String(year);

  // Buscar el código más alto del año actual en TODOS los estudiantes
  const { data, error } = await supabase
    .from('students')
    .select('student_code')
    .like('student_code', `${prefix}%`)
    .order('student_code', { ascending: false })
    .limit(1);

  if (error) {
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }

  let sequence = 1;
  if (data && data.length > 0) {
    const lastSequence = parseInt(data[0].student_code.slice(-4));
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `${prefix}${sequence.toString().padStart(4, '0')}`;
}

// ============================================
// USERS API (for admin user management)
// ============================================

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface UserDetail {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  document_number?: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  campus_id?: string;
}

export interface CreateUserRequest {
  email: string;
  username?: string;
  password: string;
  full_name?: string;
  document_type?: string;
  document_number?: string;
  phone?: string;
  role_ids?: string[];
  campus_id?: string; // Solo un campus, no array
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  full_name?: string;
  document_type?: string;
  document_number?: string;
  phone?: string;
  role_ids?: string[];
  campus_id?: string; // Solo un campus
  is_active?: boolean;
}

export const userAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { 
      data: { 
        data: data || [],
        items: data || []
      }, 
      error: null 
    };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },

  getRoles: async () => {
    return {
      data: {
        data: {
          items: [
            { id: 'admin', name: 'Administrador', description: 'Acceso total al sistema' },
            { id: 'coordinador', name: 'Coordinador', description: 'Gestión de grupos y temas' },
            { id: 'profesor', name: 'Profesor', description: 'Toma asistencia de su grupo' }
          ]
        }
      },
      error: null
    };
  },

  create: async (userData: CreateUserRequest) => {
    // Crear usuario con signUp y confirmación automática
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          username: userData.username,
        }
      }
    });
    
    // Verificar si hubo error
    if (authError) {
      console.error('Error creating auth user:', authError);
      throw new Error('Error al crear usuario: ' + authError.message);
    }
    
    // Verificar que se creó el usuario
    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // Si el usuario ya existe (signIn con mismo email), obtenerlo
    let userId = authData.user.id;
    
    // Si no hay usuario pero tampoco error, puede que ya exista
    if (!userId && authData.session) {
      const { data: userData } = await supabase.auth.getUser();
      userId = userData.user?.id;
    }
    
    if (!userId) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    // Crear perfil asociado
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name,
        document_number: userData.document_number,
        phone: userData.phone,
        role: userData.role_ids?.[0] || 'user',
        campus_id: userData.campus_id,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creando perfil:', error);
      throw new Error('Error al crear el perfil del usuario: ' + error.message);
    }
    
    return { data, error: null };
  },

  update: async (id: string, userData: UpdateUserRequest) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name,
        document_number: userData.document_number,
        phone: userData.phone,
        role: userData.role_ids?.[0],
        campus_id: userData.campus_id,
        is_active: userData.is_active,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  },

  delete: async (id: string) => {
    // First delete from auth (this will cascade to profiles)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      // If admin delete fails, just delete from profiles
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
    
    return { error: null };
  },
};

// ============================================
// GRUPOS API
// ============================================

export interface Group {
  id: string;
  name: string;
  description?: string;
  teacher_id?: string;
  teacher?: UserDetail;
  is_active: boolean;
  created_at: string;
}

export const groupAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*, group_teachers(teacher_id)')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return { data: data || [], error: null };
  },

  addTeacher: async (groupId: string, teacherId: string) => {
    const { data, error } = await supabase
      .from('group_teachers')
      .insert({ group_id: groupId, teacher_id: teacherId })
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  },

  removeTeacher: async (groupId: string, teacherId: string) => {
    const { error } = await supabase
      .from('group_teachers')
      .delete()
      .eq('group_id', groupId)
      .eq('teacher_id', teacherId);
    if (error) throw error;
    return { error: null };
  },
};

// ============================================
// TEMAS API
// ============================================

export interface Topic {
  id: string;
  title: string;
  description?: string;
  group_id: string;
  group?: Group;
  planned_date: string;
  actual_date?: string;
  is_done: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateTopicRequest = Omit<Topic, 'id' | 'created_at' | 'updated_at' | 'group' | 'is_done'>;
export type UpdateTopicRequest = Partial<Omit<Topic, 'id' | 'created_at' | 'group'>>;

export const topicAPI = {
  getAll: async (filters?: { group_id?: string; is_done?: boolean }) => {
    let query = supabase
      .from('topics')
      .select('*, group:groups(id, name)')
      .order('planned_date', { ascending: true });

    if (filters?.group_id) query = query.eq('group_id', filters.group_id);
    if (filters?.is_done !== undefined) query = query.eq('is_done', filters.is_done);

    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [], error: null };
  },

  create: async (topic: CreateTopicRequest) => {
    const { data, error } = await supabase
      .from('topics')
      .insert({ ...topic, is_done: false })
      .select('*, group:groups(id, name)')
      .single();
    if (error) throw error;
    return { data, error: null };
  },

  update: async (id: string, topic: UpdateTopicRequest) => {
    const { data, error } = await supabase
      .from('topics')
      .update({ ...topic, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, group:groups(id, name)')
      .single();
    if (error) throw error;
    return { data, error: null };
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('topics').delete().eq('id', id);
    if (error) throw error;
    return { error: null };
  },
};

// ============================================
// SESIONES Y ASISTENCIA API
// ============================================

export interface ClassSession {
  id: string;
  group_id: string;
  group?: Group;
  topic_id?: string;
  topic?: Topic;
  teacher_id?: string;
  session_date: string;
  notes?: string;
  created_at: string;
}

export type AttendanceStatus = 'presente' | 'ausente' | 'excusado';

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  student?: Student;
  status: AttendanceStatus;
  notes?: string;
  marked_at: string;
}

export const sessionAPI = {
  getAll: async (filters?: { group_id?: string; date_from?: string; date_to?: string }) => {
    let query = supabase
      .from('class_sessions')
      .select('*, group:groups(id, name), topic:topics(id, title)')
      .order('session_date', { ascending: false });

    if (filters?.group_id) query = query.eq('group_id', filters.group_id);
    if (filters?.date_from) query = query.gte('session_date', filters.date_from);
    if (filters?.date_to) query = query.lte('session_date', filters.date_to);

    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [], error: null };
  },

  create: async (session: Omit<ClassSession, 'id' | 'created_at' | 'group' | 'topic'>) => {
    const { data, error } = await supabase
      .from('class_sessions')
      .insert(session)
      .select('*, group:groups(id, name), topic:topics(id, title)')
      .single();
    if (error) throw error;
    return { data, error: null };
  },

  getAttendance: async (sessionId: string) => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, student:students(id, full_name, student_code, photo_url, group_id)')
      .eq('session_id', sessionId);
    if (error) throw error;
    return { data: data || [], error: null };
  },

  markAttendance: async (sessionId: string, studentId: string, status: AttendanceStatus, notes?: string) => {
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert({ session_id: sessionId, student_id: studentId, status, notes, marked_at: new Date().toISOString() },
               { onConflict: 'session_id,student_id' })
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  },
};

// ============================================
// REPORTES API
// ============================================

export const reportAPI = {
  byStudent: async (studentId: string, dateFrom: string, dateTo: string) => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, session:class_sessions(session_date, group:groups(name))')
      .eq('student_id', studentId)
      .gte('session:class_sessions.session_date', dateFrom)
      .lte('session:class_sessions.session_date', dateTo);
    if (error) throw error;
    return { data: data || [], error: null };
  },

  byGroup: async (groupId: string, dateFrom: string, dateTo: string) => {
    const { data, error } = await supabase
      .from('class_sessions')
      .select(`
        id, session_date, topic:topics(title),
        attendance_records(status, student:students(id, full_name, student_code))
      `)
      .eq('group_id', groupId)
      .gte('session_date', dateFrom)
      .lte('session_date', dateTo)
      .order('session_date');
    if (error) throw error;
    return { data: data || [], error: null };
  },

  general: async (dateFrom: string, dateTo: string) => {
    const { data, error } = await supabase
      .from('class_sessions')
      .select(`
        id, session_date, group:groups(name),
        attendance_records(status)
      `)
      .gte('session_date', dateFrom)
      .lte('session_date', dateTo)
      .order('session_date');
    if (error) throw error;
    return { data: data || [], error: null };
  },
};

// ============================================
// GRADES API
// ============================================

export interface Grade {
  id: string;
  student_id: string;
  topic_id: string;
  score: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string; student_code: string };
  topic?: { id: string; title: string };
}

export const gradeAPI = {
  // Obtener todas las calificaciones de un tema (con datos del estudiante)
  getByTopic: async (topicId: string) => {
    const { data, error } = await supabase
      .from('grades')
      .select('*, student:students(id, full_name, student_code)')
      .eq('topic_id', topicId);
    if (error) throw error;
    return data as Grade[];
  },

  // Obtener todas las calificaciones de un estudiante (con datos del tema)
  getByStudent: async (studentId: string) => {
    const { data, error } = await supabase
      .from('grades')
      .select('*, topic:topics(id, title, planned_date, group:groups(name))')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Grade[];
  },

  // Insertar o actualizar una calificación (upsert por student_id + topic_id)
  upsert: async (grade: { student_id: string; topic_id: string; score: number; notes?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('grades')
      .upsert({ ...grade, created_by: user?.id }, { onConflict: 'student_id,topic_id' })
      .select();
    if (error) throw error;
    return data;
  },

  // Upsert múltiples calificaciones a la vez
  upsertBatch: async (grades: { student_id: string; topic_id: string; score: number; notes?: string }[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    const rows = grades.map(g => ({ ...g, created_by: user?.id }));
    const { data, error } = await supabase
      .from('grades')
      .upsert(rows, { onConflict: 'student_id,topic_id' })
      .select();
    if (error) throw error;
    return data;
  },
};

// ============================================
// GRADE SCALE API
// ============================================

export interface GradeScale {
  score: number;
  label: string;
  color: string;
}

export const gradeScaleAPI = {
  getAll: async (): Promise<GradeScale[]> => {
    const { data, error } = await supabase
      .from('grade_scale')
      .select('*')
      .order('score');
    if (error) throw error;
    return data as GradeScale[];
  },

  update: async (score: number, label: string, color: string): Promise<void> => {
    const { error } = await supabase
      .from('grade_scale')
      .update({ label, color })
      .eq('score', score);
    if (error) throw error;
  },
};

// ============================================
// SUGGESTIONS API
// ============================================

export type SuggestionCategory = 'nueva_funcion' | 'mejora' | 'error' | 'comentario';
export type SuggestionStatus   = 'pendiente' | 'revisado' | 'descartado';

export interface Suggestion {
  id: string;
  category: SuggestionCategory;
  message: string;
  status: SuggestionStatus;
  created_by?: string;
  user_name?: string;
  created_at: string;
}

export const suggestionAPI = {
  create: async (category: SuggestionCategory, message: string, userName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('suggestions').insert({
      category, message, created_by: user?.id, user_name: userName,
    });
    if (error) throw error;
  },

  getAll: async (filters?: { status?: SuggestionStatus; category?: SuggestionCategory }) => {
    let query = supabase.from('suggestions').select('*').order('created_at', { ascending: false });
    if (filters?.status)   query = query.eq('status', filters.status);
    if (filters?.category) query = query.eq('category', filters.category);
    const { data, error } = await query;
    if (error) throw error;
    return data as Suggestion[];
  },

  updateStatus: async (id: string, status: SuggestionStatus) => {
    const { error } = await supabase.from('suggestions').update({ status }).eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// ABSENCE ANALYSIS API
// ============================================

export interface AbsenceAnalysis {
  consecutive: number;     // ausencias consecutivas actuales (desde la última sesión hacia atrás)
  yearTotal: number;       // total ausencias en el año
  yearSessions: number;    // total sesiones en el año donde participó el grupo del estudiante
}

export const absenceAPI = {
  /**
   * Analiza las ausencias de un estudiante:
   * - Cuenta ausencias consecutivas recientes (desde la última sesión hacia atrás)
   * - Cuenta total de ausencias en el año
   */
  analyze: async (studentId: string, groupId: string): Promise<AbsenceAnalysis> => {
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    // Obtener todas las sesiones del grupo en el año, ordenadas por fecha desc
    const { data: sessions } = await supabase
      .from('class_sessions')
      .select('id, session_date')
      .eq('group_id', groupId)
      .gte('session_date', yearStart)
      .order('session_date', { ascending: false });

    if (!sessions?.length) return { consecutive: 0, yearTotal: 0, yearSessions: 0 };

    const sessionIds = sessions.map(s => s.id);

    // Obtener todos los registros de asistencia de este estudiante en esas sesiones
    const { data: records } = await supabase
      .from('attendance_records')
      .select('session_id, status')
      .eq('student_id', studentId)
      .in('session_id', sessionIds);

    const recordMap: Record<string, string> = {};
    (records ?? []).forEach((r: any) => { recordMap[r.session_id] = r.status; });

    // Contar consecutivas desde la sesión más reciente hacia atrás
    let consecutive = 0;
    for (const session of sessions) {
      const status = recordMap[session.id];
      if (status === 'ausente' || !status) {
        // ausente o sin registro = cuenta como ausencia
        consecutive++;
      } else {
        break; // presente o excusado rompe la racha
      }
    }

    // Contar total de ausencias en el año
    let yearTotal = 0;
    for (const session of sessions) {
      const status = recordMap[session.id];
      if (status === 'ausente') yearTotal++;
    }

    return { consecutive, yearTotal, yearSessions: sessions.length };
  },

  /**
   * Obtiene estudiantes en riesgo (con N+ ausencias consecutivas)
   * para mostrar en el dashboard
   */
  getAtRisk: async (threshold: number): Promise<{ student_id: string; name: string; code: string; group: string; consecutive: number; yearTotal: number }[]> => {
    // Obtener todos los estudiantes activos con su grupo
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, student_code, group_id, group:groups(name)')
      .eq('is_active', true);

    if (!students?.length) return [];

    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    // Obtener todas las sesiones del año
    const { data: sessions } = await supabase
      .from('class_sessions')
      .select('id, session_date, group_id')
      .gte('session_date', yearStart)
      .order('session_date', { ascending: false });

    if (!sessions?.length) return [];

    // Obtener todos los registros de asistencia del año
    const sessionIds = sessions.map(s => s.id);
    const { data: records } = await supabase
      .from('attendance_records')
      .select('session_id, student_id, status')
      .in('session_id', sessionIds);

    // Indexar registros por student_id + session_id
    const recordMap: Record<string, string> = {};
    (records ?? []).forEach((r: any) => {
      recordMap[`${r.student_id}_${r.session_id}`] = r.status;
    });

    // Agrupar sesiones por grupo
    const sessionsByGroup: Record<string, typeof sessions> = {};
    sessions.forEach(s => {
      if (!sessionsByGroup[s.group_id]) sessionsByGroup[s.group_id] = [];
      sessionsByGroup[s.group_id].push(s);
    });

    const results: { student_id: string; name: string; code: string; group: string; consecutive: number; yearTotal: number }[] = [];

    for (const student of students as any[]) {
      if (!student.group_id) continue;
      const groupSessions = sessionsByGroup[student.group_id];
      if (!groupSessions?.length) continue;

      let consecutive = 0;
      let yearTotal = 0;

      for (const session of groupSessions) {
        const status = recordMap[`${student.id}_${session.id}`];
        if (status === 'ausente') yearTotal++;
      }

      for (const session of groupSessions) {
        const status = recordMap[`${student.id}_${session.id}`];
        if (status === 'ausente' || !status) {
          consecutive++;
        } else {
          break;
        }
      }

      if (consecutive >= threshold) {
        results.push({
          student_id: student.id,
          name: student.full_name,
          code: student.student_code,
          group: student.group?.name ?? '',
          consecutive,
          yearTotal,
        });
      }
    }

    return results.sort((a, b) => b.consecutive - a.consecutive);
  },
};

// ============================================
// APP SETTINGS API
// ============================================

export const appSettingsAPI = {
  get: async (key: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data?.value ?? null;
  },

  set: async (key: string, value: string): Promise<void> => {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw error;
  },
};

export default {
  campusAPI,
  studentAPI,
  guardianAPI,
  groupAPI,
  topicAPI,
  sessionAPI,
  reportAPI,
  attendanceAPI,
  userAPI,
  gradeAPI,
  gradeScaleAPI,
  suggestionAPI,
  appSettingsAPI,
};

