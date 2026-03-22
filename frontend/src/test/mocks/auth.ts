import { vi } from 'vitest';

// Tipos para usuarios mock
export interface MockUser {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MockSession {
  user: MockUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Usuario mock por defecto
export const defaultMockUser: MockUser = {
  id: 'test-user-id-123',
  email: 'admin@colegio.edu',
  username: 'admin',
  full_name: 'Administrador del Sistema',
  role: 'admin',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Sesión mock por defecto
export const defaultMockSession: MockSession = {
  user: defaultMockUser,
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
};

// Factory para crear usuarios mock
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  ...defaultMockUser,
  ...overrides,
});

// Factory para crear sesiones mock
export const createMockSession = (
  userOverrides: Partial<MockUser> = {},
  sessionOverrides: Partial<Omit<MockSession, 'user'>> = {}
): MockSession => ({
  user: createMockUser(userOverrides),
  ...defaultMockSession,
  ...sessionOverrides,
});

// Helper para simular login exitoso
export const mockLoginSuccess = (user: MockUser = defaultMockUser) => {
  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          username: user.username,
        },
      },
      session: createMockSession(user),
    },
    error: null,
  };
};

// Helper para simular error de login
export const mockLoginError = (message: string = 'Credenciales inválidas') => ({
  data: { user: null, session: null },
  error: { message },
});

// Helper para simular logout
export const mockLogoutSuccess = () => ({
  error: null,
});

// Helper para simular getSession
export const mockGetSessionSuccess = (session: MockSession = defaultMockSession) => ({
  data: { session },
  error: null,
});

export const mockGetSessionEmpty = () => ({
  data: { session: null },
  error: null,
});

// Helper para simular getUser
export const mockGetUserSuccess = (user: MockUser = defaultMockUser) => ({
  data: { user },
  error: null,
});

export const mockGetUserEmpty = () => ({
  data: { user: null },
  error: null,
});

// Función para configurar mocks de autenticación
export const setupAuthMocks = ({
  isAuthenticated = true,
  user = defaultMockUser,
  error = null,
}: {
  isAuthenticated?: boolean;
  user?: MockUser;
  error?: string | null;
} = {}) => {
  const { vi } = require('vitest');
  
  return {
    login: vi.fn().mockImplementation((email: string, password: string) => {
      if (error) {
        return Promise.resolve({ data: null, error: { message: error } });
      }
      return Promise.resolve(mockLoginSuccess(user));
    }),
    logout: vi.fn().mockResolvedValue(mockLogoutSuccess()),
    getSession: vi.fn().mockResolvedValue(
      isAuthenticated ? mockGetSessionSuccess(createMockSession(user)) : mockGetSessionEmpty()
    ),
    getUser: vi.fn().mockResolvedValue(
      isAuthenticated ? mockGetUserSuccess(user) : mockGetUserEmpty()
    ),
    clearError: vi.fn(),
    isAuthenticated,
    user: isAuthenticated ? user : null,
    isLoading: false,
    error,
  };
};

// Exportar mock para useAuthStore
export const createAuthStoreMock = (overrides: {
  user?: MockUser | null;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  error?: string | null;
} = {}) => ({
  user: overrides.user !== undefined ? overrides.user : defaultMockUser,
  isAuthenticated: overrides.isAuthenticated ?? true,
  isLoading: overrides.isLoading ?? false,
  error: overrides.error ?? null,
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  clearError: vi.fn(),
});
