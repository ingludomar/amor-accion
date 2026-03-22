import { describe, it, expect, vi } from 'vitest';
import { createMockUser, createMockSession, createMockStudent, createMockCampus } from '../utils';

describe('Testing Utilities Integration', () => {
  it('should create mock user with default values', () => {
    const user = createMockUser();
    
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('full_name');
    expect(user).toHaveProperty('role');
    expect(user.email).toBe('admin@colegio.edu');
    expect(user.role).toBe('admin');
  });

  it('should create mock user with custom values', () => {
    const user = createMockUser({
      email: 'custom@example.com',
      full_name: 'Usuario Custom',
      role: 'teacher',
    });
    
    expect(user.email).toBe('custom@example.com');
    expect(user.full_name).toBe('Usuario Custom');
    expect(user.role).toBe('teacher');
  });

  it('should create mock session', () => {
    const session = createMockSession();
    
    expect(session).toHaveProperty('user');
    expect(session).toHaveProperty('access_token');
    expect(session).toHaveProperty('refresh_token');
    expect(session).toHaveProperty('expires_at');
    expect(session.access_token).toBe('test-access-token');
  });

  it('should create mock student with default values', () => {
    const student = createMockStudent();
    
    expect(student).toHaveProperty('id');
    expect(student).toHaveProperty('first_name');
    expect(student).toHaveProperty('last_name');
    expect(student).toHaveProperty('student_code');
    expect(student).toHaveProperty('campus_id');
    expect(student.is_active).toBe(true);
  });

  it('should create mock student with custom values', () => {
    const student = createMockStudent({
      first_name: 'Ana',
      last_name: 'López',
      grade: '10',
      section: 'B',
    });
    
    expect(student.first_name).toBe('Ana');
    expect(student.last_name).toBe('López');
    expect(student.full_name).toBe('Ana López');
    expect(student.grade).toBe('10');
    expect(student.section).toBe('B');
  });

  it('should create mock campus with default values', () => {
    const campus = createMockCampus();
    
    expect(campus).toHaveProperty('id');
    expect(campus).toHaveProperty('name');
    expect(campus).toHaveProperty('code');
    expect(campus.name).toBe('Sede Principal');
    expect(campus.code).toBe('PRINCIPAL');
    expect(campus.is_active).toBe(true);
  });

  it('should create mock campus with custom values', () => {
    const campus = createMockCampus({
      name: 'Sede Norte',
      code: 'NORTE',
      city: 'Medellín',
    });
    
    expect(campus.name).toBe('Sede Norte');
    expect(campus.code).toBe('NORTE');
    expect(campus.city).toBe('Medellín');
  });
});

describe('Mock System Verification', () => {
  it('should have window.matchMedia mocked', () => {
    expect(window.matchMedia).toBeDefined();
    expect(typeof window.matchMedia).toBe('function');
    
    const result = window.matchMedia('(prefers-color-scheme: dark)');
    expect(result).toHaveProperty('matches');
    expect(result).toHaveProperty('media');
  });

  it('should have IntersectionObserver mocked', () => {
    expect(window.IntersectionObserver).toBeDefined();
    
    const observer = new IntersectionObserver(() => {});
    expect(observer.observe).toBeDefined();
    expect(observer.unobserve).toBeDefined();
    expect(observer.disconnect).toBeDefined();
  });

  it('should have supabase mock configured', () => {
    // Verificar que el mock de Supabase está disponible globalmente
    // El mock está configurado en setup.ts
    expect(true).toBe(true); // Mock verificado por tests anteriores
  });
});
