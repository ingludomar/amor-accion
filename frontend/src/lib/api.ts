// Re-export everything from supabaseClient and supabaseApi for compatibility
export * from './supabaseClient';
export * from './supabaseApi';

// Additional exports for types that might be missing
export type { ClassSession } from './supabaseApi';
export type { Campus } from './supabaseApi';
export type { Student } from './supabaseApi';
export type { Guardian } from './supabaseApi';
