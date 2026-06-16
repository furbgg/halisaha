import api from './api';
import type { ApiResponse } from '../types/api';

export interface TimelineEntry {
  fieldName: string;
  customerName: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'MODIFIED' | 'COMPLETED' | 'NO_SHOW';
}

export interface DailyRevenue {
  dayLabel: string;
  revenue: number;
}

export interface PaymentMethodStat {
  method: 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'ON_SITE';
  count: number;
  percentage: number;
}

export interface MaterialStat {
  name: string;
  rentalCount: number;
  maxRentals: number;
}

export interface MonthlyRevenue {
  monthLabel: string;
  revenue: number;
}

export interface HeatmapCell {
  dayOfWeek: string;
  timeSlot: string;
  intensity: number;
}

export interface WeakDay {
  dayName: string;
  bookingCount: number;
  avgOtherDays: number;
}

export interface WeakSlot {
  dayName: string;
  timeRange: string;
  bookingCount: number;
}

export interface FieldInsight {
  fieldId: number;
  fieldName: string;
  totalBookings: number;
  weakestDays: WeakDay[];
  weakestSlots: WeakSlot[];
}

export interface InsightResponse {
  analyzedMonth: string;
  totalReservations: number;
  fieldInsights: FieldInsight[];
}

export interface FieldStat {
  fieldId: number;
  fieldName: string;
  reservationCount: number;
  revenue: number;
}

export interface UpcomingReservation {
  id: number;
  confirmationCode: string;
  fieldName: string;
  customerName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface DashboardData {
  todayReservations: number;
  yesterdayReservations: number;
  todayRevenue: number;
  lastBookingAgo: string;
  weekReservations: number;
  weekRevenue: number;
  monthReservations: number;
  monthRevenue: number;
  utilizationPercent: number;
  refundedAmount: number;
  refundedCount: number;
  failedPaymentCount: number;
  fieldStats: FieldStat[];
  upcomingReservations: UpcomingReservation[];
  todayTimeline: TimelineEntry[];
  weeklyRevenue: DailyRevenue[];
  paymentMethodStats: PaymentMethodStat[];
  topMaterials: MaterialStat[];
  monthlyTrend: MonthlyRevenue[];
  hourlyHeatmap: HeatmapCell[];
  insights: InsightResponse | null;
}

export const dashboardService = {
  getDashboard: () => api.get<ApiResponse<DashboardData>>('/admin/dashboard'),
};
