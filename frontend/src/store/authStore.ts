/**
 * Authentication state management with Zustand + LocalStorage
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, authAPI, User } from '../lib/localApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = auth.login(email, password);
          if (result.success) {
            set({
              user: result.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              error: result.error || 'Error al iniciar sesión',
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({
            error: error.message || 'Error al iniciar sesión',
            isLoading: false,
          });
        }
      },

      logout: () => {
        auth.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);