import api from './api'
import type { ApiResponse, PaginatedResponse } from '../types/api'
import type { Reservation } from '../types/reservation'
import type { Equipment } from '../types/equipment'

export const adminService = {
  getDashboard: () =>
    api.get<ApiResponse<unknown>>('/admin/dashboard'),

  getReservations: (from?: string, to?: string) =>
    api.get<ApiResponse<Reservation[]>>('/admin/reservations', { params: { from, to } }),

  getTodayReservations: () =>
    api.get<ApiResponse<Reservation[]>>('/admin/reservations/today'),

  modifyReservation: (id: number, data: { startTime: string; durationMinutes: number }) =>
    api.put<ApiResponse<Reservation>>(`/admin/reservations/${id}`, data),

  cancelReservation: (id: number) =>
    api.delete<ApiResponse<Reservation>>(`/admin/reservations/${id}`),

  getEquipment: () =>
    api.get<ApiResponse<Equipment[]>>('/admin/equipment'),

  createEquipment: (data: Partial<Equipment>) =>
    api.post<ApiResponse<Equipment>>('/admin/equipment', data),

  updateEquipment: (id: number, data: Partial<Equipment>) =>
    api.put<ApiResponse<Equipment>>(`/admin/equipment/${id}`, data),

  deleteEquipment: (id: number) =>
    api.delete<ApiResponse<void>>(`/admin/equipment/${id}`),

  getStaff: () =>
    api.get<ApiResponse<unknown[]>>('/admin/staff'),

  createStaff: (data: unknown) =>
    api.post<ApiResponse<unknown>>('/admin/staff', data),

  updateStaff: (id: number, data: unknown) =>
    api.put<ApiResponse<unknown>>(`/admin/staff/${id}`, data),

  deleteStaff: (id: number) =>
    api.delete<ApiResponse<void>>(`/admin/staff/${id}`),

  getSettings: () =>
    api.get<ApiResponse<unknown[]>>('/admin/settings'),

  updateSetting: (key: string, value: string) =>
    api.put<ApiResponse<unknown>>(`/admin/settings/${key}`, { value }),

  getAuditLogs: (page: number = 0, size: number = 20) =>
    api.get<ApiResponse<PaginatedResponse<unknown>>>('/admin/audit-logs', {
      params: { page, size },
    }),

  getNotifications: (page: number = 0, size: number = 20) =>
    api.get<ApiResponse<PaginatedResponse<unknown>>>('/admin/notifications', {
      params: { page, size },
    }),

  getNotificationStats: () =>
    api.get<ApiResponse<Record<string, number>>>('/admin/notifications/stats'),
}
