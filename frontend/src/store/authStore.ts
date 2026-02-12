import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signIn, signOut, getCurrentUser } from '../lib/api';

interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
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
            set({
              user: user as User,
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
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const user = await getCurrentUser();
        if (user) {
          set({ user: user as User, isAuthenticated: true });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);