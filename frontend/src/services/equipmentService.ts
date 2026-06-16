import api from './api';
import type { ApiResponse } from '../types/api';

export interface Equipment {
  id: number;
  name: string;
  category: string;
  quantity: number;
  condition: 'NEU' | 'GUT' | 'BESCHAEDIGT' | 'AUSGEMUSTERT';
  rentable: boolean;
  rentalPricePerHour: number;
  availableSizes: string[] | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SizeAvailability {
  size: string | null;
  totalStock: number;
  available: number;
}

export interface SizeStock {
  id: number;
  size: string;
  quantity: number;
}

export const equipmentService = {
  getAll: () => api.get<ApiResponse<Equipment[]>>('/admin/equipment'),
  getById: (id: number) => api.get<ApiResponse<Equipment>>(`/admin/equipment/${id}`),
  create: (data: Partial<Equipment>) => api.post<ApiResponse<Equipment>>('/admin/equipment', data),
  update: (id: number, data: Partial<Equipment>) => api.put<ApiResponse<Equipment>>(`/admin/equipment/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/admin/equipment/${id}`),
  getSizeStocks: (id: number) => api.get<ApiResponse<SizeStock[]>>(`/admin/equipment/${id}/sizes`),
  setSizeStocks: (id: number, sizeStocks: { size: string; quantity: number }[]) =>
    api.put<ApiResponse<SizeStock[]>>(`/admin/equipment/${id}/sizes`, { sizeStocks }),

  getRentable: () => api.get<ApiResponse<Equipment[]>>('/equipment/rentable'),
  getAvailability: (id: number, start: string, end: string) =>
    api.get<ApiResponse<SizeAvailability[]>>(`/equipment/${id}/availability`, { params: { start, end } }),
};
