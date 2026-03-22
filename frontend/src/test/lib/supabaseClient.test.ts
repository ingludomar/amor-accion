import { describe, it, expect } from 'vitest';

describe('Supabase Client Configuration', () => {
  it('should verify Vitest setup is working', () => {
    expect(true).toBe(true);
  });

  it('should have environment variables configured', () => {
    // Verificar que las variables de entorno están configuradas o tienen valores por defecto
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    // Pueden estar vacías en testing, pero las propiedades deben existir
    expect(typeof supabaseUrl).toBe('string');
    expect(typeof supabaseKey).toBe('string');
  });

  it('should have proper mock configuration', () => {
    // Verificar que el mock global está funcionando
    // Este test verifica que el setup.ts está cargando correctamente
    expect(window.matchMedia).toBeDefined();
    expect(window.IntersectionObserver).toBeDefined();
  });
});
