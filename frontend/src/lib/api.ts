// Re-export from supabaseClient
export * from './supabaseClient';

// Re-export from supabaseApi
export * from './supabaseApi';

// Explicit exports for types
export type { ClassSession, Campus, Student, Guardian } from './supabaseApi';
export type { SessionStatus, AttendanceStatus } from './supabaseApi';
export interface CreateSessionRequest {
  course_group_id?: string;
  subject_id?: string;
  teacher_id?: string;
  period_id?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status?: string;
  topic?: string;
  notes?: string;
}
export interface CreateAttendanceRequest {
  class_session_id: string;
  student_id: string;
  status: string;
  arrival_time?: string;
  notes?: string;
}
