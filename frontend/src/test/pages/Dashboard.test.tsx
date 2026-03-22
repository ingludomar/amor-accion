import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { useAuthStore } from '../../store/authStore';
import { renderWithProviders, createMockUser } from '../utils';

// Mock del store de autenticación
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard Component', () => {
  const mockUser = createMockUser({
    full_name: 'Administrador Test',
    email: 'admin@test.edu',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with authenticated user', () => {
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithProviders(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
      { withRouter: false, withQueryClient: true }
    );

    // Verificar que muestra el nombre del usuario en el h1
    expect(screen.getByRole('heading', { name: 'Administrador Test' })).toBeInTheDocument();
    
    // Verificar que muestra el título de bienvenida
    expect(screen.getByText(/bienvenido de vuelta/i)).toBeInTheDocument();
    
    // Verificar que muestra la descripción del sistema
    expect(screen.getByText(/sistema de gestión de asistencia estudiantil/i)).toBeInTheDocument();
  });

  it('displays dashboard stats cards', () => {
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithProviders(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
      { withRouter: false, withQueryClient: true }
    );

    // Verificar las tarjetas de estadísticas usando getAllByText
    expect(screen.getAllByText('Sedes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Estudiantes').length).toBeGreaterThan(0);
    expect(screen.getByText('Asistencia Hoy')).toBeInTheDocument();
    
    // Verificar descripciones usando getAllByText porque pueden aparecer en múltiples lugares
    expect(screen.getAllByText('Campus activos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Matriculados').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tasa de asistencia').length).toBeGreaterThan(0);
  });

  it('displays quick actions section', () => {
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithProviders(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
      { withRouter: false, withQueryClient: true }
    );

    // Verificar acciones rápidas
    expect(screen.getByText('Ver Estudiantes')).toBeInTheDocument();
    expect(screen.getByText('Tomar Asistencia')).toBeInTheDocument();
    expect(screen.getByText('Ver Sedes')).toBeInTheDocument();
    
    // Verificar descripciones de acciones
    expect(screen.getByText('Gestionar estudiantes y acudientes')).toBeInTheDocument();
    expect(screen.getByText('Registrar asistencia del día')).toBeInTheDocument();
  });

  it('displays volunteer tip section', () => {
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithProviders(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
      { withRouter: false, withQueryClient: true }
    );

    // Verificar la sección de consejos
    expect(screen.getByText('Consejo para voluntarios')).toBeInTheDocument();
    expect(screen.getByText(/recuerda registrar la asistencia diaria/i)).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    (useAuthStore as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    renderWithProviders(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>,
      { 
        withRouter: false, 
        withQueryClient: true
      }
    );

    // Esperar a que el efecto de redirección se ejecute
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 2000 });
  });

  it('renders dashboard with user email when full_name is not available', () => {
    (useAuthStore as any).mockReturnValue({
      user: createMockUser({
        full_name: undefined,
        email: 'test@colegio.edu',
      }),
      isAuthenticated: true,
    });

    renderWithProviders(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
      { withRouter: false, withQueryClient: true }
    );

    // Debería mostrar el email si no hay full_name (en el h1)
    expect(screen.getByRole('heading', { name: 'test@colegio.edu' })).toBeInTheDocument();
  });
});
