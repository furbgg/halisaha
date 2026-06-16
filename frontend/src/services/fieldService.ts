import api from './api'
import type { ApiResponse } from '../types/api'
import type { Field, FieldAvailability } from '../types/field'

export const fieldService = {
  getAll: () =>
    api.get<ApiResponse<Field[]>>('/fields'),

  getById: (id: number) =>
    api.get<ApiResponse<Field>>(`/fields/${id}`),

  getAvailability: (id: number, date: string, duration: number = 1) =>
    api.get<ApiResponse<FieldAvailability>>(`/fields/${id}/availability`, {
      params: { date, duration },
    }),
}
