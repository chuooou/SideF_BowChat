import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserInfo } from "../types/domain";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  setSession: (payload: { accessToken: string; refreshToken?: string | null; user?: UserInfo | null }) => void;
  setUser: (user: UserInfo | null) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
          user: user ?? state.user,
        })),
      setUser: (user) => set({ user }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: "bowchat-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
