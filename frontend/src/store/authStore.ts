import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, signIn, signOut, getCurrentUser } from '../lib/api';

export interface Permission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
}

async function loadPermissions(role: string): Promise<Permission[]> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*')
    .eq('role_name', role);

  if (error || !data) return [];
  return data as Permission[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await signIn(email, password);

          if (error) {
            set({ error: error.message, isLoading: false });
            return;
          }

          if (data.user) {
            const user = await getCurrentUser();
            const permissions = await loadPermissions((user as User)?.role || '');
            set({
              user: user as User,
              permissions,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (err: any) {
          set({
            error: err.message || 'Error al iniciar sesión',
            isLoading: false,
          });
        }
      },

      logout: async () => {
        await signOut();
        set({
          user: null,
          permissions: [],
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const user = await getCurrentUser();
        if (user) {
          const permissions = await loadPermissions((user as User)?.role || '');
          set({ user: user as User, permissions, isAuthenticated: true });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete') => {
        const perm = get().permissions.find(p => p.module === module);
        if (!perm) return false;
        const map = { view: perm.can_view, create: perm.can_create, edit: perm.can_edit, delete: perm.can_delete };
        return map[action] ?? false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // No persistir permissions: se recargan en checkAuth
      }),
    }
  )
);
