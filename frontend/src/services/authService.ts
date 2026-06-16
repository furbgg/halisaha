import api from './api'
import type { ApiResponse } from '../types/api'

interface AuthResponse {
  accessToken: string
  refreshToken?: string
  displayId: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  totpRequired: boolean
}

export const authService = {
  login: (email: string, password: string, totpCode?: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password, totpCode }),

  register: (name: string, email: string, phone: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, phone, password }),

  refresh: () =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', {}),

  logout: () =>
    api.post<ApiResponse<void>>('/auth/logout', {}),

  setup2fa: () =>
    api.get<ApiResponse<{ secret: string; qrCodeUri: string }>>('/auth/2fa/setup'),

  verify2fa: (code: number) =>
    api.post<ApiResponse<void>>('/auth/2fa/verify', { code }),

  disable2fa: () =>
    api.delete<ApiResponse<void>>('/auth/2fa'),
}
