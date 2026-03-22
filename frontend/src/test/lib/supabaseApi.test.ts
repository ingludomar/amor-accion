import { describe, it, expect, vi, beforeEach } from 'vitest';
import { campusAPI, studentAPI, schoolYearAPI } from '../../lib/supabaseApi';
import { supabase } from '../../lib/supabaseClient';

describe('Supabase API - Campus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all campuses successfully', async () => {
      const mockCampuses = [
        { id: '1', name: 'Sede Principal', code: 'PRINCIPAL', is_active: true },
        { id: '2', name: 'Sede Norte', code: 'NORTE', is_active: true },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockCampuses, error: null }),
      });

      const result = await campusAPI.getAll();

      expect(result.data).toEqual(mockCampuses);
      expect(result.error).toBeNull();
    });

    it('should handle error when fetching campuses fails', async () => {
      const mockError = new Error('Database error');

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      await expect(campusAPI.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create a new campus successfully', async () => {
      const newCampus = {
        name: 'Sede Sur',
        code: 'SUR',
        address: 'Calle 123',
        city: 'Bogotá',
        phone: '3001234567',
        email: 'sur@colegio.edu',
        is_active: true,
      };

      const mockResponse = { id: '3', ...newCampus, created_at: '2024-01-01' };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResponse, error: null }),
      });

      const result = await campusAPI.create(newCampus as any);

      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBeNull();
    });
  });
});

describe('Supabase API - Students', () => {
  describe('getAll', () => {
    it('should return students with filters', async () => {
      const mockStudents = [
        { 
          id: '1', 
          full_name: 'Juan Pérez', 
          student_code: '20240001',
          campus_id: 'campus-1',
          guardians: [],
          is_active: true 
        },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockStudents, error: null }),
      });

      const result = await studentAPI.getAll({ 
        campus_id: 'campus-1',
        search: 'Juan' 
      });

      expect(result.data).toEqual(mockStudents);
    });
  });

  describe('create', () => {
    it('should create a student with auto-generated code', async () => {
      const newStudent = {
        first_name: 'María',
        last_name: 'García',
        campus_id: 'campus-1',
        gender: 'female',
        birth_date: '2010-01-01',
      };

      const mockResponse = {
        id: '1',
        ...newStudent,
        student_code: '20240001',
        full_name: 'María García',
        created_at: '2024-01-01',
      };

      // Mock para generateStudentCode
      const mockQueryForCode = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock para insert
      const mockQueryForInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResponse, error: null }),
      };

      // Manejar diferentes llamadas a from()
      let callCount = 0;
      (supabase.from as any).mockImplementation(() => {
        callCount++;
        // Primera llamada es para generateStudentCode
        if (callCount === 1) {
          return mockQueryForCode;
        }
        // Segunda llamada es para insert
        return mockQueryForInsert;
      });

      const result = await studentAPI.create(newStudent as any);

      expect(result.data).toBeDefined();
      expect(result.data.student_code).toBeDefined();
    });
  });
});

describe('Supabase API - School Years', () => {
  describe('list', () => {
    it('should return school years for a campus', async () => {
      const mockSchoolYears = [
        { 
          id: '1', 
          name: '2024-2025', 
          campus_id: 'campus-1',
          is_current: true,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockSchoolYears, error: null }),
      });

      const result = await schoolYearAPI.list('campus-1');

      expect(result.data).toEqual(mockSchoolYears);
    });
  });
});
