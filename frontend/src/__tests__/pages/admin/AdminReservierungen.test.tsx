import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { AdminReservierungen } from '../../../pages/admin/AdminReservierungen';
import { adminReservationService } from '../../../services/adminReservationService';
import { fieldService } from '../../../services/fieldService';

vi.mock('../../../services/adminReservationService', () => ({
  adminReservationService: {
    getAll: vi.fn(),
    getStats: vi.fn(),
    cancel: vi.fn(),
    refund: vi.fn(),
  }
}));

vi.mock('../../../services/fieldService', () => ({
  fieldService: {
    getAll: vi.fn(),
    getAvailability: vi.fn(),
  }
}));

globalThis.URL.createObjectURL = vi.fn() as any;
globalThis.URL.revokeObjectURL = vi.fn() as any;

describe('AdminReservierungen Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReservations = [
    {
      id: 1,
      confirmationCode: 'RES-123',
      startTime: '2025-10-10T10:00:00Z',
      endTime: '2025-10-10T11:00:00Z',
      durationMinutes: 60,
      fieldName: 'Main Field',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      totalPrice: 60,
      customerName: 'John Admin',
      customerEmail: 'admin@test.com',
      customerPhone: '123456',
    }
  ];

  const mockStats = {
    totalReservations: 100,
    changePercent: 5,
    cancelRate: 2,
    prevCancelRate: 3,
    popularTimeSlot: '18:00',
    revenueProjection: 5000,
    revenueChangePercent: 10,
    weeklyBookings: [],
    monthlyBookings: [],
    fieldUtilization: []
  };

  it('renders loading initially and fetches data', async () => {
    vi.mocked(adminReservationService.getAll).mockReturnValue(new Promise(() => {}));
    vi.mocked(adminReservationService.getStats).mockReturnValue(new Promise(() => {}));

    render(
      <HelmetProvider>
        <AdminReservierungen />
      </HelmetProvider>
    );

    expect(screen.queryByText('Alle Reservierungen')).not.toBeInTheDocument();
  });

  it('renders reservations and stats', async () => {
    vi.mocked(adminReservationService.getAll).mockResolvedValueOnce({ data: { data: mockReservations } } as any);
    vi.mocked(adminReservationService.getStats).mockResolvedValueOnce({ data: { data: mockStats } } as any);

    render(
      <HelmetProvider>
        <AdminReservierungen />
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Alle Reservierungen')).toBeInTheDocument();
      expect(screen.getAllByText('RES-123').length).toBeGreaterThan(0);
      expect(screen.getAllByText('John Admin').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Main Field').length).toBeGreaterThan(0);
    });
  });

  it('renders error state on fetch failure', async () => {
    vi.mocked(adminReservationService.getAll).mockRejectedValueOnce({
        response: { data: { message: 'Failed to load' } }
    });
    vi.mocked(adminReservationService.getStats).mockRejectedValueOnce(new Error());

    render(
      <HelmetProvider>
        <AdminReservierungen />
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fehler beim Laden')).toBeInTheDocument();
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });
});
