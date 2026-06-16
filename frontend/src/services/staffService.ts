import api from './api';
import type { ApiResponse } from '../types/api';

export interface Staff {
  id: number;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const staffService = {
  getAll: () => api.get<ApiResponse<Staff[]>>('/admin/staff'),
  getById: (id: number) => api.get<ApiResponse<Staff>>(`/admin/staff/${id}`),
  create: (data: Partial<Staff>) => api.post<ApiResponse<Staff>>('/admin/staff', data),
  update: (id: number, data: Partial<Staff>) => api.put<ApiResponse<Staff>>(`/admin/staff/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/admin/staff/${id}`),
};
