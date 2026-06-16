import api from './api';
import type { ApiResponse } from '../types/api';

/* ─── Types ─── */

export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'MODIFIED' | 'COMPLETED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'ON_SITE';
export type PaymentMethod = 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'ON_SITE';

export interface RentalInfo {
  equipmentName: string;
  quantity: number;
  size: string;
  price: number;
}

export interface AdminReservation {
  id: number;
  confirmationCode: string;
  fieldId: number;
  fieldName: string;
  gameType: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  createdAt: string;
  equipmentRentals: RentalInfo[];
}

export interface ModifyReservationRequest {
  startTime: string;
  durationMinutes: number;
}

export interface DailyBookingCount {
  label: string;
  count: number;
}

export interface FieldUtilization {
  fieldId: number;
  fieldName: string;
  bookedHours: number;
  totalHours: number;
  percent: number;
  prevPercent: number;
}

export interface ReservationStats {
  totalReservations: number;
  prevMonthTotal: number;
  changePercent: number;
  cancelledCount: number;
  cancelRate: number;
  prevCancelRate: number;
  popularTimeSlot: string;
  monthRevenue: number;
  revenueProjection: number;
  revenueChangePercent: number;
  weeklyBookings: DailyBookingCount[];
  monthlyBookings: DailyBookingCount[];
  fieldUtilization: FieldUtilization[];
}

/* ─── API Calls ─── */

export const adminReservationService = {
  /** All reservations in date range (defaults to ±30 days on backend) */
  getAll: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return api.get<ApiResponse<AdminReservation[]>>(`/admin/reservations${qs ? `?${qs}` : ''}`);
  },

  /** Reservation stats for dashboard cards + charts */
  getStats: () =>
    api.get<ApiResponse<ReservationStats>>('/admin/reservations/stats'),

  /** Today's reservations */
  getToday: () =>
    api.get<ApiResponse<AdminReservation[]>>('/admin/reservations/today'),

  /** Single reservation by ID */
  getById: (id: number) =>
    api.get<ApiResponse<AdminReservation>>(`/admin/reservations/${id}`),

  /** Modify reservation (admin — no deadline) */
  modify: (id: number, data: ModifyReservationRequest) =>
    api.put<ApiResponse<AdminReservation>>(`/admin/reservations/${id}`, data),

  /** Cancel reservation (admin — no deadline) */
  cancel: (id: number) =>
    api.delete<ApiResponse<AdminReservation>>(`/admin/reservations/${id}`),

  /** Admin refund (custom amount, no deadline) */
  refund: (reservationId: number, amount: number) =>
    api.post<ApiResponse<{ refundedAmount: number }>>(`/payments/admin/${reservationId}/refund`, null, {
      params: { amount },
    }),
};
