import { create } from 'zustand'
import axios from 'axios'
import type { UserRole } from '../types/user'

interface AuthState {
  accessToken: string | null
  user: {
    displayId: string
    name: string
    email: string
    role: UserRole
  } | null
  isAuthenticated: boolean
  isAdmin: boolean
  isInitializing: boolean
  setTokens: (accessToken: string) => void
  setUser: (user: AuthState['user']) => void
  login: (accessToken: string, user: AuthState['user']) => void
  logout: () => void
  rehydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isInitializing: true,

  setTokens: (accessToken) =>
    set({ accessToken }),

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
    }),

  login: (accessToken, user) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
      isAdmin: user?.role === 'ADMIN',
    }),

  logout: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    }),

  rehydrate: async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      const { accessToken, user } = res.data.data
      if (accessToken) {
        set({
          accessToken,
          user: user || null,
          isAuthenticated: true,
          isAdmin: user?.role === 'ADMIN',
        })
      }
    } catch {
    } finally {
      set({ isInitializing: false })
    }
  },
}))
