import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { createMockUser, createMockSession, MockUser } from './mocks/auth';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Create mock student
export interface MockStudent {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  student_code: string;
  campus_id: string;
  gender: 'male' | 'female' | 'other';
  birth_date: string;
  grade?: string;
  section?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const createMockStudent = (overrides: Partial<MockStudent> = {}): MockStudent => {
  const first_name = overrides.first_name || 'Juan';
  const last_name = overrides.last_name || 'Pérez';
  const full_name = overrides.full_name || `${first_name} ${last_name}`;
  
  return {
    id: `student-${Math.random().toString(36).substr(2, 9)}`,
    first_name,
    last_name,
    full_name,
    student_code: `2024${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    campus_id: 'campus-1',
    gender: 'male',
    birth_date: '2010-05-15',
    grade: '5',
    section: 'A',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    phone: '3001234567',
    email: 'juan.perez@email.com',
    guardian_name: 'María Pérez',
    guardian_phone: '3109876543',
    guardian_email: 'maria.perez@email.com',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};

// Create mock campus
export interface MockCampus {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const createMockCampus = (overrides: Partial<MockCampus> = {}): MockCampus => ({
  id: `campus-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Sede Principal',
  code: 'PRINCIPAL',
  address: 'Calle Principal #123',
  city: 'Bogotá',
  phone: '6011234567',
  email: 'principal@colegio.edu',
  description: 'Sede principal del colegio',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Props para renderWithProviders
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialEntries?: string[];
  initialIndex?: number;
  withQueryClient?: boolean;
  withRouter?: boolean;
}

// Wrapper con todos los providers necesarios
const AllProviders = ({
  children,
  route,
  initialEntries = ['/'],
  initialIndex = 0,
  withQueryClient = true,
  withRouter = true,
}: {
  children: ReactNode;
  route?: string;
  initialEntries?: string[];
  initialIndex?: number;
  withQueryClient?: boolean;
  withRouter?: boolean;
}) => {
  const queryClient = createTestQueryClient();

  let content = children;

  if (withQueryClient) {
    content = (
      <QueryClientProvider client={queryClient}>
        {content}
      </QueryClientProvider>
    );
  }

  if (withRouter) {
    if (route) {
      content = (
        <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
          <Routes>
            <Route path={route} element={content} />
          </Routes>
        </MemoryRouter>
      );
    } else {
      content = <BrowserRouter>{content}</BrowserRouter>;
    }
  }

  return <>{content}</>;
};

// Función personalizada de render con providers
export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    route,
    initialEntries,
    initialIndex,
    withQueryClient = true,
    withRouter = true,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders
      route={route}
      initialEntries={initialEntries}
      initialIndex={initialIndex}
      withQueryClient={withQueryClient}
      withRouter={withRouter}
    >
      {children}
    </AllProviders>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Helper para esperar a que se resuelvan promesas
export const waitForAsync = async (ms: number = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Helper para simular cambios en inputs
export const changeInput = (
  element: HTMLElement,
  value: string
): void => {
  element.setAttribute('value', value);
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('input', { bubbles: true }));
};

// Mock de localStorage para testing
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

// Helper para simular resize de ventana
export const resizeWindow = (width: number, height: number = 768): void => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// Re-exportar de testing-library para conveniencia
export { screen, waitFor, fireEvent, within } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
export { createMockUser, createMockSession };
export type { MockUser };
