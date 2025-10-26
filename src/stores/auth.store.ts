import { IAuthState } from '@/lib';
import { getUserFromCookie } from '@/utils';
import { create } from 'zustand';
// import { AuthState, User } from '../types/auth.types';
// import { getUserFromCookie } from '../utils/cookies';

export const useAuthStore = create<IAuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  // Login - ahora solo actualiza el estado local
  login: async (userData?: any) => {
    // Si se pasa userData directamente, usarlo
    if (userData) {
      set({
        user: userData,
        token: 'stored-in-cookie',
        isAuthenticated: true,
      });
      return;
    }

    // Si no, intentar leer desde cookies
    const user = getUserFromCookie();
    console.log('Login in store, user from cookie:', user);
    if (user) {
      set({
        user,
        token: 'stored-in-cookie',
        isAuthenticated: true,
      });
    }
  },

  // Register - similar a login
  register: async () => {
    const user = getUserFromCookie();
    if (user) {
      set({
        user,
        token: 'stored-in-cookie',
        isAuthenticated: true,
      });
    }
  },

  // Logout - el logout real se hace en el server action
  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Verificar autenticación desde cookies
  checkAuth: () => {
    const user = getUserFromCookie();

    console.log('Checking auth in store, user from cookie:', user);
    if (user) {
      set({
        user,
        token: 'stored-in-cookie',
        isAuthenticated: true,
      });
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },
}));
