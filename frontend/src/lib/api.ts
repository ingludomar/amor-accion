// Re-export from supabaseClient
export * from './supabaseClient';

// Re-export from supabaseApi
export * from './supabaseApi';

// Define types directly to avoid re-export issues
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface CreateSessionRequest {
  course_group_id?: string;
  subject_id?: string;
  teacher_id?: string;
  period_id?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status?: SessionStatus;
  topic?: string;
  notes?: string;
}

export interface CreateAttendanceRequest {
  class_session_id: string;
  student_id: string;
  status: AttendanceStatus;
  arrival_time?: string;
  notes?: string;
}
