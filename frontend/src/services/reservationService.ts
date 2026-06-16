import api from './api'
import type { ApiResponse } from '../types/api'
import type { Reservation, CreateReservationRequest, ModifyReservationRequest, SlotHoldRequest } from '../types/reservation'
import type { Equipment } from '../types/equipment'

export const reservationService = {
  create: (data: CreateReservationRequest) =>
    api.post<ApiResponse<Reservation>>('/reservations', data),

  getByCode: (code: string) =>
    api.get<ApiResponse<Reservation>>(`/reservations/${code}`),

  modify: (code: string, data: ModifyReservationRequest) =>
    api.put<ApiResponse<Reservation>>(`/reservations/${code}`, data),

  cancel: (code: string) =>
    api.delete<ApiResponse<Reservation>>(`/reservations/${code}`),

  createHold: (data: SlotHoldRequest) =>
    api.post<ApiResponse<unknown>>('/reservations/hold', data),

  releaseHold: (sessionId: string) =>
    api.delete<ApiResponse<void>>(`/reservations/hold/${sessionId}`),

  getRentableEquipment: () =>
    api.get<ApiResponse<Equipment[]>>('/equipment/rentable'),
}
