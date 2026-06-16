export type UserRole = 'ADMIN' | 'USER'

export interface User {
  id: number
  displayId: string
  name: string
  email: string
  phone?: string
  role: UserRole
  totpEnabled: boolean
  createdAt: string
}

export interface UserProfile {
  displayId: string
  name: string
  email: string
  phone?: string
  role: UserRole
  totpEnabled: boolean
  createdAt: string
}

export interface UpdateProfileRequest {
  name: string
  phone?: string
}
