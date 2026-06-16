import api from './api';
import type { ApiResponse } from '../types/api';

export interface AppSetting {
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

export const settingsService = {
  getAll: () => api.get<ApiResponse<AppSetting[]>>('/admin/settings'),
  update: (key: string, value: string) => 
    api.put<ApiResponse<AppSetting>>(`/admin/settings/${key}`, { value }),
};
