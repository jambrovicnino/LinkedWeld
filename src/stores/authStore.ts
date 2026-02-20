import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginPayload, RegisterPayload } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isLoading: boolean;
  verificationCode: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isVerified: false,
      isLoading: false,
      verificationCode: null,

      login: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', payload);
          const { user, tokens } = data.data;
          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isVerified: !!user.isVerified,
            isLoading: false,
            verificationCode: null,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', payload);
          const { user, tokens, verificationCode } = data.data;
          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isVerified: false,
            isLoading: false,
            verificationCode: verificationCode || null,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      verifyEmail: async (code: string) => {
        set({ isLoading: true });
        try {
          await api.post('/auth/verify', { code });
          set({ isVerified: true, isLoading: false, verificationCode: null });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        const rt = get().refreshToken;
        if (rt) api.post('/auth/logout', { refreshToken: rt }).catch(() => {});
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isVerified: false,
          verificationCode: null,
        });
      },

      refreshAuth: async () => {
        const rt = get().refreshToken;
        if (!rt) throw new Error('No refresh token');
        const { data } = await api.post('/auth/refresh', { refreshToken: rt });
        const { accessToken, refreshToken: newRt } = data.data;
        set({ token: accessToken, refreshToken: newRt });
      },

      updateProfile: async (updates) => {
        const { data } = await api.put('/auth/me', updates);
        set({ user: data.data });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'linkedweld-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isVerified: state.isVerified,
      }),
    }
  )
);
