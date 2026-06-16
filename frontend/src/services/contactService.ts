import api from './api';
import type { ApiResponse } from '../types/api';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  adminNotes: string | null;
  createdAt: string;
  readAt: string | null;
  repliedAt: string | null;
}

export const contactService = {
  submit: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    api.post<ApiResponse<ContactMessage>>('/contact', data),

  getAll: (status?: string) =>
    api.get<ApiResponse<ContactMessage[]>>('/admin/contact', { params: status ? { status } : {} }),

  getById: (id: number) =>
    api.get<ApiResponse<ContactMessage>>(`/admin/contact/${id}`),

  countNew: () =>
    api.get<ApiResponse<number>>('/admin/contact/count'),

  markReplied: (id: number) =>
    api.patch<ApiResponse<ContactMessage>>(`/admin/contact/${id}/replied`),

  archive: (id: number) =>
    api.patch<ApiResponse<ContactMessage>>(`/admin/contact/${id}/archive`),

  updateNotes: (id: number, notes: string) =>
    api.patch<ApiResponse<ContactMessage>>(`/admin/contact/${id}/notes`, { notes }),
};
