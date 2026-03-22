import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { useAuthStore } from '../../store/authStore';
import { renderWithProviders } from '../utils';

describe('Login Component', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Configurar el mock del store para cada test
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  it('renders login form correctly', () => {
    renderWithProviders(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
      { withRouter: false, withQueryClient: true }
    );

    expect(screen.getByText('Sistema de Asistencia')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('displays error message when login fails', () => {
    // Actualizar el mock con error
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Credenciales inválidas',
      clearError: mockClearError,
    });

    renderWithProviders(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
      { withRouter: false, withQueryClient: true }
    );

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('calls login function with correct credentials', async () => {
    renderWithProviders(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
      { withRouter: false, withQueryClient: true }
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'admin@colegio.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'changeme123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@colegio.edu', 'changeme123');
    });
  });

  it('shows loading state during login', () => {
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: mockClearError,
    });

    renderWithProviders(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
      { withRouter: false, withQueryClient: true }
    );

    expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays demo credentials', () => {
    renderWithProviders(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
      { withRouter: false, withQueryClient: true }
    );

    expect(screen.getByText(/credenciales de prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@colegio.edu/i)).toBeInTheDocument();
  });
});
